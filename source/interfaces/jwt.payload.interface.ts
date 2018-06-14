import {IUser} from './user.interface';

export interface IJWTAccessPayload extends IUser {
    accessKey                           : string;
}

export interface IJWTRefreshPayload extends IUser {
    refreshKey                          : string;
}
