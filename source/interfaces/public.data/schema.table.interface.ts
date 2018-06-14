import {DATA_TYPE} from '../../enum/e.data.type';

export interface ISchemaColumn {
    defaultValue? : string;
    valueNullable: boolean;
    valueType: DATA_TYPE;
    maximumLength?: number;
    columnName: string;
}

export interface ISchemaTable {
    tableName: string;
    columns: ISchemaColumn[];
    primaryKey: string[];
}

export interface IDatabaseSchema {
    [ tableName: string ]: ISchemaTable;
}
