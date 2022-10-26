import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import Branch from "./Branch";
import Comment from "./Comment";

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
}

export default Restaurant;
