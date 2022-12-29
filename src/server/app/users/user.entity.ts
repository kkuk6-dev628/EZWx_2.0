import { Certification } from './../certification/certification.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql';
import { Provider } from 'src/server/common/types/user';

// @ObjectType()
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

  @OneToMany(() => Certification, (certification) => certification.user, {
    cascade: true,
  })
  certifications: Certification[];

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;
}
