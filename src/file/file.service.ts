/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v2 as cloudinary } from 'cloudinary';


@Injectable()
export class FileService {
    // private readonly commonPath = join(__dirname, '..', '..', 'storage', 'uploads');
    async upload(file: Express.Multer.File, fileName: string) {
        // local storage
        // writeFile(join(this.commonPath, fileName), file.buffer);

        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        const b64 = Buffer.from(file.buffer).toString("base64");
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        return await cloudinary.uploader.upload(dataURI,
            { public_id: fileName },
        );
    }
}
