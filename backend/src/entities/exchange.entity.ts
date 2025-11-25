import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { Listing } from './listing.entity';
import { User } from './user.entity';
import { ExchangeImpact } from './exchange-impact.entity';


@Entity('exchanges')
export class Exchange {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'listing_id' })
  listingId: number;

  @Index()
  @Column({ name: 'buyer_id' })
  buyerId: number;

  @Index()
  @Column({ name: 'seller_id' })
  sellerId: number;

  @Column('int')
  quantity: number;

  @Column({ name: 'credits_per_unit', type: 'numeric', precision: 10, scale: 2 })
  creditsPerUnit: number;

  @Column({ name: 'credits_total', type: 'numeric', precision: 10, scale: 2 })
  creditsTotal: number;

  @CreateDateColumn({ name: 'exchange_date', type: 'timestamptz' })
  exchangeDate: Date;

  @ManyToOne(() => Listing)
  @JoinColumn({ name: 'listing_id' })
  listing: Listing;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller: User;

  @OneToMany(() => ExchangeImpact, exchangeImpact => exchangeImpact.exchange)
  impacts: ExchangeImpact[];
}


