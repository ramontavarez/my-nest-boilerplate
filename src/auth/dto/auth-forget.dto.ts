import { IsEmail, IsStrongPassword, IsUrl } from "class-validator";

export class AuthForgetDTO {

    @IsEmail()
    email: string;

    @IsUrl({ require_tld: false })
    callbackUrl: string

}