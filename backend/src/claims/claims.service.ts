import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PgService } from 'src/database/pg.service'; // Import PgService
import { CreateClaimDto } from './dto/create-claim.dto';
import { ClaimDetailDto } from './dto/claim-detail.dto'; // Assuming this DTO is still needed for output structure

@Injectable()
export class ClaimsService {
    constructor(
        private readonly pgService: PgService, // Inject PgService
    ) { }

    async create(userId: number, createClaimDto: CreateClaimDto): Promise<any> { // Return type changed to any
        if (!createClaimDto.exchangeId && !createClaimDto.listingId) {
            throw new BadRequestException('Must provide either exchangeId or listingId');
        }

        const query = `
            INSERT INTO claims (exchange_id, listing_id, claimant_id, reason, status, created_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING id, exchange_id as "exchangeId", listing_id as "listingId", claimant_id as "claimantId", reason, status, created_at as "createdAt", resolved_at as "resolvedAt";
        `;
        const values = [
            createClaimDto.exchangeId || null,
            createClaimDto.listingId || null,
            userId,
            createClaimDto.reason,
            'abierto',
        ];
        const result = await this.pgService.query(query, values);
        return result.rows[0];
    }

    // Admin methods
    async findAll(): Promise<ClaimDetailDto[]> {
        const query = `
            SELECT
                c.id, c.exchange_id as "exchangeId", c.listing_id as "listingId",
                c.claimant_id as "claimantId", c.reason, c.status,
                c.created_at as "createdAt", c.resolved_at as "resolvedAt",
                u.name as claimant_name,
                e.id as exchange_id, l_e.title as exchange_listing_title,
                ub.name as exchange_buyer_name, us.name as exchange_seller_name,
                l.id as listing_id, l.title as listing_title, ua.name as listing_author_name
            FROM claims c
            JOIN users u ON c.claimant_id = u.id
            LEFT JOIN exchanges e ON c.exchange_id = e.id
            LEFT JOIN listings l_e ON e.listing_id = l_e.id
            LEFT JOIN users ub ON e.buyer_id = ub.id
            LEFT JOIN users us ON e.seller_id = us.id
            LEFT JOIN listings l ON c.listing_id = l.id
            LEFT JOIN users ua ON l.author_id = ua.id
            ORDER BY c.created_at DESC;
        `;
        const result = await this.pgService.query(query);
        return result.rows.map(row => this.mapToDetailDto(row));
    }

    async findActiveClaims(): Promise<ClaimDetailDto[]> {
        const query = `
            SELECT
                c.id, c.exchange_id as "exchangeId", c.listing_id as "listingId",
                c.claimant_id as "claimantId", c.reason, c.status,
                c.created_at as "createdAt", c.resolved_at as "resolvedAt",
                u.name as claimant_name,
                e.id as exchange_id, l_e.title as exchange_listing_title,
                ub.name as exchange_buyer_name, us.name as exchange_seller_name,
                l.id as listing_id, l.title as listing_title, ua.name as listing_author_name
            FROM claims c
            JOIN users u ON c.claimant_id = u.id
            LEFT JOIN exchanges e ON c.exchange_id = e.id
            LEFT JOIN listings l_e ON e.listing_id = l_e.id
            LEFT JOIN users ub ON e.buyer_id = ub.id
            LEFT JOIN users us ON e.seller_id = us.id
            LEFT JOIN listings l ON c.listing_id = l.id
            LEFT JOIN users ua ON l.author_id = ua.id
            WHERE c.status IN ('abierto', 'en_revision')
            ORDER BY c.created_at DESC;
        `;
        const result = await this.pgService.query(query);
        return result.rows.map(row => this.mapToDetailDto(row));
    }

    async resolveClaim(claimId: number): Promise<any> { // Return type changed to any
        const query = `
            UPDATE claims
            SET status = 'resuelto', resolved_at = NOW()
            WHERE id = $1
            RETURNING id, exchange_id as "exchangeId", listing_id as "listingId", claimant_id as "claimantId", reason, status, created_at as "createdAt", resolved_at as "resolvedAt";
        `;
        const result = await this.pgService.query(query, [claimId]);

        if (result.rows.length === 0) {
            throw new NotFoundException(`Claim with ID ${claimId} not found`);
        }
        return result.rows[0];
    }

    private mapToDetailDto(row: any): ClaimDetailDto {
        const dto: ClaimDetailDto = {
            id: row.id,
            exchangeId: row.exchangeId,
            listingId: row.listingId,
            claimantId: row.claimantId,
            claimantName: row.claimant_name || 'Usuario desconocido',
            reason: row.reason,
            status: row.status,
            createdAt: row.createdAt,
            resolvedAt: row.resolvedAt,
        };

        if (row.exchange_id) {
            dto.exchangeDetails = {
                id: row.exchange_id,
                listingTitle: row.exchange_listing_title || 'Sin título',
                buyerName: row.exchange_buyer_name || 'Desconocido',
                sellerName: row.exchange_seller_name || 'Desconocido',
            };
        }

        if (row.listing_id) {
            dto.listingDetails = {
                id: row.listing_id,
                title: row.listing_title,
                authorName: row.listing_author_name || 'Desconocido',
            };
        }

        return dto;
    }
}
