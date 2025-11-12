import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from 'typeorm';
import { Category } from './category.entity';
import { Material } from './material.entity';

@Entity('subcategories')
export class Subcategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => Category, category => category.subcategories)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToMany(() => Material)
  @JoinTable({
    name: 'subcategory_materials',
    joinColumn: { name: 'subcategory_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'material_id', referencedColumnName: 'id' },
  })
  materials: Material[];
}
