import { Entity, Column, PrimaryColumn, OneToMany } from "typeorm";
import Branch from "./Branch";

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
}

export default Restaurant;
