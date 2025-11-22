import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Claim } from '../entities/claim.entity';
import { CreateClaimDto } from './dto/create-claim.dto';

@Injectable()
export class ClaimsService {
    constructor(
        @InjectRepository(Claim)
        private claimsRepository: Repository<Claim>,
    ) { }

    async create(userId: number, createClaimDto: CreateClaimDto): Promise<Claim> {
        if (!createClaimDto.exchangeId && !createClaimDto.listingId) {
            throw new BadRequestException('Must provide either exchangeId or listingId');
        }

        const claim = this.claimsRepository.create({
            ...createClaimDto,
            claimantId: userId,
            status: 'abierto',
        });

        return this.claimsRepository.save(claim);
    }
}
