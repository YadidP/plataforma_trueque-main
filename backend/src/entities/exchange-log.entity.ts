import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn, Index } from 'typeorm';
import { Exchange } from './exchange.entity';

@Entity('exchange_log')
export class ExchangeLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'exchange_id' })
  exchangeId: number;

  @Column('text')
  details: string;

  @CreateDateColumn({ name: 'log_date', type: 'timestamptz' })
  logDate: Date;

  @OneToOne(() => Exchange)
  @JoinColumn({ name: 'exchange_id' })
  exchange: Exchange;
}
