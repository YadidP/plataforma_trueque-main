import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ImpactEquivalence } from './impact-equivalence.entity';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @OneToMany(() => ImpactEquivalence, equivalence => equivalence.material)
  equivalences: ImpactEquivalence[];
}
