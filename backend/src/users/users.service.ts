import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { PgService } from 'src/database/pg.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly pgService: PgService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> {
    // Verificar si el email ya existe
    const existingUser = await this.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Este correo electrónico ya está registrado.');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    // Insertar usuario
    const query = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at;
    `;
    // Por defecto el rol es 'usuario'
    const values = [createUserDto.name, createUserDto.email, passwordHash, 'usuario'];
    const result = await this.pgService.query(query, values);
    return result.rows[0];
  }

  async findAll(): Promise<any[]> {
    const result = await this.pgService.query('SELECT id, name, email, role, created_at, updated_at FROM users;');
    return result.rows;
  }

  async findOne(id: number): Promise<any | null> {
    // Búsqueda por ID (Numérico)
    const result = await this.pgService.query('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1;', [id]);
    return result.rows[0] || null;
  }
  
  async findOneByEmail(email: string): Promise<any | null> {
    // CORRECCIÓN CRÍTICA: Búsqueda por EMAIL (Texto)
    // Antes probablemente decía 'WHERE id = $1', lo que causaba el error de tipo integer.
    const result = await this.pgService.query('SELECT id, name, email, role, created_at, updated_at FROM users WHERE email = $1;', [email]);
    return result.rows[0] || null;
  }

  // New methods added to satisfy UsersController
  async getPublicProfile(userId: number) {
    // 1. Datos básicos + Bio
    const userRes = await this.pgService.query('SELECT id, name, email, role, bio, created_at FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // 2. Promedio de calificación (Corregido con COALESCE para evitar nulos)
    const ratingRes = await this.pgService.query(`
        SELECT 
            COALESCE(AVG(rating), 0) as average, 
            COUNT(*)::int as count 
        FROM reviews 
        WHERE target_id = $1
    `, [userId]);
    
    // 3. Reseñas recibidas
    const reviewsRes = await this.pgService.query(`
        SELECT r.rating, r.comment, r.created_at, u.name as reviewer_name 
        FROM reviews r JOIN users u ON r.reviewer_id = u.id 
        WHERE r.target_id = $1 ORDER BY r.created_at DESC LIMIT 5`, [userId]);

    // 4. Impacto ambiental acumulado (Consulta robusta)
    // Sumamos el impacto de todos los intercambios donde el usuario fue comprador O vendedor
    const impactRes = await this.pgService.query(`
        SELECT 
            ei.metric_name, 
            ei.metric_code,
            SUM(ei.impact_value) as total, 
            ei.metric_unit
        FROM exchange_impacts ei 
        JOIN exchanges e ON ei.exchange_id = e.id
        WHERE e.seller_id = $1 OR e.buyer_id = $1
        GROUP BY ei.metric_name, ei.metric_code, ei.metric_unit
    `, [userId]);

    return { 
        ...user, 
        stats: ratingRes.rows[0], 
        reviews: reviewsRes.rows, 
        impact: impactRes.rows 
    };
  }

  async updateBio(userId: number, bio: string): Promise<any> {
    const result = await this.pgService.query(
      `UPDATE users SET bio = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, email, role, bio;`,
      [bio, userId]
    );
    if (result.rowCount === 0) {
      throw new NotFoundException('User not found or not authorized to update.');
    }
    return result.rows[0];
  }

  async addReview(reviewerId: number, data: { targetId: number, exchangeId: number, rating: number, comment: string }): Promise<any> {
    const { targetId, exchangeId, rating, comment } = data;
    // Check if target user exists
    const targetUser = await this.findOne(targetId);
    if (!targetUser) {
      throw new NotFoundException('Target user for review not found.');
    }

    // Insert the review
    const result = await this.pgService.query(
      `INSERT INTO reviews (reviewer_id, target_id, exchange_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
      [reviewerId, targetId, exchangeId, rating, comment]
    );
    return result.rows[0];
  }
}
