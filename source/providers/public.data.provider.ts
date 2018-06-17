import {BadRequestException, Injectable, InternalServerErrorException} from '@nestjs/common';
import {HttpException} from '@nestjs/common/exceptions/http.exception';
import {ColumnFilterDto} from '../dto/public.data/column.filter.dto';
import {OrderByDto} from '../dto/public.data/select.table.dto';
import {DATA_TYPE} from '../enum/e.data.type';
import {IDatabaseSchema, ISchemaColumn, ISchemaTable} from '../interfaces/public.data/schema.table.interface';
import {SchemaTableEntity} from '../orm/entity/schema.table.entity';
import {all, map} from '../util/func.util';
import {defineColumn, escapeIdentifier, escapeLiteral, escapeSet, escapeValue, escapeWhere} from '../util/query.util';
import {ConnectionProvider} from './connection.provider';

@Injectable()
export class PublicDataProvider {
    private _schema?: Promise<IDatabaseSchema>;

    private async _getSchema(this: PublicDataProvider): Promise<IDatabaseSchema> {
        const {connection} = this.connectionProvider;
        const tableRepo = (await connection).getRepository(SchemaTableEntity);
        // const constraintsRepo = (await connection).getRepository(SchemaTableConstraintEntity);

        const tablesRaw = await tableRepo.createQueryBuilder('table')
            .leftJoinAndSelect('table.columns', 'column')
            .leftJoinAndSelect('table.constraints', 'constraint')
            .leftJoinAndSelect('constraint.usedColumns', 'usedColumn')
            .where(
                'table.tableCatalog = :tableCatalog AND table.tableSchema = :tableSchema AND table.tableType = :tableType AND (constraint.constraintType = :constraintType OR constraint.constraintType IS NULL)',
                {
                    tableCatalog: this.databaseName,
                    tableSchema: this.schemaName,
                    tableType: 'BASE TABLE',
                    constraintType: 'PRIMARY KEY',
                },
            )
            .orderBy('table.tableName', 'ASC')
            .orderBy('column.ordinalPosition', 'ASC', 'NULLS FIRST')
            .getMany();

        const result: IDatabaseSchema = {};
        for (let table of tablesRaw) {
            const constraint = table.constraints!.find((constraint) => constraint.constraintType === 'PRIMARY KEY');
            result[table.tableName] = {
                tableName: table.tableName,
                columns: table.columns!.map((column) => ({
                    defaultValue: column.columnDefault !== null ? column.columnDefault : undefined,
                    valueNullable: column.isNullable === 'YES',
                    valueType: column.dataType,
                    maximumLength: column.characterMaximumLength !== null ? column.characterMaximumLength : undefined,
                    columnName: column.columnName,
                })),
                primaryKey: constraint ? constraint.usedColumns!.map((column) => column.columnName) : [],
            };
        }

        return result;
    }

    public readonly schemaName: string = 'public';

    public get databaseName(this: PublicDataProvider): string {
        return this.connectionProvider.connectionOptions.database as string;
    }

    public constructor(private readonly connectionProvider: ConnectionProvider) {

    }

    public get schema(this: PublicDataProvider): Promise<IDatabaseSchema> {
        if (!this._schema) {
            this._schema = this._getSchema();
        }
        return this._schema;
    }

    public refreshSchema(this: PublicDataProvider): Promise<IDatabaseSchema> {
        return this._schema = this._getSchema();
    }

    public async selectTable(this: PublicDataProvider, tableName: string, orders: OrderByDto[]): Promise<any> {
        const databaseSchema = await this.schema;
        const tableSchema = databaseSchema[tableName];
        if (tableSchema) {
            for (let orderBy of orders) {
                if (!tableSchema.columns.find((column) => column.columnName === orderBy.columnName)) {
                    throw new BadRequestException(`Invalid column ${escapeIdentifier(tableName)}.${escapeIdentifier(orderBy.columnName)}`);
                }
            }
            const ordering = orders.length
                ? 'ORDER BY ' + orders.map((orderBy) => `${escapeIdentifier(orderBy.columnName)} ${orderBy.order || 'ASC'} NULLS ${orderBy.nulls || 'FIRST'}`).join(', ')
                : '';
            const connection = await this.connectionProvider.connection;
            return await connection.query(`SELECT * FROM public.${escapeIdentifier(tableName)} ${ordering}`);
        } else {
            throw new BadRequestException(`Invalid table ${escapeIdentifier(tableName)}`);
        }
    }

    public async truncateTable(this: PublicDataProvider, tableName: string): Promise<void> {
        const databaseSchema = await this.schema;
        const tableSchema = databaseSchema[tableName];
        if (tableSchema) {
            const connection = await this.connectionProvider.connection;
            await connection.query(`TRUNCATE public.${escapeIdentifier(tableName)}`);
        } else {
            throw new BadRequestException(`Invalid table ${escapeIdentifier(tableName)}`);
        }
    }

