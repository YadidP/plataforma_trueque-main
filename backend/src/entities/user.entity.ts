import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, Index } from 'typeorm';
import { UserRole } from '../common/enums';
import { Wallet } from './wallet.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Index({ unique: true })
  @Column({ length: 100, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: ['usuario', 'emprendedor', 'ong', 'admin'],
    default: 'usuario',
  })
  role: UserRole;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToOne(() => Wallet, wallet => wallet.user)
  wallet: Wallet;
}
