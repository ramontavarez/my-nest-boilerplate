import { IsEmail, IsEnum, IsOptional, IsString, IsStrongPassword } from "class-validator";
import { Role } from "src/shared/enums/role.enum";

export class CreateUserDTO {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsStrongPassword({
        minLength: 8,
    })
    password: string;

    @IsOptional()
    @IsEnum(Role)
    role: number;

    @IsOptional()
    picture: string;
}