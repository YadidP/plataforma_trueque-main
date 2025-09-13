import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('impact_daily')
export class ImpactDaily {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ name: 'impact_date', type: 'date' })
  impactDate: Date;

  @Column({ name: 'reused_items', type: 'int', default: 0 })
  reusedItems: number;

  @Column({ name: 'co2_saved_kg', type: 'numeric', precision: 10, scale: 2, default: 0.00 })
  co2SavedKg: number;

  @Column({ name: 'service_hours', type: 'numeric', precision: 10, scale: 2, default: 0.00 })
  serviceHours: number;
}
