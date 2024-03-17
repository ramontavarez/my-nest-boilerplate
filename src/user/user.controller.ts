import { BadRequestException, Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Patch, Post, Put, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UpdatePutUserDTO } from "./dto/update-put-user.dto";
import { UpdatePatchUserDTO } from "./dto/update-patch-user-dto";
import { UserService } from "./user.service";
import { ParamId } from "src/shared/decorators/param-id.decorator";
import { RoleGuard } from "src/shared/guards/role.guard";
import { Roles } from "src/shared/decorators/role.decorator";
import { Role } from "src/shared/enums/role.enum";
import { AuthGuard } from "src/shared/guards/auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { User } from "src/shared/decorators/user.decorator";
import { FileService } from "src/file/file.service";

@Roles(Role.User)
@UseGuards(AuthGuard, RoleGuard)
@Controller('users')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly fileService: FileService
    ) { }
    @Get()
    async getAll() {
        return this.userService.getAll()
    }

    @Post()
    async create(@Body() data: CreateUserDTO) {
        return this.userService.create(data)
    }

    @Get(':id')
    async getOne(@ParamId() id: number) {
        return this.userService.getOne(id)
    }


    @Put(':id')
    async update(@Body() body: UpdatePutUserDTO, @ParamId() id: number) {
        return this.userService.update(id, body)
    }

    @Patch(':id')
    async updatePartial(@Body() body: UpdatePatchUserDTO, @ParamId() id: number) {
        return this.userService.update(id, body)
    }

    @Delete(":id")
    async delete(@ParamId() id: number) {
        return this.userService.delete(id);
    }

    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(AuthGuard)
    @Put(':id/image')
    async uploadImage(@User() user, @UploadedFile(new ParseFilePipe({
        validators: [
            new FileTypeValidator({ fileType: 'image/*' }),
            new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 })
        ]
    })) file: Express.Multer.File) {
        const fileName = `${user.id}-${Date.now().toString()}`;
        try {

            const uploadResult = await this.fileService.upload(file, fileName)
            await this.userService.update(user.id, { picture: uploadResult.secure_url })

        } catch (e) {
            console.log(e);
            throw new BadRequestException('File upload error');
        }

        return {
            success: true,
            statusCode: 200,
            message: 'File uploaded successfully',
        }
    }
}