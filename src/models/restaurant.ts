import { Entity, Column, PrimaryColumn, OneToMany, ManyToMany } from "typeorm";
import Branch from "./Branch";
import Comment from "./Comment";
import User from "./User";

@Entity()
class Restaurant {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @Column()
  imageUrl!: string;

  @Column()
  description!: string;

  @OneToMany(() => Branch, branch => branch.restaurant)
  branches!: Branch[];

  @OneToMany(() => Comment, comment => comment.restaurant)
  comments!: Comment[];

  @ManyToMany(() => User, user => user.favoriteRestaurants, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  favoriteUsers!: User[];
}

export default Restaurant;
