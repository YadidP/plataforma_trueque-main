import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;
}
