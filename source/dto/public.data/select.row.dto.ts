import {IsArray, IsJSON, IsString} from 'class-validator';
import {ColumnFilterDto} from './column.filter.dto';

export class SelectRowDto {
    @IsString()
    tableName: string;

    /// @todo ArrayOf()
    @IsArray()
    filter: ColumnFilterDto[];
}
