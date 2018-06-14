import * as crypto from 'crypto';

import {ForbiddenException, Injectable, UnauthorizedException} from '@nestjs/common';
import {ACCESS_RIGHT} from '../enum/e.access.right';
import {IUser} from '../interfaces/user.interface';
import {IClearUserToken, IEncryptedUserToken} from '../interfaces/auth/user.token.interface';
import {EncryptedTokenEntity} from '../orm/entity/encrypted.token.entity';
import {UserEntity} from '../orm/entity/user.entity';
import {ConnectionProvider} from './connection.provider';

@Injectable()
export class UsersManager {
    public constructor(private readonly connectionManager: ConnectionProvider) {}

    public async getByPassword(login: string, password: string): Promise<UserEntity> {
        const {connection} = this.connectionManager;
        const repo = (await connection).getRepository(UserEntity);
        const entity = await repo.findOne({ login, password }, { relations: ['role', 'role.rights' ] });
        if (entity !== undefined) {
            return entity;
        } else {
            throw new ForbiddenException('Invalid login and/or password');
        }
    }

    public async getByVisualKey(login: string, visualKey: string): Promise<UserEntity> {
        const {connection} = this.connectionManager;
        const repo = (await connection).getRepository(UserEntity);
        const users = await repo.createQueryBuilder('user')
            .innerJoinAndSelect('user.role', 'role')
            .innerJoinAndSelect('role.rights', 'right')
            .innerJoinAndSelect('user.visualKeys', 'key')
            .where('user.login = :login AND key.value = :visualKey', { login, visualKey })
            .getMany();
        switch (users.length) {
        case 0:
            throw new ForbiddenException('Invalid login and/or visual key');
        case 1:
        {
            const user = users[0];
            const canUseVisualKeyRight = (user.role.rights || []).find((right) => right.policy === ACCESS_RIGHT.CAN_USE_VISUAL_KEY);
            if (canUseVisualKeyRight ? canUseVisualKeyRight.value : user.role.defaultPolicy) {
                return user;
            } else {
                throw new ForbiddenException('Can not use visual keys');
            }
        }
        default:
            throw new ForbiddenException('Too many users found');
        }
    }

    public async getByEncryptedToken(encryptedToken: IEncryptedUserToken): Promise<UserEntity> {
        const {connection} = this.connectionManager;
        const tokensRepo = (await connection).getRepository(EncryptedTokenEntity);
        const usersRepo = (await connection).getRepository(UserEntity);
        const tokenEntity = await tokensRepo.findOne(encryptedToken.uuid);
        if (tokenEntity) {
            const {key, created} = tokenEntity;
            const clearToken = JSON.parse(crypto.publicDecrypt({ key }, Buffer.from(encryptedToken.payload, 'hex')).toString('utf8')) as IClearUserToken;
            if (clearToken.created === created.valueOf()) {
                const user = await usersRepo.findOne(clearToken.login, { relations: ['role', 'role.rights' ]});
                if (user) {
                    const canUseTokens = (user.role.rights || []).find((right) => right.policy === ACCESS_RIGHT.CAN_USE_ENCRYPTED_TOKEN);
                    if (canUseTokens ? canUseTokens.value : user.role.defaultPolicy) {
                        return user;
                    } else {
                        throw new ForbiddenException('Can not use encrypted tokens');
                    }
                }
            }
        }
        throw new ForbiddenException('Invalid token');
    }
}
