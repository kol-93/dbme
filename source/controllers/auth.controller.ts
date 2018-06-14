import {Body, Controller, ForbiddenException, Get, Post, Request, UseGuards} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';
import {SignInDto} from '../dto/auth/sign.in.dto';
import {IAuthRequest} from '../interfaces/auth/auth.request.interface';
import {IAuthResponse} from '../interfaces/auth/auth.response.interface';
import {IUser} from '../interfaces/user.interface';
import {SessionsService} from '../providers/sessions.service';

@Controller('auth')
export class AuthController {
    public constructor(private readonly sessionsService: SessionsService) {}

    @Post('signIn')
    public async signIn(@Body() body: SignInDto): Promise<IAuthResponse> {
        const {login, password, visualKey} = body;
        if (password !== undefined) {
            return this.sessionsService.signInByPassword({ login, password });
        } else if (visualKey !== undefined) {
            return this.sessionsService.signInByVisualKey({ login, visualKey });
        } else {
            throw new ForbiddenException('No password nor visual key provided');
        }
    }

    @Get('user')
    @UseGuards(AuthGuard('jwt'))
    public async getUser(@Request() request: IAuthRequest): Promise<IUser> {
        const {session, login, name, role} = request.user;
        return {session, login, name, role};
    }

    @Post('logOut')
    @UseGuards(AuthGuard('jwt'))
    public async logOut(@Request() request: IAuthRequest): Promise<void> {
        await this.sessionsService.logOut(request.user);
    }

    @Post('token')
    public async refresh(@Body('token') token: string): Promise<IAuthResponse> {
        return this.sessionsService.refresh(token);
    }
}
