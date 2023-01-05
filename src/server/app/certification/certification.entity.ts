import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Certification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;
}
