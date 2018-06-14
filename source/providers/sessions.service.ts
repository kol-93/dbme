import * as jwt from 'jsonwebtoken';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {IAuthResponse} from '../interfaces/auth/auth.response.interface';
import {IClassicCredentials, IVisualKeyCredentials} from '../interfaces/auth/auth.credentials.interface';
import {IEncryptedUserToken} from '../interfaces/auth/user.token.interface';
import {IJWTAccessPayload, IJWTRefreshPayload} from '../interfaces/jwt.payload.interface';
import {IUser} from '../interfaces/user.interface';
import {SessionsManager} from './sessions.manager';
import {UsersManager} from './users.manager';
import {SessionEntity} from '../orm/entity/session.entity';
import {JWTKeysProvider} from './jwt.keys.provider';

@Injectable()
export class SessionsService {
    // private _

    public constructor(
        private readonly usersManager: UsersManager,
        private readonly sessionsManager: SessionsManager,
        private readonly keysProvider: JWTKeysProvider
    ) {}

    protected async _buildAuthResponse(this: SessionsService, session: SessionEntity): Promise<IAuthResponse> {
        const now = Date.now();
        const sessionExpiresIn = (session.expires.valueOf() - now) / 1000;
        const accessExpiresIn = Math.floor(sessionExpiresIn * 0.5); /// @todo environment constant
        const refreshExpiresIn = Math.floor(sessionExpiresIn);
        const payload = await this.sessionsManager.buildPayload(session);
        const accessToken = jwt.sign({ ...payload, accessKey: session.accessKey }, this.keysProvider.EncryptionKey, { expiresIn: accessExpiresIn });
        const refreshToken = jwt.sign({ ...payload, refreshKey: session.refreshKey }, this.keysProvider.EncryptionKey, { expiresIn: refreshExpiresIn });
        return {
            accessExpiresIn,
            refreshExpiresIn,
            accessToken,
            refreshToken,
            user: payload,
        };
    }

    public async validateUser(payload: IJWTAccessPayload): Promise<IUser> {
        await this.sessionsManager.validate(payload);
        return payload;
    }

    public async signInByPassword(credentials: IClassicCredentials): Promise<IAuthResponse> {
        const {login, password} = credentials;
        const user = await this.usersManager.getByPassword(login, password);
        const session = await this.sessionsManager.create(user);
        return this._buildAuthResponse(session);
    }

    public async signInByVisualKey(credentials: IVisualKeyCredentials): Promise<IAuthResponse> {
        const {login, visualKey} = credentials;
        const user = await this.usersManager.getByVisualKey(login, visualKey);
        const session = await this.sessionsManager.create(user);
        return this._buildAuthResponse(session);

    }

    public async signInByToken(credentials: IEncryptedUserToken): Promise<IAuthResponse> {
        const user = await this.usersManager.getByEncryptedToken(credentials);
        const session = await this.sessionsManager.create(user);
        return this._buildAuthResponse(session);
    }

    public async logOut(payload: IJWTAccessPayload): Promise<void> {
        const session = await this.sessionsManager.get(payload.session);
        if (session) {
            await this.sessionsManager.drop(session);
        } else {
            throw new UnauthorizedException('Not logged in');
        }
    }

    public async refresh(token: string): Promise<IAuthResponse> {
        const refreshPayload = jwt.decode(token) as IJWTRefreshPayload;
        const session = await this.sessionsManager.refresh(refreshPayload);
        return this._buildAuthResponse(session);
    }
}
