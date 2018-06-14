import 'source-map-support/register';
import * as serveStatic from 'serve-static';
import * as path from "path";

import { NestFactory } from '@nestjs/core';
import {Injectable, Module, NestModule, NestMiddleware, MiddlewareFunction, MiddlewareConsumer} from '@nestjs/common';

import {AuthController} from './controllers/auth.controller';
import {PublicDataController} from './controllers/public.data.controller';
import {ConnectionProvider} from './providers/connection.provider';
import {PublicDataProvider} from './providers/public.data.provider';
import {SessionsManager} from './providers/sessions.manager';
import {UsersManager} from './providers/users.manager';
import {JWTKeysProvider} from './providers/jwt.keys.provider';
import {SessionsService} from './providers/sessions.service';
import {UsersService} from './providers/users.service';
import {JwtStrategy} from './strategy/jwt.strategy';
import {isProductionEnv} from './util/env.util';

process.on('unhandledRejection', (error) => {
    console.error('[UNHANDLED]', error);
});

@Injectable()
class LoggerMiddleware implements NestMiddleware {
    resolve(...args: any[]): MiddlewareFunction {
        return (req, res, next) => {
            console.info(`[${(new Date(Date.now())).toISOString()}][${req.method}][${req.path}]`, JSON.stringify(req.body));
            next();
        };
    }
}

@Module({
    controllers: [
        AuthController,
        PublicDataController,
    ],
    providers: [
        LoggerMiddleware,


        ConnectionProvider, PublicDataProvider, SessionsManager, UsersManager,
        JWTKeysProvider,
        JwtStrategy, UsersService, SessionsService,
    ],
})
class ApplicationModule implements NestModule {
    public configure(consumer: MiddlewareConsumer): void {

    }
}

async function bootstrap() {
    const { PORT } = process.env;
    const isProduction = isProductionEnv();
    const app = await NestFactory.create(ApplicationModule, { cors: !isProduction });
    let project_root = path.dirname(path.dirname(path.dirname(__dirname)));
    app.use(serveStatic(path.join(project_root, 'public')));

    const port = PORT !== undefined ? parseInt(PORT || '', 10) : 3000;
    if (!(Number.isSafeInteger(port) &&  0 < port && port < 65535)) {
        throw new Error(`Invalid port: ${PORT}`);
    }

    await app.listen(port, '0.0.0.0');
}

if (require.main === module) {
    bootstrap()
        .catch((error) => {
            console.error('[BOOTSTRAP]', error);
            process.exit(1);
        });
}
