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
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { Route } from '../api/route/route.entity';

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
  displayName: string;

  @Column({ nullable: true })
  alternateEmail: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  address1: string;

  @Column({ nullable: true })
  address2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  stateProvince: string;

  @Column({ nullable: true })
  zip: string;

  @Column({ nullable: true })
  phoneType: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  receive_news: boolean;

  @Column({ default: false })
  is_admin: boolean;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;

  @ManyToMany(() => Certification, {
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable({
    name: 'user_certification',
  })
  certifications: Certification[];

  @OneToMany(() => Route, (route) => route.user)
  routes: Route[];

  //   @OneToOne(()=>UserSettings, (UserSettings=>UserSettings.user_id))
  //  @JoinColumn()
  //   userSettings:UserSettings;
}
