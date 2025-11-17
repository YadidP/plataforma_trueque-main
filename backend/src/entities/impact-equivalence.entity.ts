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

  // CORRECCIÓN: Mapeo explícito a snake_case
  @Column({ name: 'base_quantity', type: 'numeric' })
  baseQuantity: number;

  // CORRECCIÓN: Mapeo explícito a snake_case
  @Column({ name: 'base_unit', type: 'varchar', length: 50, nullable: true })
  baseUnit: string;

  // CORRECCIÓN: Mapeo explícito a snake_case
  @Column({ name: 'impact_value', type: 'numeric' })
  impactValue: number;

  // CORRECCIÓN: Mapeo explícito a snake_case
  @Column({ name: 'source_reference', type: 'text', nullable: true })
  sourceReference: string;
}