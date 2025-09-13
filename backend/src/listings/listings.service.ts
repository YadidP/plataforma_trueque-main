import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateListingDto } from './dto/create-listing.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Listing } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
  ) {}

  async create(createListingDto: CreateListingDto, authorId: number, imageUrl: string) {
    const listing = this.listingsRepository.create({
      ...createListingDto,
      authorId,
      imageUrl,
      // TypeORM can handle converting string numbers from DTO to number type
      categoryId: Number(createListingDto.categoryId),
      unitCredits: Number(createListingDto.unitCredits),
    });
    return this.listingsRepository.save(listing);
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
