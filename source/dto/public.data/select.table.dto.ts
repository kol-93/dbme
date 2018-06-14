import {IsArray, IsIn, IsOptional, IsString} from 'class-validator';

export class OrderByDto {
    @IsString()
    columnName: string;

    @IsOptional()
    @IsIn(['ASC', 'DESC'])
    order?: 'ASC' | 'DESC';

    @IsOptional()
    @IsIn(['FIRST', 'LAST'])
    nulls: 'FIRST' | 'LEST';
}

export class SelectTableDto {
    @IsString()
    tableName: string;

    /// @todo ArrayOf()
    @IsOptional()
    @IsArray()
    orderBy?: OrderByDto[];
}
