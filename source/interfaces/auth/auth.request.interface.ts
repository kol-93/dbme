import {IncomingMessage} from 'http';
import {IJWTAccessPayload} from '../jwt.payload.interface';

export interface IAuthRequest extends IncomingMessage {
    user: IJWTAccessPayload;
}
