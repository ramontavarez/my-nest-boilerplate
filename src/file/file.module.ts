import { FileService } from './file.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';

@Module({
    imports: [],
    controllers: [],
    providers: [
        FileService,],
    exports: [FileService],
})
export class FileModule { }
