import { Controller, Get, Post, Body, Patch, Param, Req, UseInterceptors, UploadedFiles, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UseGuards } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesService } from 'src/files/files.service';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
    private readonly filesService: FilesService,
  ) {}

  @Post()
  @UseGuards(AuthenticatedGuard)
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
    const userId = req.session.user.id;
    return this.listingsService.create(createListingDto, userId, imageUrls);
  }

  @Patch(':id')
  @UseGuards(AuthenticatedGuard)
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
      
    const userId = req.session.user.id;
    return this.listingsService.update(+id, updateListingDto, userId, newImageUrls);
  }

  @Get()
  findAll() {
    return this.listingsService.findAll();
  }

  @Get('my-listings')
  @UseGuards(AuthenticatedGuard)
  findMyListings(@Req() req) {
    const userId = req.session.user.id;
    return this.listingsService.findByAuthor(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(+id);
  }
}
