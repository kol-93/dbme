import {
    Body,
    Controller,
    Get,
    HttpException,
    InternalServerErrorException,
    Param,
    Post,
    UseGuards,
} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {AlterTableDto} from '../dto/public.data/alter.table.dto';
import {DropTableDto} from '../dto/public.data/drop.table.dto';
import {InsertRowDto} from '../dto/public.data/insert.row.dto';
import {SchemaTableDto} from '../dto/public.data/schema.table.dto';
import {SelectRowDto} from '../dto/public.data/select.row.dto';
import {SelectTableDto} from '../dto/public.data/select.table.dto';
import {UpdateRowDto} from '../dto/public.data/update.row.dto';
import {
    CanAlterTablesGuard,
    CanCreateTablesGuard,
    CanDropTablesGuard,
    CanModifyDataGuard,
    CanReadDataGuard,
} from '../guards/role.guards';
import {IDatabaseSchema} from '../interfaces/public.data/schema.table.interface';
import {PublicDataProvider} from '../providers/public.data.provider';

@Controller('data')
export class PublicDataController {
    public constructor(private readonly publicDataProvider: PublicDataProvider) {}

    @Get('schema')
    @UseGuards(AuthGuard('jwt'))
    public getSchema(): Promise<IDatabaseSchema> {
        return this.publicDataProvider.schema;
    }

    @Post('select')
    @UseGuards(AuthGuard('jwt'), CanReadDataGuard)
    public selectTable(@Body() dto: SelectTableDto): Promise<any> {
        return this.publicDataProvider
            .selectTable(dto.tableName, dto.orderBy || [])
            .catch((exception) => {
                if (exception instanceof HttpException) {
                    throw exception;
                } else {
                    throw new InternalServerErrorException(exception.message);
                }
            })
    }


    @Post('row')
    @UseGuards(AuthGuard('jwt'), CanReadDataGuard)
    public selectRow(@Body() dto: SelectRowDto): Promise<any> {
        return this.publicDataProvider
            .selectRow(dto.tableName, dto.filter)
            .catch((exception) => {
                if (exception instanceof HttpException) {
                    throw exception;
                } else {
                    throw new InternalServerErrorException(exception.message);
                }
            });
    }

    @Post('update')
    @UseGuards(AuthGuard('jwt'), CanModifyDataGuard)
    public updateRow(@Body() dto: UpdateRowDto): Promise<any> {
        return this.publicDataProvider.updateRow(dto.tableName, dto.filter, dto.values)
            .catch((exception) => {
                if (exception instanceof HttpException) {
                    throw exception;
                } else {
                    throw new InternalServerErrorException(exception.message);
                }
            });
    }

    @Post('insert')
    @UseGuards(AuthGuard('jwt'), CanModifyDataGuard)
    public insertRow(@Body() dto: InsertRowDto): Promise<any> {
        return this.publicDataProvider.insertRow(dto.tableName, dto.values)
            .catch((exception) => {
                if (exception instanceof HttpException) {
                    throw exception;
                } else {
                    throw new InternalServerErrorException(exception.message);
                }
            });
    }

    @Post('delete')
    @UseGuards(AuthGuard('jwt'), CanModifyDataGuard)
    public deleteRow(@Body() dto: SelectRowDto): Promise<any> {
        return this.publicDataProvider.deleteRow(dto.tableName, dto.filter)
            .catch((exception) => {
                if (exception instanceof HttpException) {
                    throw exception;
                } else {
                    throw new InternalServerErrorException(exception.message);
                }
            });
    }

    @Post('truncate')
    @UseGuards(AuthGuard('jwt'), CanModifyDataGuard)
    public truncateTable(@Body() dto: SelectTableDto): Promise<any> {
        return this.publicDataProvider.truncateTable(dto.tableName)
            .catch((exception) => {
                if (exception instanceof HttpException) {
                    throw exception;
                } else {
                    throw new InternalServerErrorException(exception.message);
                }
            });
    }

    @Post('create')
    @UseGuards(AuthGuard('jwt'), CanCreateTablesGuard)
    public async createTable(@Body() dto: SchemaTableDto): Promise<any> {
        try {
            await this.publicDataProvider.createTable(dto);
            return await this.publicDataProvider.refreshSchema();
        } catch (exception) {
            if (exception instanceof HttpException) {
                throw exception;
            } else {
                throw new InternalServerErrorException(exception.message);
            }
        }
    }

    @Post('drop')
    @UseGuards(AuthGuard('jwt'), CanDropTablesGuard)
    public async dropTable(@Body() dto: DropTableDto): Promise<any> {
        try {
            await this.publicDataProvider.dropTable(dto.tableName);
            return await this.publicDataProvider.refreshSchema();
        } catch (exception) {
            if (exception instanceof HttpException) {
                throw exception;
            } else {
                throw new InternalServerErrorException(exception.message);
            }
        }
    }

    @Post('alter')
    @UseGuards(AuthGuard('jwt'), CanAlterTablesGuard)
    public async alterTable(@Body() dto: AlterTableDto): Promise<any> {
        try {
            await this.publicDataProvider.alterTable(dto.tableName, dto.drop || [], dto.add || []);
            return await this.publicDataProvider.refreshSchema();
        } catch (exception) {
            if (exception instanceof HttpException) {
                throw exception;
            } else {
                throw new InternalServerErrorException(exception.message);
            }
        }
    }
}
