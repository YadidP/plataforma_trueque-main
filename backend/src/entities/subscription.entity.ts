import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UserSubscription } from './user-subscription.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  priceBs: number;

  @Column()
  durationDays: number;

  @Column('text', { nullable: true })
  description: string;

  @OneToMany(() => UserSubscription, userSub => userSub.subscription)
  userSubscriptions: UserSubscription[];
}