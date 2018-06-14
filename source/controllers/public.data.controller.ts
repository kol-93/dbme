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
import {InsertRowDto} from '../dto/public.data/insert.row.dto';
import {SelectRowDto} from '../dto/public.data/select.row.dto';
import {SelectTableDto} from '../dto/public.data/select.table.dto';
import {UpdateRowDto} from '../dto/public.data/update.row.dto';
import {CanModifyDataGuard, CanReadDataGuard} from '../guards/role.guards';
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
                    throw new InternalServerErrorException(exception);
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
                    throw new InternalServerErrorException(exception);
                }
            });
    }

    @Post('update')
    @UseGuards(AuthGuard('jwt'), CanModifyDataGuard)
    public async updateRow(@Body() dto: UpdateRowDto): Promise<any> {
        return this.publicDataProvider.updateRow(dto.tableName, dto.filter, dto.values)
            .catch((exception) => {
                if (exception instanceof HttpException) {
                    throw exception;
                } else {
                    throw new InternalServerErrorException(exception);
                }
            });
    }

    @Post('insert')
    @UseGuards(AuthGuard('jwt'), CanModifyDataGuard)
    public async insertRow(@Body() dto: InsertRowDto): Promise<any> {
        return this.publicDataProvider.insertRow(dto.tableName, dto.values)
            .catch((exception) => {
                if (exception instanceof HttpException) {
                    throw exception;
                } else {
                    throw new InternalServerErrorException(exception);
                }
            });
    }

    @Post('delete')
    @UseGuards(AuthGuard('jwt'), CanModifyDataGuard)
    public async deleteRow(@Body() dto: SelectRowDto): Promise<any> {
        return this.publicDataProvider.deleteRow(dto.tableName, dto.filter)
            .catch((exception) => {
                if (exception instanceof HttpException) {
                    throw exception;
                } else {
                    throw new InternalServerErrorException(exception);
                }
            });
    }

    @Post('truncate')
    @UseGuards(AuthGuard('jwt'), CanModifyDataGuard)
    public async truncateTable(@Body() dto: SelectTableDto): Promise<any> {
        return this.publicDataProvider.truncateTable(dto.tableName)
            .catch((exception) => {
                if (exception instanceof HttpException) {
                    throw exception;
                } else {
                    throw new InternalServerErrorException(exception);
                }
            });
    }


}
