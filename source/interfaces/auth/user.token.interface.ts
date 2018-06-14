export interface IClearUserToken {
    login                               : string;
    created                             : number;
}

export interface IEncryptedUserToken {
    uuid                                : string;
    payload                             : string;
}
