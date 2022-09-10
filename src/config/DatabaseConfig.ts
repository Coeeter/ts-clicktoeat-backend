import { DataSource } from "typeorm";
import models from "../models";
import config from "./EnvConfig";

const source = new DataSource({
  ...config.database,
  type: "mysql",
  synchronize: true,
  entities: models,
});

export default source;
