import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class Image {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  key!: string;

  @Column()
  url!: string;
}

export default Image;
