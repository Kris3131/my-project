import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('scooters')
export class Scooter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  model: string;

  @Column('geography', { spatialFeatureType: 'Point', srid: 4326 })
  location: string;

  @Column()
  status: number;

  @Column('decimal', { nullable: true })
  battery_level: number;

  @Column({ type: 'timestamp', nullable: true })
  last_maintenance_date: Date;

  @Column({ default: false })
  is_deleted: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
