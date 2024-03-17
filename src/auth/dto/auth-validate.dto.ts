import { IsJWT } from "class-validator";

export class AuthValidateDTO {
    @IsJWT()
    token: string
}