import {ISchemaColumn} from '../interfaces/public.data/schema.table.interface';

export function escapeIdentifier(str: string) {
    let escaped = '"';
    for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (c === '"') {
            escaped += c + c;
        } else {
            escaped += c;
        }
    }
    escaped += '"';
    return escaped;
}

export function escapeLiteral(str: string) {
    let hasBackslash = false;
    let escaped = '\'';
    for (let i = 0; i < str.length; i++) {
        const c = str[i];
        if (c === '\'') {
            escaped += c + c;
        } else if (c === '\\') {
            escaped += c + c;
            hasBackslash = true;
        } else {
            escaped += c;
        }
    }

    escaped += '\'';

    if (hasBackslash) {
        escaped = ' E' + escaped;
    }

    return escaped;
}

export function escapeValue(value: any): string {
    if (value === null || value === undefined) {
        return 'NULL';
    } else if (typeof value === 'number' || typeof value === 'boolean') {
        return value.toString();
    } else if (typeof value === 'string') {
        return escapeLiteral(value)
    } else {
        return escapeLiteral(value.toString());
    }
}

export function escapeWhere(columnName: string, columnValue: any): string {
    const escapedValue = escapeValue(columnValue);
    if (escapedValue === 'NULL') {
        return `${escapeIdentifier(columnName)} IS NULL`;
    } else {
        return `${escapeIdentifier(columnName)} = ${escapedValue}`;
    }
}

export function escapeSet(columnName: string, columnValue: any): string {
    const escapedValue = escapeValue(columnValue);
    return `${escapeIdentifier(columnName)} = ${escapedValue}`;
}

export function defineColumn(columnDefinition: ISchemaColumn, isPrimary: boolean): string {
    const {columnName, valueType, maximumLength, valueNullable, defaultValue} = columnDefinition;
    const definition: string[] = [
        escapeIdentifier(columnName),
        valueType + (maximumLength !== undefined ? `(${maximumLength})` : ''),
        valueNullable ? 'NULL' : 'NOT NULL',
        isPrimary ? 'PRIMARY KEY' : '',
        defaultValue !== undefined ? `DEFAULT ${escapeValue(defaultValue)}` : ''
    ];
    return definition.filter((value) => value !== '').join(' ');
}
