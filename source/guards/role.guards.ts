import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {ACCESS_RIGHT} from '../enum/e.access.right';
import {IAuthRequest} from '../interfaces/auth/auth.request.interface';
import {all, map} from '../util/func.util';

export class AccessGuard implements CanActivate {
    private readonly _rights: ACCESS_RIGHT[];

    public constructor(rights: ACCESS_RIGHT[]) {
        this._rights = rights;
    }

    public canActivate(this: AccessGuard, context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest() as IAuthRequest;
        return request && request.user && all(map((x) => request.user.role.rights[x], this._rights));
    }
}

@Injectable()
export class CanUseVisualKeysGuard extends AccessGuard {
    public constructor() {
        super([ACCESS_RIGHT.CAN_USE_VISUAL_KEY]);
    }
}

@Injectable()
export class CanUseEncryptedTokenGuard extends AccessGuard {
    public constructor() {
        super([ACCESS_RIGHT.CAN_USE_ENCRYPTED_TOKEN]);
    }
}

@Injectable()
export class CanCreateTablesGuard extends AccessGuard {
    public constructor() {
        super([ACCESS_RIGHT.CAN_CREATE_TABLES]);
    }
}

@Injectable()
export class CanDropTablesGuard extends AccessGuard {
    public constructor() {
        super([ACCESS_RIGHT.CAN_DROP_TABLES]);
    }
}

@Injectable()
export class CanAlterTablesGuard extends AccessGuard {
    public constructor() {
        super([ACCESS_RIGHT.CAN_ALTER_TABLES]);
    }
}

@Injectable()
export class CanModifyDataGuard extends AccessGuard {
    public constructor() {
        super([ACCESS_RIGHT.CAN_DELETE, ACCESS_RIGHT.CAN_INSERT, ACCESS_RIGHT.CAN_UPDATE]);
    }
}

@Injectable()
export class CanReadDataGuard extends AccessGuard {
    public constructor() {
        super([ACCESS_RIGHT.CAN_SELECT]);
    }
}
