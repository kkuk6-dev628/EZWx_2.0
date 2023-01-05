import { Certification } from '../certification/certification.entity';

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  Unique,
  JoinTable,
} from 'typeorm';

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column()
  email: string;

  @Column()
  hash: string;

  @Column()
  hearAbout: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @ManyToMany(() => Certification, { cascade: true, onDelete: 'CASCADE' })
  @JoinTable({
    name: 'user_certification',
  })
  certifications: Certification[];
}
