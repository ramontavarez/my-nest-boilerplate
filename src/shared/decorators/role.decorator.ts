import { SetMetadata } from "@nestjs/common";
import { Role } from "src/shared/enums/role.enum";

export const ROLES_KEY = 'roles';
export const Roles = (...role: Role[]) => SetMetadata('roles', role); 