import { compare, hash } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';

import config from '../config/EnvConfig';
import Comment from './Comment';
import Image from './Image';
import Restaurant from './Restaurant';

@Entity()
class User {
  @PrimaryColumn()
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @OneToOne(() => Image, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  image!: Image;

  @OneToMany(() => Comment, comment => comment.user)
  comments!: Comment[];

  @ManyToMany(() => Restaurant, restaurant => restaurant.favoriteUsers, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinTable()
  favoriteRestaurants!: Restaurant[];

  @ManyToMany(() => Comment, comment => comment.likes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  likedComments!: Comment[];

  @ManyToMany(() => Comment, comment => comment.dislikes, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  dislikedComments!: Comment[];

  public setPassword = async (password: string) => {
    this.password = await hash(password, 10);
  };

  public comparePasswords = async (password: string) => {
    return await compare(password, this.password);
  };

  public generateToken = () => {
    return sign(
      {
        id: this.id,
        username: this.username,
        email: this.email,
      },
      config.server.secret,
      {
        expiresIn: '60d',
      }
    );
  };
}

export default User;
