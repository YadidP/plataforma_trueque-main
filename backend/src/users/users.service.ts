import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { PgService } from 'src/database/pg.service'; // Import PgService

@Injectable()
export class UsersService {
  constructor(
    private readonly pgService: PgService, // Inject PgService
  ) {}

  async create(createUserDto: CreateUserDto): Promise<any> { // Change return type to any as it's no longer a TypeORM entity
    const existingUser = await this.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);
    // Destructure password out, as it's not stored directly
    // The CreateUserDto does not have a 'role' property, so we explicitly set it to 'usuario'
    const { password, ...userData } = createUserDto; 

    // Using raw SQL insert
    const query = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at, updated_at;
    `;
    const values = [createUserDto.name, createUserDto.email, passwordHash, 'usuario']; // Explicitly set role
    const result = await this.pgService.query(query, values);
    return result.rows[0]; // Return the newly created user
  }

  async findAll(): Promise<any[]> { // Change return type
    const result = await this.pgService.query('SELECT id, name, email, role, created_at, updated_at FROM users;');
    return result.rows;
  }

  async findOne(id: number): Promise<any | null> { // Change return type
    const result = await this.pgService.query('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1;', [id]);
    return result.rows[0] || null;
  }
  
  async findOneByEmail(email: string): Promise<any | null> { // Change return type
    const result = await this.pgService.query('SELECT id, name, email, role, created_at, updated_at FROM users WHERE email = $1;', [email]);
    return result.rows[0] || null;
  }
}