    public async selectRow(this: PublicDataProvider, tableName: string, filter: ColumnFilterDto[]): Promise<any> {
        const databaseSchema = await this.schema;
        const tableSchema = databaseSchema[tableName];
        if (tableSchema) {
            const primaryKey = new Set(tableSchema.primaryKey);
            const filterColumns = new Set(filter.map((column) => column.columnName));
            for (let key of primaryKey) {
                if (!filterColumns.has(key)) {
                    throw new BadRequestException(`Filter for column ${escapeIdentifier(tableName)}.${escapeIdentifier(key)} is not specified`);
                }
            }
            for (let key of filterColumns) {
                if (!primaryKey.has(key)) {
                    throw new BadRequestException(`Invalid column ${escapeIdentifier(tableName)}.${escapeIdentifier(key)} specified`);
                }
            }
            const connection = await this.connectionProvider.connection;
            const filterQuery = filter
                .map((filterColumn) => escapeWhere(filterColumn.columnName, filterColumn.columnValue))
                .join(' AND ');
            const data = await connection.query(`SELECT * FROM public.${escapeIdentifier(tableName)} WHERE ${filterQuery ? filterQuery : 'true'}`) as any[];
            switch (data.length) {
            case 0:
                return null;
            case 1:
                return data[0];
            default:
                throw new BadRequestException('Data is not unique!');
            }
        } else {
            throw new BadRequestException(`Invalid table ${escapeIdentifier(tableName)}`);
        }
    }

    public async deleteRow(this: PublicDataProvider, tableName: string, filter: ColumnFilterDto[]): Promise<void> {
        const databaseSchema = await this.schema;
        const tableSchema = databaseSchema[tableName];
        if (tableSchema) {
            const primaryKey = new Set(tableSchema.primaryKey);
            const filterColumns = new Set(filter.map((column) => column.columnName));
            for (let key of primaryKey) {
                if (!filterColumns.has(key)) {
                    throw new BadRequestException(`Filter for column ${escapeIdentifier(tableName)}.${escapeIdentifier(key)} is not specified`);
                }
            }
            for (let key of filterColumns) {
                if (!primaryKey.has(key)) {
                    throw new BadRequestException(`Invalid column ${escapeIdentifier(tableName)}.${escapeIdentifier(key)} specified`);
                }
            }
            const connection = await this.connectionProvider.connection;
            const filterQuery = filter
                .map((filterColumn) => escapeWhere(filterColumn.columnName, filterColumn.columnValue))
                .join(' AND ');
            await connection.query(`DELETE FROM public.${escapeIdentifier(tableName)} WHERE ${filterQuery ? filterQuery : 'true'}`);
        } else {
            throw new BadRequestException(`Invalid table ${escapeIdentifier(tableName)}`);
        }
    }

    public async updateRow(this: PublicDataProvider, tableName: string, filter: ColumnFilterDto[], values: ColumnFilterDto[]): Promise<any> {
        const databaseSchema = await this.schema;
        const tableSchema = databaseSchema[tableName];
        if (tableSchema) {
            const primaryKey = new Set(tableSchema.primaryKey);
            const filterColumns = new Set(filter.map((column) => column.columnName));
            const expectedColumns = new Set(tableSchema.columns.map((column) => column.columnName));
            for (let key of primaryKey) {
                if (!filterColumns.has(key)) {
                    throw new BadRequestException(`Filter for column ${escapeIdentifier(tableName)}.${escapeIdentifier(key)} is not specified!`);
                }
            }
            for (let key of filterColumns) {
                if (!primaryKey.has(key)) {
                    throw new BadRequestException(`Invalid column ${escapeIdentifier(tableName)}.${escapeIdentifier(key)} specified!`);
                }
            }
            for (let column of values) {
                if (!expectedColumns.has(column.columnName)) {
                    throw new BadRequestException(`Unexpected column ${escapeIdentifier(tableName)}.${escapeIdentifier(column.columnName)}`);
                }
            }
            const connection = await this.connectionProvider.connection;
            const filterQuery = filter
                .map((filterColumn) => escapeWhere(filterColumn.columnName, filterColumn.columnValue))
                .join(' AND ');

            const updateQuery = values
                .map((column) => escapeSet(column.columnName, column.columnValue))
                .join(', ');

            const data = await connection.query(`UPDATE public.${escapeIdentifier(tableName)} SET ${updateQuery} WHERE ${filterQuery ? filterQuery : 'true'} RETURNING *`) as any[];
            switch (data.length) {
            case 0:
                return null;
            case 1:
                return data[0];
            default:
                throw new BadRequestException('Data is not unique!');
            }
        } else {
            throw new BadRequestException(`Invalid table ${escapeIdentifier(tableName)}`);
        }
    }

