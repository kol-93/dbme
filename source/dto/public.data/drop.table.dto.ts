import {IsString} from 'class-validator';

export class DropTableDto {
    @IsString()
    tableName: string;
}
