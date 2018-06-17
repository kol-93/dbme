import {IsArray, IsOptional, IsString} from 'class-validator';
import {SchemaColumnDto} from './schema.column.dto';

export class AlterTableDto {
    @IsString()
    tableName: string;

    @IsOptional()
    @IsArray() /// @todo IsArrayOf
    drop: string[];

    @IsOptional()
    @IsArray() /// @todo IsArrayOf
    add: SchemaColumnDto[];
}
