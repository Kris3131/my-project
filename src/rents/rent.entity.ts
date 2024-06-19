import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Scooter } from '../scooters/scooter.entity';

@Entity()
export class Rent {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Scooter)
  @JoinColumn({ name: 'scooter_id' })
  scooter: Scooter;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'decimal', nullable: true })
  totalCost: number;

  @Column({ type: 'geography' })
  startLocation: string;

  @Column({ type: 'geography', nullable: true })
  endLocation: string;

  @Column({ type: 'int', default: 0 }) // 0: INIT; 1: TRIP; 2: COMPLETED; 4: CANCEL
  status: number;

  @Column({ type: 'int' })
  paymentType: number;

  @Column({ type: 'int', default: 0 }) // 0: INIT; 2: SUCCESS; 3: FAILED
  paymentStatus: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'decimal', nullable: true })
  distanceTraveled: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;
}
