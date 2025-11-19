import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Listing, ListingImage } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
    @InjectRepository(ListingImage)
    private listingImagesRepository: Repository<ListingImage>,
  ) {}

  async create(createListingDto: CreateListingDto, authorId: number, imageUrls: string[]) {
    const listing = this.listingsRepository.create({
      title: createListingDto.title,
      description: createListingDto.description,
      authorId,
      imageUrl: imageUrls[0], // Keep first image as main for backward compatibility
      categoryId: Number(createListingDto.categoryId),
      subcategoryId: Number(createListingDto.subcategoryId),
      materialId: createListingDto.materialId ? Number(createListingDto.materialId) : undefined,
      unitCredits: Number(createListingDto.unitCredits),
      quantity: createListingDto.quantity ? Number(createListingDto.quantity) : undefined,
      quantityRange: createListingDto.quantityRange,
      unitLabel: createListingDto.unitLabel,
    });

    const savedListing = await this.listingsRepository.save(listing);

    // Save all images
    const images = imageUrls.map((url, index) =>
      this.listingImagesRepository.create({
        listingId: savedListing.id,
        imageUrl: url,
        displayOrder: index,
      })
    );
    await this.listingImagesRepository.save(images);
    savedListing.images = images;

    return savedListing;
  }

  findAll() {
    return this.listingsRepository.find({
      relations: ['author'],
      select: {
        author: {
          name: true,
        }
      },
      order: {
        createdAt: 'DESC'
      }
    });
  }

  async findOne(id: number) {
    const listing = await this.listingsRepository.findOne({
        where: { id },
        relations: ['author', 'category', 'images'],
        select: {
            author: { name: true, id: true },
            category: { name: true },
        },
        order: {
          images: {
            displayOrder: 'ASC'
          }
        }
    });
    if (!listing) {
        throw new NotFoundException(`Publicación con ID ${id} no encontrada.`);
    }
    // Devolvemos un objeto plano que coincida con la interfaz del frontend
    return {
        ...listing,
        authorName: listing.author.name,
    };
  }

  findByAuthor(authorId: number) {
    return this.listingsRepository.find({ where: { authorId }, order: { createdAt: 'DESC' } });
  }

  async update(id: number, updateListingDto: UpdateListingDto, userId: number, newImageUrls: string[]) {
    const listing = await this.listingsRepository.findOne({ 
      where: { id }, 
      relations: ['images', 'author'] 
    });

    if (!listing) throw new NotFoundException('Publicación no encontrada');
    if (listing.author.id !== userId) throw new ForbiddenException('No tienes permiso para editar esta publicación');

    // 1. Actualizar campos de texto
    if (updateListingDto.title) listing.title = updateListingDto.title;
    if (updateListingDto.description) listing.description = updateListingDto.description;
    if (updateListingDto.categoryId) listing.categoryId = Number(updateListingDto.categoryId);
    if (updateListingDto.subcategoryId) listing.subcategoryId = Number(updateListingDto.subcategoryId);
    if (updateListingDto.materialId) listing.materialId = Number(updateListingDto.materialId);
    if (updateListingDto.unitCredits) listing.unitCredits = Number(updateListingDto.unitCredits);
    if (updateListingDto.quantity) listing.quantity = Number(updateListingDto.quantity);
    if (updateListingDto.unitLabel) listing.unitLabel = updateListingDto.unitLabel;

    // 2. Manejo de Imágenes
    
    // A) Determinar qué imágenes antiguas se conservan
    // El frontend enviará 'keptImageUrls' como un string JSON (ej: "['/uploads/a.jpg', '/uploads/b.jpg']")
    let keptUrls: string[] = [];
    if (updateListingDto.keptImageUrls) {
      try {
        keptUrls = JSON.parse(updateListingDto.keptImageUrls);
        if (!Array.isArray(keptUrls)) keptUrls = [];
      } catch (e) { keptUrls = []; }
    }

    // B) Borrar de la DB las imágenes que no están en la lista de 'keptUrls'
    const imagesToDelete = listing.images.filter(img => !keptUrls.includes(img.imageUrl));
    if (imagesToDelete.length > 0) {
      await this.listingImagesRepository.remove(imagesToDelete);
    }

    // C) Guardar las nuevas imágenes
    if (newImageUrls.length > 0) {
      const newImages = newImageUrls.map((url, index) => 
        this.listingImagesRepository.create({
          listingId: listing.id,
          imageUrl: url,
          displayOrder: keptUrls.length + index, // Ordenar después de las existentes
        })
      );
      await this.listingImagesRepository.save(newImages);
    }

    // Actualizar la imagen principal (thumbnail) si cambió
    // Prioridad: 1. Primera imagen conservada, 2. Primera imagen nueva
    const allImages = await this.listingImagesRepository.find({ where: { listingId: id }, order: { displayOrder: 'ASC' } });
    if (allImages.length > 0) {
      listing.imageUrl = allImages[0].imageUrl;
    } else {
      listing.imageUrl = null; // o una imagen por defecto
    }

    return this.listingsRepository.save(listing);
  }
}
