/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthLoginDTO } from './dto/auth-login.dto';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import { AuthForgetDTO } from './dto/auth-forget.dto';
import { AuthResetDTO } from './dto/auth-reset.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from 'src/shared/guards/auth.guard';
import { User } from 'src/shared/decorators/user.decorator';
import { AuthValidateDTO } from './dto/auth-validate.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) { }

    @Post('login')
    async login(@Body() body: AuthLoginDTO) {
        return this.authService.login(body.email, body.password);
    }

    @Post('register')
    async register(@Body() body: AuthRegisterDTO) {
        return this.authService.register(body);
    }

    @Post('forget')
    async forget(@Body() body: AuthForgetDTO) {
        return this.authService.forget(body);
    }

    @Post('reset')
    async reset(@Body() body: AuthResetDTO) {
        return this.authService.reset(body.password, body.token);
    }

    @Post('verify-reset-token')
    async verifyResetToken(@Body() body: AuthValidateDTO) {
        const isValid = this.authService.isValidToken(body.token, 'forget', 'users');

        return { isValid };
    }

    @Post('validate')
    async validate(@Body() body: AuthValidateDTO) {
        return this.authService.validateMail(body.token);
    }

    @UseGuards(AuthGuard)
    @Post('me')
    async me(@User() user) {

        return { me: 'ok', data: user };
    }
}