    public async insertRow(this: PublicDataProvider, tableName: string, values: ColumnFilterDto[]): Promise<any> {
        const databaseSchema = await this.schema;
        const tableSchema = databaseSchema[tableName];
        if (tableSchema) {
            const expectedColumns = new Set(tableSchema.columns.map((column) => column.columnName));
            const columns = new Set(values.map((column) => column.columnName));
            for (let column of values) {
                if (!expectedColumns.has(column.columnName)) {
                    throw new BadRequestException(`Unexpected column ${escapeIdentifier(tableName)}.${escapeIdentifier(column.columnName)}`);
                }
            }
            for (let column of tableSchema.columns) {
                if (!column.valueNullable && column.defaultValue === undefined && !columns.has(column.columnName)) {
                    throw new BadRequestException(`Column ${escapeIdentifier(tableName)}.${escapeIdentifier(column.columnName)} is required!`);
                }
            }
            const connection = await this.connectionProvider.connection;

            const columnNames = values.map((column) => escapeIdentifier(column.columnName)).join(', ');
            const columnValues = values.map((column) => escapeValue(column.columnValue)).join(', ');

            const data = await connection.query(`INSERT INTO public.${escapeIdentifier(tableName)} (${columnNames}) VALUES (${columnValues}) RETURNING *`) as any[];
            switch (data.length) {
            case 0:
                return null;
            case 1:
                return data[0];
            default:
                throw new BadRequestException('Data is not unique!');
            }
        } else {
            throw new BadRequestException(`Invalid table ${escapeIdentifier(tableName)}`);
        }
    }

    public async createTable(this: PublicDataProvider, tableSchema: ISchemaTable): Promise<void> {
        const databaseSchema = await this.schema;
        const existingTableSchema = databaseSchema[tableSchema.tableName];
        if (!existingTableSchema) {
            const primaryKeyColumns = new Set(tableSchema.primaryKey);
            const columns = tableSchema.columns
                .map(
                    (columnDefinition) =>
                        defineColumn(columnDefinition, primaryKeyColumns.has(columnDefinition.columnName)),
                );
            await (
                (await this.connectionProvider.connection)
                    .query(`CREATE TABLE ${escapeIdentifier(tableSchema.tableName)} (${columns.join(', ')});`)
            );
        } else {
            throw new BadRequestException(`Table ${escapeIdentifier(tableSchema.tableName)} is already exists`);
        }
    }

    public async dropTable(this: PublicDataProvider, tableName: string): Promise<void> {
        const databaseSchema = await this.schema;
        const existingTableSchema = databaseSchema[tableName];
        if (existingTableSchema) {
            await (
                (await this.connectionProvider.connection)
                    .query(`DROP TABLE ${escapeIdentifier(tableName)};`)
            );
        } else {
            throw new BadRequestException(`Table ${escapeIdentifier(tableName)} does not exist`);
        }
    }

    public async alterTable(this: PublicDataProvider, tableName: string, dropColumns: string[], addColumns: ISchemaColumn[]): Promise<void> {
        const databaseSchema = await this.schema;
        const existingTableSchema = databaseSchema[tableName];
        if (existingTableSchema) {
            const primaryKeyColumns = new Set(existingTableSchema.primaryKey);
            const existingColumns = new Set(existingTableSchema.columns.map((columnDefinition) => columnDefinition.columnName));

            const actions: string[] = [];

            actions.push(
                ...dropColumns.map((columnName) => {
                    if (primaryKeyColumns.has(columnName)) {
                        throw new BadRequestException(`Can't drop primary key column ${escapeIdentifier(tableName)}.${escapeIdentifier(columnName)}`);
                    }
                    if (existingColumns.has(columnName)) {
                        return `DROP COLUMN ${escapeIdentifier(columnName)}`;
                    } else {
                        throw new BadRequestException(`Column ${escapeIdentifier(tableName)}.${escapeIdentifier(columnName)} does not exist`);
                    }
                }),
            );

            actions.push(
                ...addColumns.map((columnDefinition) => {
                    if (!existingColumns.has(columnDefinition.columnName)) {
                        if (columnDefinition.defaultValue === undefined) {
                            switch (columnDefinition.valueType) {
                            case DATA_TYPE.SERIAL:
                            case DATA_TYPE.UUID:
                                break;
                            default:
                                throw new BadRequestException(`Column ${escapeIdentifier(tableName)}.${escapeIdentifier(columnDefinition.columnName)} must be nullable or have default value`);
                            }
                        }
                        return `ADD COLUMN ${defineColumn(columnDefinition, false)}`;
                    } else {
                        throw new BadRequestException(`Column ${escapeIdentifier(tableName)}.${escapeIdentifier(columnDefinition.columnName)} already exists`)
                    }
                }),
            );

            if (actions.length) {
                await (
                    (await this.connectionProvider.connection)
                        .query(`ALTER TABLE ${escapeIdentifier(tableName)} ${actions.join(', ')};`)
                );
            }
        } else {
            throw new BadRequestException(`Table ${escapeIdentifier(tableName)} does not exist`);
        }
    }
}
