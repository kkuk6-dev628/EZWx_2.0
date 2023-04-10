import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('cat')
export class ClearAirTurb {
  @PrimaryColumn()
  id: number;

  @Column()
  location: string;

  @Column()
  ingestion: Date;

  @Column()
  elevation: number;
}
