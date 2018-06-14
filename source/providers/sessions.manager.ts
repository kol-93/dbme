import {SelectQueryBuilder} from 'typeorm';
import * as uuid from 'uuid';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {ACCESS_RIGHT} from '../enum/e.access.right';
import {IJWTAccessPayload, IJWTRefreshPayload} from '../interfaces/jwt.payload.interface';
import {IUser} from '../interfaces/user.interface';
import {IUserRole} from '../interfaces/user.role.interface';
import {SessionEntity} from '../orm/entity/session.entity';
import {UserEntity} from '../orm/entity/user.entity';
import {isProductionEnv} from '../util/env.util';
import {ConnectionProvider} from './connection.provider';

@Injectable()
export class SessionsManager {
    public static get SessionTimeOut() {
        return isProductionEnv() ? (2 * 60 * 60 * 1000) : (10 * 60 * 60 * 1000);
    }

    public constructor(private readonly connectionManager: ConnectionProvider) {}

    private async _selectQuery(this: SessionsManager): Promise<SelectQueryBuilder<SessionEntity>> {
        const {connection} = this.connectionManager;
        const repo = (await connection).getRepository(SessionEntity);
        return repo.createQueryBuilder('session')
            .innerJoinAndSelect('session.user', 'user')
            .innerJoinAndSelect('user.role', 'role')
            .leftJoinAndSelect('role.rights', 'right');
    }

    public async get(id: string): Promise<SessionEntity> {
        const sessions = await (await this._selectQuery())
            .where('session.uuid = :session AND session.expires > NOW()', { session: id })
            .getMany();
        switch (sessions.length) {
        case 0:
            throw new UnauthorizedException('Invalid session');
        case 1:
            return sessions[0];
        default:
            throw new UnauthorizedException('Too many sessions found!');
        }
    }

    public async buildPayload(this: SessionsManager, session: SessionEntity): Promise<IUser> {
        const role: IUserRole = {
            id: session.user.role.id,
            name: session.user.role.name,
            rights: {},
        };
        for (let key in ACCESS_RIGHT) {
            const name = ACCESS_RIGHT[key] as ACCESS_RIGHT;
            role.rights[name] = session.user.role.defaultPolicy;
        }
        for (let right of session.user.role.rights || []) {
            role.rights[right.policy] = right.value;
        }
        return {
            session: session.uuid,
            login: session.user.login,
            name: session.user.name,
            role: role,
        };
    }

    public async validate(this: SessionsManager, payload: IJWTAccessPayload): Promise<SessionEntity> {
        const sessions = await (await this._selectQuery())
            .where(
                'session.uuid = :session AND user.login = :login AND session.accessKey = :accessKey AND session.expires > NOW()',
                payload,
            )
            .getMany();
        switch (sessions.length) {
        case 0:
            throw new UnauthorizedException('Invalid user login and/or token');
        case 1:
            if (sessions[0].accessKey === payload.accessKey) {
                return sessions[0];
            } else {
                throw new UnauthorizedException('Hacked!');
            }
        default:
            throw new UnauthorizedException('Too many sessions found!');
        }
    }

    public async refresh(this: SessionsManager, payload: IJWTRefreshPayload): Promise<SessionEntity> {
        const {connection} = this.connectionManager;
        const repo = (await connection).getRepository(SessionEntity);
        const sessions = await (await this._selectQuery())
            .where('session.uuid = :session AND user.login = :login AND session.expires > NOW()', payload)
            .getMany();
        switch (sessions.length) {
        case 0:
            throw new UnauthorizedException('Invalid user login and/or token');
        case 1:
            if (sessions[0].refreshKey === payload.refreshKey) {
                return await repo.save(
                    Object.assign(
                        sessions[0],
                        {
                            accessKey: uuid.v4(),
                            refreshKey: uuid.v4(),
                            expires: new Date(Date.now() + SessionsManager.SessionTimeOut),
                        } as Partial<SessionEntity>,
                    )
                );
            } else {
                throw new UnauthorizedException('Hacked!');
            }
        default:
            throw new UnauthorizedException('Too many sessions found!');
        }
    }

    public async create(this: SessionsManager, user: UserEntity): Promise<SessionEntity> {
        const {connection} = this.connectionManager;
        const repo = (await connection).getRepository(SessionEntity);
        const session = repo.create({
            accessKey: uuid.v4(),
            refreshKey: uuid.v4(),
            user: user,
            expires: new Date(Date.now() + SessionsManager.SessionTimeOut),
        });
        return await repo.save(session);
    }

    public async drop(this: SessionsManager, session: SessionEntity): Promise<void> {
        const {connection} = this.connectionManager;
        const repo = (await connection).getRepository(SessionEntity);
        Object.assign(
            session,
            {
                expires: new Date(),
            } as Partial<SessionEntity>,
        );
        await repo.save(session);
    }
}
