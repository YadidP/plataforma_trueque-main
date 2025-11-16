import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Subcategory } from './subcategory.entity'; // Import Subcategory
import { Material } from './material.entity'; // Import Material
import { ListingImage } from './listing-image.entity';
import { ListingStatus } from '../common/enums';

@Entity('listings')
export class Listing {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'author_id' })
  authorId: number;

  @Column({ length: 150 })
  title: string;

  @Column('text')
  description: string;

  @Index()
  @Column({ name: 'category_id' })
  categoryId: number;

  @Index()
  @Column({ name: 'subcategory_id' }) // New field
  subcategoryId: number;

  @Index()
  @Column({ name: 'material_id', nullable: true }) // New field - OPTIONAL
  materialId?: number;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true }) // New field - OPTIONAL
  quantity?: number;

  @Column({ name: 'quantity_range', length: 50, nullable: true }) // New field for ranges
  quantityRange?: string;

  @Column({ name: 'unit_credits', type: 'numeric', precision: 10, scale: 2 })
  unitCredits: number;

  @Column({ name: 'unit_label', length: 50, nullable: true }) // OPTIONAL
  unitLabel?: string;

  @Column({ name: 'image_url', length: 255, nullable: true })
  imageUrl: string;

  @Index()
  @Column({ length: 20, default: 'activa' })
  status: ListingStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => Subcategory)
  @JoinColumn({ name: 'subcategory_id' })
  subcategory: Subcategory;

  @ManyToOne(() => Material)
  @JoinColumn({ name: 'material_id' })
  material?: Material;

  @OneToMany(() => ListingImage, (image) => image.listing, { cascade: true, eager: true })
  images: ListingImage[];
}
