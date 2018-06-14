import {IsArray, IsJSON, IsString} from 'class-validator';
import {ColumnFilterDto} from './column.filter.dto';

export class InsertRowDto {
    @IsString()
    tableName: string;

    /// @todo ArrayOf()
    @IsArray()
    values: ColumnFilterDto[];
}
