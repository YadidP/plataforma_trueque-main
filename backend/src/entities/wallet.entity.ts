import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn, OneToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'user_id' })
  userId: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.00 })
  balance: number;

  @UpdateDateColumn({ name: 'last_updated', type: 'timestamptz' })
  lastUpdated: Date;

  @OneToOne(() => User, user => user.wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
