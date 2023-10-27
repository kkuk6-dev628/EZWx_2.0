import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('airportwx_state')
export class AirportwxState {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ unique: true })
  userId: number;

  @Column()
  airport: string;

  @Column()
  viewType: string;

  @Column()
  chartType: string;

  @Column()
  windLayer: string;

  @Column({
    transformer: {
      from: (value: string) => JSON.parse(value),
      to: (value: any) => JSON.stringify(value),
    },
  })
  icingLayers: string;

  @Column({
    transformer: {
      from: (value: string) => JSON.parse(value),
      to: (value: any) => JSON.stringify(value),
    },
  })
  turbLayers: string;

  @Column()
  maxAltitude: number;

  @Column({ nullable: true })
  showTemperature!: boolean;

  @Column()
  chartDays: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}
