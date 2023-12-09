import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('recent_airport')
export class RecentAirport {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  userId: number;

  @Column()
  airportId: string;

  @Column({
    transformer: {
      from: (value: string) => {
        try {
          return JSON.parse(value);
        } catch (e) {
          return false;
        }
      },
      to: (value: any) => JSON.stringify(value),
    },
  })
  airport: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}
