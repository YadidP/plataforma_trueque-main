import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('credit_purchases')
export class CreditPurchase {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'user_id' })
  userId: number;

  @Column('int')
  credits: number;

  @Column({ name: 'amount_bs', type: 'numeric', precision: 10, scale: 2 })
  amountBs: number;

  @Column({ length: 20, default: 'pagado' })
  status: string;

  @Column({ name: 'payment_ref', length: 100, nullable: true })
  paymentRef: string;

  @CreateDateColumn({ name: 'purchase_date', type: 'timestamptz' })
  purchaseDate: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
