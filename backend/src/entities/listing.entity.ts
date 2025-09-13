import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';
import { Category } from './category.entity';
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
}
