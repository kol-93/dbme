import {Injectable} from '@nestjs/common';
import {Connection, ConnectionOptions, createConnection, DefaultNamingStrategy} from 'typeorm';
import {EncryptedTokenEntity} from '../orm/entity/encrypted.token.entity';
import {RoleAccessEntity} from '../orm/entity/role.access.entity';
import {SchemaColumnEntity} from '../orm/entity/schema.column.entity';
import {SchemaConstraintColumnUsageEntity} from '../orm/entity/schema.constraint.column.usage.entity';
import {SchemaTableConstraintEntity} from '../orm/entity/schema.table.constraint.entity';
import {SchemaTableEntity} from '../orm/entity/schema.table.entity';
import {SessionEntity} from '../orm/entity/session.entity';
import {UserEntity} from '../orm/entity/user.entity';
import {UserRoleEntity} from '../orm/entity/user.role.entity';
import {VisualKeyEntity} from '../orm/entity/visual.key.entity';

function stringifyArgs(...args: any[]): string {
    return args.map((arg) => JSON.stringify(arg)).join(', ');
}

function underscoreCase(name: string): string {
    return name
        .replace(/\.?([A-Z]+)/g, (x,y) => "_" + y.toLowerCase())
        .replace(/^_/, "");
}

class UnderscoreNamingStrategy extends DefaultNamingStrategy {
    public name: string;

    public constructor(name: string) {
        super();
        this.name = name;
    }

    columnName(propertyName: string, customName: string, embeddedPrefixes: string[]): string {
        // console.info(`columnName(${stringifyArgs(...arguments)})`);
        return super.columnName(propertyName, customName || underscoreCase(propertyName), embeddedPrefixes);
    }

    tableName(targetName: string, userSpecifiedName: string | undefined): string {
        // console.info(`tableName(${stringifyArgs(...arguments)})`);
        return super.tableName(targetName, userSpecifiedName || underscoreCase(targetName));
    }

    joinColumnName(relationName: string, referencedColumnName: string): string {
        // console.info(`joinColumnName(${stringifyArgs(...arguments)})`);
        return underscoreCase(relationName) + '_' + underscoreCase(referencedColumnName);
    }
}

@Injectable()
export class ConnectionProvider {
    private _connection?: Promise<Connection>;

    public readonly connectionOptions = {
            type: 'postgres',
            host: '127.0.0.1',
            port: 5432,
            username: 'postgres',
            database: 'test',
            synchronize: true,
            entities: [
                EncryptedTokenEntity,
                RoleAccessEntity,
                SessionEntity,
                UserEntity,
                UserRoleEntity,
                VisualKeyEntity,

                SchemaTableEntity,
                SchemaColumnEntity,
                SchemaConstraintColumnUsageEntity,
                SchemaTableConstraintEntity,
            ],
            namingStrategy: new UnderscoreNamingStrategy('underscore'),
    } as ConnectionOptions;

    public constructor() {
        this.connection.catch((error) => {
            console.error(error);
        });
    }

    public get connection(this: ConnectionProvider): Promise<Connection> {
        if (!this._connection) {
            this._connection = createConnection(this.connectionOptions);
        }
        return this._connection;
    }
}
