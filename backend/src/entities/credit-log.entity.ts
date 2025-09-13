import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('credits_log')
export class CreditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'operation_type', length: 100 })
  operationType: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  delta: number;

  @Column({ name: 'balance_after', type: 'numeric', precision: 10, scale: 2 })
  balanceAfter: number;

  @Column({ name: 'related_id', nullable: true })
  relatedId: number;

  @CreateDateColumn({ name: 'log_date', type: 'timestamptz' })
  logDate: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
