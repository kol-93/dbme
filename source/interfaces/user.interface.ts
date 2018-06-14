import {IUserRole} from './user.role.interface';

export interface IUser {
    session                             : string;
    login                               : string;
    name                                : string;
    role                                : IUserRole;
}
