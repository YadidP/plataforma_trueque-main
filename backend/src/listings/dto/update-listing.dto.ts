import { PartialType } from '@nestjs/swagger';
import { CreateListingDto } from './create-listing.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateListingDto extends PartialType(CreateListingDto) {
  // Este campo recibirá un JSON string con las URLs de las imágenes que el usuario decidió NO borrar
  @IsOptional()
  @IsString()
  keptImageUrls?: string;
}
