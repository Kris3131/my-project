import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  phone: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  userIdNumber: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ type: 'bytea', nullable: true })
  license: Buffer;

  @Column({ type: 'bytea', nullable: true })
  idCard: Buffer;

  @Column({ type: 'bytea', nullable: true })
  profilePicture: Buffer;

  @Column({ type: 'int', default: 0 })
  paymentType: number;

  @Column({ type: 'varchar', length: 20, nullable: true })
  creditCardNumber: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  creditCardExpiration: string;

  @Column({ type: 'geography', nullable: true })
  location: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;
}
