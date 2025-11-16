import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListingDto } from './dto/create-listing.dto';
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
        relations: ['author', 'category'],
        select: {
            author: { name: true },
            category: { name: true },
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
}
