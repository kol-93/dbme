import {IAccessRights} from './access.rights.interface';

export interface IUserRole {
    id                                  : number;
    name                                : string;
    rights                              : IAccessRights;
}
