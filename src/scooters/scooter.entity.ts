import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Scooter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  model: string;

  @Column({ type: 'geography' })
  location: string;

  @Column({ type: 'int', default: 0 }) // 0: INIT; 1: RENTED; 2: MAINTENANCE
  status: number;

  @Column({ type: 'decimal' })
  ratePerHour: number;

  @Column({ type: 'decimal' })
  batteryLevel: number;

  @Column({ type: 'timestamp', nullable: true })
  lastMaintenanceDate: Date;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'int', default: 0 })
  maintenanceStatus: number;
}
