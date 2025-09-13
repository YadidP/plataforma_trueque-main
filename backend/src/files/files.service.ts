// backend/src/files/files.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class FilesService {
  async saveFile(file: any): Promise<string> {
    try {
      const fileExtension = file.originalname.split('.').pop();
      const newFileName = `${uuidv4()}.${fileExtension}`;
      const uploadPath = join(process.cwd(), 'uploads');

      await mkdir(uploadPath, { recursive: true });
      await writeFile(join(uploadPath, newFileName), file.buffer);

      return `/uploads/${newFileName}`;
    } catch (error) {
      console.error('Error saving file:', error);
      throw new InternalServerErrorException('No se pudo guardar el archivo.');
    }
  }
}
