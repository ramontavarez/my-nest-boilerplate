/*
https://docs.nestjs.com/providers#services
*/

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdatePatchUserDTO } from './dto/update-patch-user-dto';
import * as bcrypt from 'bcrypt';
import { QueryObjectType } from './types/QueryObjectType';

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    async create({ name, email, password, role }: CreateUserDTO) {
        if (await this.exists(email)) {
            throw new BadRequestException('User with this email already exists');
        }
        return await this.prisma.user.create({
            data: {
                name,
                email,
                password: await bcrypt.hash(password, await bcrypt.genSalt()),
                role,
            }
        })
    }

    async getAll() {
        return await this.prisma.user.findMany();
    }

    async getOne(arg: number | string) {
        const { id, email } = this.getEmailAndIdFromArg(arg);
        await this.throwErrorIfNotExists(id || email);
        const queryObject = await this.getQueryObjectByIdOrEmail(id, email);
        return await this.prisma.user.findUnique({ where: queryObject });
    }

    getEmailAndIdFromArg(arg: number | string) {
        let id = undefined;
        let email = undefined;
        if (typeof arg === 'number') {
            id = arg;
        }

        if (typeof arg === 'string') {
            email = arg;
        }

        return {
            id,
            email
        }
    }

    async update(id: number, { name, email, password, role, picture }: UpdatePatchUserDTO) {
        await this.throwErrorIfNotExists(id);
        return await this.prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                password: password ? await bcrypt.hash(password, await bcrypt.genSalt()) : undefined,
                role,
                picture,
                updatedAt: new Date()
            }
        })
    }

    async delete(id: number) {
        await this.throwErrorIfNotExists(id);
        return await this.prisma.user.delete({ where: { id } })
    }

    async exists(arg: number | string): Promise<boolean> {
        const { id, email } = this.getEmailAndIdFromArg(arg);
        const queryObject = this.getQueryObjectByIdOrEmail(id, email);
        if (!(await this.prisma.user.count({ where: queryObject }))) {
            return false;
        }
        return true;
    }

    async throwErrorIfNotExists(arg: number | string) {
        if (!(await this.exists(arg))) {
            throw new NotFoundException(`User not found`);
        }
    }

    getQueryObjectByIdOrEmail(id?: number, email?: string): QueryObjectType {
        if (!id && !email) {
            throw new BadRequestException('Either id or email must be provided');
        }

        return id ? { id } : { email };

    }
}
