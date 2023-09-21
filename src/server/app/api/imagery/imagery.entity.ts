import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('imagery')
export class Imagery {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ unique: true })
  userId: number;

  @Column()
  selectedLvl1: number;

  @Column({ nullable: true })
  selectedLvl2: number;

  @Column({ nullable: true })
  selectedLvl3: number;

  @Column({ nullable: true })
  selectedLvl4: number;

  @Column()
  selectedImageryName: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}
