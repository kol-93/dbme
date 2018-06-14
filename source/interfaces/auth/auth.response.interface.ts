import {IUser} from '../user.interface';

export interface IAuthResponse {
    accessExpiresIn                     : number;
    refreshExpiresIn                    : number;
    accessToken                         : string;
    refreshToken                        : string;
    user                                : IUser;
}