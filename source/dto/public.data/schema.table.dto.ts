import {IsArray, IsString} from 'class-validator';
import {ISchemaColumn, ISchemaTable} from '../../interfaces/public.data/schema.table.interface';

export class SchemaTableDto implements ISchemaTable {
    @IsString()
    name: string;

    /// @todo IsArrayOf
    @IsArray()
    columns: ISchemaColumn[];

    /// @todo IsArrayOf
    @IsArray()
    primaryKey: string[];
}
