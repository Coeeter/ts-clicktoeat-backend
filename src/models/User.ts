import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
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
import {
  NotificationType,
  sendPushNotification,
} from '../config/NotificationConfig';
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

  @Column({ default: null })
  fcmToken!: string;

  @OneToOne(() => Image, {
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
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

  public generatePasswordResetUrl = () => {
    const tokenizedEmail = sign({ email: this.email }, config.server.secret);
    const tokenizedUserCredentials = sign(
      { username: this.username },
      this.password,
      { expiresIn: '15min' }
    );
    return `/reset-password?e=${tokenizedEmail}&c=${tokenizedUserCredentials}`;
  };

  public isPasswordResetCredentialsValid = (userCredentials: string) => {
    try {
      const { username } = verify(userCredentials, this.password) as {
        username: string;
      };
      return username === this.username;
    } catch (e) {
      return false;
    }
  };

  public sendPushNotificationToDevice = async (
    type: NotificationType,
    username: string,
    commentId: string,
    createdItemId: string
  ) => {
    if (!this.fcmToken) return;

    const body = this.getBodyFromType(type);
    const notification = { title: username, body };
    const data = {
      type,
      commentId,
      createdItemId,
    };

    await sendPushNotification(this.fcmToken, notification, data);
  };

  private getBodyFromType = (type: NotificationType): string => {
    switch (type) {
      case NotificationType.COMMENT: {
        return 'Replied to your comment';
      }
      case NotificationType.DISLIKE: {
        return 'Disliked your comment';
      }
      case NotificationType.LIKE: {
        return 'Liked your comment';
      }
    }
  };
}

export default User;
