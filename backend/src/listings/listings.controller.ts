import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from 'src/files/files.service';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
    private readonly filesService: FilesService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('imageFile'))
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() createListingDto: CreateListingDto,
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    ) // FIX: Replaced Express.Multer.File with any due to missing Express types.
    file: any,
    ) {
    const imageUrl = await this.filesService.saveFile(file);
    return this.listingsService.create(createListingDto, req.user.id, imageUrl);
  }

  @Get()
  findAll() {
    return this.listingsService.findAll();
  }
  
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-listings')
  findMyListings(@Req() req) {
    return this.listingsService.findByAuthor(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(+id);
  }
}
