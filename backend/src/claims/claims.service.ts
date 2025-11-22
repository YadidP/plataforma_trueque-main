import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Claim } from '../entities/claim.entity';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ClaimDetailDto } from './dto/claim-detail.dto';

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

    // Admin methods
    async findAll(): Promise<ClaimDetailDto[]> {
        const claims = await this.claimsRepository.find({
            relations: ['claimant', 'exchange', 'exchange.listing', 'exchange.buyer', 'exchange.seller', 'listing', 'listing.author'],
            order: { createdAt: 'DESC' },
        });

        return claims.map(claim => this.mapToDetailDto(claim));
    }

    async findActiveClaims(): Promise<ClaimDetailDto[]> {
        const claims = await this.claimsRepository.find({
            where: [
                { status: 'abierto' },
                { status: 'en_revision' }
            ],
            relations: ['claimant', 'exchange', 'exchange.listing', 'exchange.buyer', 'exchange.seller', 'listing', 'listing.author'],
            order: { createdAt: 'DESC' },
        });

        return claims.map(claim => this.mapToDetailDto(claim));
    }

    async resolveClaim(claimId: number): Promise<Claim> {
        const claim = await this.claimsRepository.findOne({ where: { id: claimId } });

        if (!claim) {
            throw new NotFoundException(`Claim with ID ${claimId} not found`);
        }

        claim.status = 'resuelto';
        claim.resolvedAt = new Date();

        return this.claimsRepository.save(claim);
    }

    private mapToDetailDto(claim: Claim): ClaimDetailDto {
        const dto: ClaimDetailDto = {
            id: claim.id,
            exchangeId: claim.exchangeId,
            listingId: claim.listingId,
            claimantId: claim.claimantId,
            claimantName: claim.claimant?.name || 'Usuario desconocido',
            reason: claim.reason,
            status: claim.status,
            createdAt: claim.createdAt,
            resolvedAt: claim.resolvedAt,
        };

        if (claim.exchange) {
            dto.exchangeDetails = {
                id: claim.exchange.id,
                listingTitle: claim.exchange.listing?.title || 'Sin título',
                buyerName: claim.exchange.buyer?.name || 'Desconocido',
                sellerName: claim.exchange.seller?.name || 'Desconocido',
            };
        }

        if (claim.listing) {
            dto.listingDetails = {
                id: claim.listing.id,
                title: claim.listing.title,
                authorName: claim.listing.author?.name || 'Desconocido',
            };
        }

        return dto;
    }
}
