import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ name: 'co2_factor', type: 'numeric', precision: 10, scale: 2 })
  co2Factor: number;
}
