import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Exchange } from './exchange.entity';

@Entity('exchange_impacts')
export class ExchangeImpact {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'exchange_id', type: 'bigint' })
    exchangeId: number;

    @Column({ name: 'metric_code', length: 50 })
    metricCode: string;

    @Column({ name: 'metric_name', length: 100 })
    metricName: string;

    @Column({ name: 'metric_unit', length: 50 })
    metricUnit: string;

    @Column({ name: 'impact_value', type: 'numeric', precision: 10, scale: 2 })
    impactValue: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;

    @ManyToOne(() => Exchange)
    @JoinColumn({ name: 'exchange_id' })
    exchange: Exchange;
}

