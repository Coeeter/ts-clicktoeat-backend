import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import Restaurant from "./Restaurant";
import User from "./User";

@Entity()
class Comment {
  @PrimaryColumn()
  id!: string;

  @Column()
  review!: string;

  @Column()
  rating!: number;

  @Column({
    default: null,
  })
  parentComment!: string;

  @CreateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP(6)",
    onUpdate: "CURRENT_TIMESTAMP(6)",
  })
  updated_at!: Date;

  @ManyToOne(() => User, user => user.comments, {
    eager: true,
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  user!: User;

  @ManyToOne(() => Restaurant, restaurant => restaurant.comments, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    eager: true,
  })
  restaurant!: Restaurant;
}

export default Comment;
