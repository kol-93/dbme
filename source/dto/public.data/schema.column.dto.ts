import {IsBoolean, IsIn, IsNumber, IsOptional, IsPositive, IsString} from 'class-validator';
import {DATA_TYPE} from '../../enum/e.data.type';
import {ISchemaColumn} from '../../interfaces/public.data/schema.table.interface';

export class SchemaColumnDto implements ISchemaColumn {
    @IsOptional()
    @IsString()
    defaultValue? : string;

    @IsBoolean()
    valueNullable: boolean;

    @IsIn(Object.values(DATA_TYPE))
    valueType: DATA_TYPE;


    @IsOptional()
    @IsNumber()
    @IsPositive()
    maximumLength?: number;

    @IsString()
    columnName: string;
}
