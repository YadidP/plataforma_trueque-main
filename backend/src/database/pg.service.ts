import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PgService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables.');
    }
    
    this.pool = new Pool({
      connectionString: databaseUrl,
    });

    try {
      await this.pool.query('SELECT 1');
      console.log('PostgreSQL database connected successfully!');
    } catch (error) {
      console.error('Failed to connect to PostgreSQL database:', error.message);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  /**
   * Executes a SQL query with optional parameters.
   * @param text The SQL query string.
   * @param params An optional array of query parameters.
   * @returns The result of the query.
   */
  async query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }
}
