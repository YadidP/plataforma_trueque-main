import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Listing } from './listing.entity';

@Entity('listing_images')
export class ListingImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'listing_id' })
  listingId: number;

  @Column({ name: 'image_url', length: 255 })
  imageUrl: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Listing, (listing) => listing.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listing_id' })
  listing: Listing;
}
