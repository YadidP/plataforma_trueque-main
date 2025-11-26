import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PgService } from 'src/database/pg.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ResolveClaimDto } from './dto/resolve-claim.dto'; // Asegúrate de importar esto
import { ClaimDetailDto } from './dto/claim-detail.dto';

@Injectable()
export class ClaimsService {
    constructor(private readonly pgService: PgService) { }

    async create(userId: number, createClaimDto: CreateClaimDto) {
        // Validar que no se denuncie lo propio
        if (createClaimDto.listingId) {
            const listing = await this.pgService.query('SELECT author_id FROM listings WHERE id = $1', [createClaimDto.listingId]);
            if (listing.rows[0]?.author_id === userId) {
                throw new BadRequestException('No puedes reportar tu propia publicación.');
            }
        }

        const query = `
            INSERT INTO claims (exchange_id, listing_id, claimant_id, reason, status, created_at)
            VALUES ($1, $2, $3, $4, 'abierto', NOW())
            RETURNING id;
        `;
        const values = [
            createClaimDto.exchangeId || null,
            createClaimDto.listingId || null,
            userId,
            createClaimDto.reason,
        ];
        const result = await this.pgService.query(query, values);
        return result.rows[0];
    }

    // Obtener reportes pendientes para el Admin
    async findActiveClaims(): Promise<ClaimDetailDto[]> {
        const query = `
            SELECT
                c.id, c.exchange_id as "exchangeId", c.listing_id as "listingId",
                c.claimant_id as "claimantId", c.reason, c.status,
                c.created_at as "createdAt",
                u.name as claimant_name,
                l.title as listing_title, l.author_id as reported_user_id, ua.name as reported_user_name
            FROM claims c
            JOIN users u ON c.claimant_id = u.id
            LEFT JOIN listings l ON c.listing_id = l.id
            LEFT JOIN users ua ON l.author_id = ua.id
            WHERE c.status IN ('abierto', 'en_revision')
            ORDER BY c.created_at DESC;
        `;
        const result = await this.pgService.query(query);
        
        // Mapeo simple para el frontend
        return result.rows.map(r => ({
            ...r,
            listingDetails: r.listingId ? { id: r.listingId, title: r.listing_title, authorName: r.reported_user_name, authorId: r.reported_user_id } : null
        }));
    }

    // LÓGICA PRINCIPAL: RESOLUCIÓN Y SANCIÓN
    async resolveClaim(claimId: number, dto: ResolveClaimDto) {
        const client = await this.pgService['pool'].connect(); // Acceso directo al pool para transacción
        try {
            await client.query('BEGIN');

            // 1. Obtener info del reclamo
            const claimRes = await client.query('SELECT * FROM claims WHERE id = $1', [claimId]);
            const claim = claimRes.rows[0];
            if (!claim) throw new NotFoundException('Reclamo no encontrado');

            // 2. Ejecutar acción sobre la publicación
            if (dto.action === 'delete_listing' && claim.listing_id) {
                await client.query("UPDATE listings SET status = 'eliminada' WHERE id = $1", [claim.listing_id]);
            }

            // 3. Aplicar sanción al usuario (si corresponde)
            if (dto.sanctionType !== 'none') {
                // Necesitamos el ID del autor reportado. 
                const listRes = await client.query('SELECT author_id FROM listings WHERE id = $1', [claim.listing_id]);
                const targetUserId = listRes.rows[0]?.author_id;

                if (targetUserId) {
                    let bannedUntil = null;
                    if (dto.sanctionType === 'temp_ban') {
                        // Ban de 7 días
                        bannedUntil = new Date();
                        bannedUntil.setDate(bannedUntil.getDate() + 7);
                    }
                    // Si es perm_ban, bannedUntil se queda null (o fecha muy lejana), usaremos is_banned = true

                    await client.query(`
                        UPDATE users 
                        SET is_banned = true, 
                            banned_until = $1, 
                            ban_reason = $2 
                        WHERE id = $3
                    `, [bannedUntil, dto.adminMessage, targetUserId]);
                }
            }

            // 4. Cerrar el reclamo
            await client.query(`
                UPDATE claims 
                SET status = 'resuelto', 
                    resolved_at = NOW() 
                WHERE id = $1
            `, [claimId]);

            // Aquí podrías insertar en una tabla 'notifications' para avisar al usuario.

            await client.query('COMMIT');
            return { message: 'Reclamo resuelto y acciones aplicadas.' };

        } catch (e) {
            await client.query('ROLLBACK');
            console.error(e);
            throw new InternalServerErrorException('Error procesando la resolución');
        } finally {
            client.release();
        }
    }
    
    // Método dummy para cumplir con la interfaz del controller anterior si fuera necesario
    async findAll() { return []; }
}