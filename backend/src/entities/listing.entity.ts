import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
import { Subcategory } from './subcategory.entity'; // Import Subcategory
import { Material } from './material.entity'; // Import Material
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
  @Column({ name: 'material_id' }) // New field
  materialId: number;

  @Column({ type: 'numeric', precision: 10, scale: 2 }) // New field
  quantity: number;

  @Column({ name: 'unit_credits', type: 'numeric', precision: 10, scale: 2 })
  unitCredits: number;

  @Column({ name: 'unit_label', length: 50 })
  unitLabel: string;

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

  @ManyToOne(() => Subcategory) // New relationship
  @JoinColumn({ name: 'subcategory_id' })
  subcategory: Subcategory;

  @ManyToOne(() => Material) // New relationship
  @JoinColumn({ name: 'material_id' })
  material: Material;
}
