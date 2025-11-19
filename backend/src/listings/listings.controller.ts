import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFiles, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(FilesInterceptor('imageFiles', 10))
  @ApiConsumes('multipart/form-data')
  async create(
    @Body() createListingDto: CreateListingDto,
    @Req() req,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    )
    files: any[],
  ) {
    const imageUrls = await Promise.all(
      files.map(file => this.filesService.saveFile(file))
    );
    return this.listingsService.create(createListingDto, req.user.id, imageUrls);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FilesInterceptor('imageFiles', 10))
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: string,
    @Body() updateListingDto: UpdateListingDto,
    @Req() req,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
        fileIsRequired: false, // <-- IMPORTANTE: No es obligatorio subir nuevas fotos
      }),
    )
    files: any[],
  ) {
    const newImageUrls = files && files.length > 0 
      ? await Promise.all(files.map(file => this.filesService.saveFile(file)))
      : [];
      
    return this.listingsService.update(+id, updateListingDto, req.user.id, newImageUrls);
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
