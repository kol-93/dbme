import {Injectable} from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {IJWTAccessPayload} from '../interfaces/jwt.payload.interface';
import {IUser} from '../interfaces/user.interface';
import {JWTKeysProvider} from '../providers/jwt.keys.provider';
import {SessionsService} from '../providers/sessions.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {


    public constructor(
        private readonly sessionsService: SessionsService,
        private readonly keysProvider: JWTKeysProvider
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: keysProvider.DecryptionKey,
        });
    }

    async validate(payload: IJWTAccessPayload, done: (error: Error | null, user: IUser | null) => void) {
        try {
            done(null, await this.sessionsService.validateUser(payload));
        } catch (error) {
            done(error, null);
        }
    }
}
