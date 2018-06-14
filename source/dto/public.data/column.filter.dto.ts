import {IsString} from 'class-validator';

export class ColumnFilterDto {
    @IsString()
    columnName: string;

    columnValue: any;
}
