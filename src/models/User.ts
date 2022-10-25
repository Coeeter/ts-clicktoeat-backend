import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { Column, Entity, PrimaryColumn } from "typeorm";
import config from "../config/EnvConfig";

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

  @Column({
    default: null,
  })
  image!: string;

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
        expiresIn: "60d",
      }
    );
  };
}

export default User;
