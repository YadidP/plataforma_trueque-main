import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Exchange } from './exchange.entity';
import { Listing } from './listing.entity';

@Entity('claims')
export class Claim {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'exchange_id', nullable: true })
    exchangeId: number;

    @ManyToOne(() => Exchange, { nullable: true })
    @JoinColumn({ name: 'exchange_id' })
    exchange: Exchange;

    @Column({ name: 'listing_id', nullable: true })
    listingId: number;

    @ManyToOne(() => Listing, { nullable: true })
    @JoinColumn({ name: 'listing_id' })
    listing: Listing;

    @Column({ name: 'claimant_id' })
    claimantId: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'claimant_id' })
    claimant: User;

    @Column()
    reason: string;

    @Column({ default: 'abierto' })
    status: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'resolved_at', nullable: true })
    resolvedAt: Date;
}
