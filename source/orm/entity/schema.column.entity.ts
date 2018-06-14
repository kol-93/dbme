import {Column, Entity, JoinColumn, JoinTable, ManyToOne, PrimaryColumn} from 'typeorm';
import {DATA_TYPE} from '../../enum/e.data.type';
import {SchemaTableEntity} from './schema.table.entity';

@Entity({
    name: 'columns',
    schema: 'information_schema',
    synchronize: false,
    orderBy: {
        tableCatalog: 'ASC',
        tableSchema: 'ASC',
        tableName: 'ASC',
        ordinalPosition: 'ASC',
    }
})
export class SchemaColumnEntity {

    @PrimaryColumn({ type: 'varchar', length: 256, name: 'table_catalog' })
    tableCatalog: string;

    @PrimaryColumn({ type: 'varchar', length: 256, name: 'table_schema' })
    tableSchema: string;

    @PrimaryColumn({ type: 'varchar', length: 256, name: 'table_name' })
    tableName: string;

    @PrimaryColumn({ type: 'varchar', length: 256, name: 'column_name' })
    columnName: string;

    @Column({ type: 'integer', name: 'ordinal_position' })
    ordinalPosition: number;

    @Column({ type: 'varchar', length: 256, name: 'column_default' })
    columnDefault: string;

    @Column({ type: 'varchar', length: 256, name: 'is_nullable' })
    isNullable: 'YES' | 'NO';

    @Column({ type: 'varchar', length: 256, name: 'data_type' })
    dataType: DATA_TYPE;

    @Column({ type: 'integer', name: 'character_maximum_length' })
    characterMaximumLength?: number;

    @ManyToOne(type => SchemaTableEntity, table => table.columns)
    @JoinColumn([
        {
            name: 'table_catalog',
            referencedColumnName: 'tableCatalog'
        },
        {
            name: 'table_schema',
            referencedColumnName: 'tableSchema'
        },
        {
            name: 'table_name',
            referencedColumnName: 'tableName'
        },
    ])
    table: SchemaTableEntity;

}
