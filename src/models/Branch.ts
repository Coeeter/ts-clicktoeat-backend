import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';

import Restaurant from './Restaurant';

@Entity()
class Branch {
  @PrimaryColumn()
  id!: string;

  @Column({ type: 'double' })
  latitude!: number;

  @Column({ type: 'double' })
  longitude!: number;

  @Column()
  address!: string;

  @ManyToOne(() => Restaurant, restaurant => restaurant.branches, {
    eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  restaurant!: Restaurant;
}

export default Branch;
