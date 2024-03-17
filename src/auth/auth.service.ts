/*
https://docs.nestjs.com/providers#services
*/

import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { AuthRegisterDTO } from './dto/auth-register.dto';
import * as bcrypt from 'bcrypt';
import { MailerService } from '@nestjs-modules/mailer';
import { AuthForgetDTO } from './dto/auth-forget.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly JwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly userService: UserService,
        private readonly mailerService: MailerService
    ) { }

    createToken(email: string, issuer: string, audience: string, duration: string = '7 days') {
        return {
            accessToken: this.JwtService.sign({
                email,
            }, {
                expiresIn: duration,
                subject: String(email),
                issuer,
                audience,
            })
        }
    }

    checkToken(token: string, issuer: string, audience: string) {
        try {
            const data = this.JwtService.verify(token, {
                issuer,
                audience
            });

            return data;
        } catch (e) {
            throw new UnauthorizedException("Invalid token");
        }
    }

    isValidToken(token: string, issuer: string, audience: string) {
        try {
            this.checkToken(token, issuer, audience);
            return true;
        } catch (e) {
            return false;
        }
    }

    async login(email: string, password: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                email
            }
        })

        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }

        if (!await bcrypt.compare(password, user.password)) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.picture
            },
            accessToken: await this.createToken(user.email, 'login', 'users').accessToken
        }
    }

    async forget(data: AuthForgetDTO) {
        try {
            await this.userService.throwErrorIfNotExists(data.email);
            const user = await this.userService.getOne(data.email);
            const token = this.createToken(user.email, 'forget', 'users', '31 minutes').accessToken;
            await this.mailerService.sendMail({
                subject: 'Password reset',
                to: data.email,
                template: 'forget',
                context: {
                    name: user.name,
                    callbackUrl: data.callbackUrl + `?token=${token}`
                }
            })

            return {
                message: "Enviamos um email com o link para redefinir sua senha"
            };
        } catch (e) {
            throw new BadRequestException(e.message);
        }
    }

    async reset(password: string, token: string) {
        try {
            const data = this.JwtService.verify(token, {
                issuer: 'forget',
                audience: 'users'
            });

            await this.userService.throwErrorIfNotExists(data.email);

            const user = await this.prisma.user.update({
                where: {
                    email: data.email,
                },
                data: {
                    password: await bcrypt.hash(password, await bcrypt.genSalt()),
                }
            })

            return {
                message: "Senha alterada com sucesso",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.picture
                }
            }

        } catch (e) {
            throw new UnauthorizedException("Invalid token");
        }
    }

    async validateMail(token: string) {
        try {
            const data = this.JwtService.verify(token, {
                issuer: 'mail-confirmation',
                audience: 'users'
            });

            await this.userService.throwErrorIfNotExists(data.email);

            await this.prisma.user.update({
                where: {
                    email: data.email,
                },
                data: {
                    isValidMail: true
                }
            })

            return {
                ok: true
            }
        } catch (e) {
            throw new UnauthorizedException("Invalid token");
        }
    }

    async register(data: AuthRegisterDTO) {
        const user = await this.userService.create(data);
        await this.mailerService.sendMail({
            subject: '[Psi Network] Confirme seu email',
            to: user.email,
            template: 'mail-confirmation',
            context: {
                name: user.name,
                token: this.createToken(user.email, 'mail-confirmation', 'users').accessToken,
            }
        })

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.picture
            },
            accessToken: await this.createToken(user.email, 'login', 'users').accessToken
        }
    }

}
