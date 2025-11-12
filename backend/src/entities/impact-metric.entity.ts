import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ImpactEquivalence } from './impact-equivalence.entity';

@Entity('impact_metrics')
export class ImpactMetric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  unit: string;

  @OneToMany(() => ImpactEquivalence, equivalence => equivalence.metric)
  equivalences: ImpactEquivalence[];
}
