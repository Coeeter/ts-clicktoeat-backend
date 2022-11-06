import {
    Column, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryColumn
} from 'typeorm';

import Branch from './Branch';
import Comment from './Comment';
import Image from './Image';
import User from './User';

@Entity()
class Restaurant {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @OneToOne(() => Image, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  image!: Image;

  @OneToMany(() => Branch, branch => branch.restaurant)
  branches!: Branch[];

  @OneToMany(() => Comment, comment => comment.restaurant)
  comments!: Comment[];

  @ManyToMany(() => User, user => user.favoriteRestaurants, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  favoriteUsers!: User[];
}

export default Restaurant;
