import {Injectable} from '@nestjs/common';

@Injectable()
export class JWTKeysProvider {
    public get EncryptionKey() {
        return 'secretKey';
    }

    public get DecryptionKey() {
        return 'secretKey';
    }
}
