import {IsArray} from 'class-validator';
import {ColumnFilterDto} from './column.filter.dto';
import {SelectRowDto} from './select.row.dto';

export class UpdateRowDto extends SelectRowDto {
    /// @todo IsArrayOf
    @IsArray()
    values: ColumnFilterDto[];
}
