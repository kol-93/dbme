import {IsArray, IsString} from 'class-validator';
import {ISchemaColumn, ISchemaTable} from '../../interfaces/public.data/schema.table.interface';

export class SchemaTableDto implements ISchemaTable {
    @IsString()
    tableName: string;

    /// @todo IsArrayOf
    @IsArray()
    columns: ISchemaColumn[];

    /// @todo IsArrayOf
    @IsArray()
    primaryKey: string[];
}
