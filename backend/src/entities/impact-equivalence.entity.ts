import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Material } from './material.entity';
import { ImpactMetric } from './impact-metric.entity';

@Entity('impact_equivalences')
export class ImpactEquivalence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'material_id' })
  materialId: number;

  @ManyToOne(() => Material, material => material.equivalences)
  @JoinColumn({ name: 'material_id' })
  material: Material;

  @Column({ name: 'metric_id' })
  metricId: number;

  @ManyToOne(() => ImpactMetric, metric => metric.equivalences)
  @JoinColumn({ name: 'metric_id' })
  metric: ImpactMetric;

  @Column({ type: 'numeric' })
  baseQuantity: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  baseUnit: string;

  @Column({ type: 'numeric' })
  impactValue: number;

  @Column({ type: 'text', nullable: true })
  sourceReference: string;
}
