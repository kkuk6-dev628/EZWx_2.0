import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('favorites_items')
export class FavoriteItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  userId: number;

  @Column()
  text: string;

  @Column()
  selected: boolean;

  @Column()
  droppable: boolean;

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
    nullable: true,
  })
  data: string;

  @Column()
  parent: number;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}

@Entity('favorites_orders')
export class FavoritesOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  userId: number;

  @Column({
    transformer: {
      from: (value: string) => JSON.parse(value),
      to: (value: any) => JSON.stringify(value),
    },
    nullable: true,
  })
  order: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at?: Date;
}
