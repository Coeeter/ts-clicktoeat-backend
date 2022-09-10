import express, { Express } from "express";
import config from "./config/EnvConfig";
import expressFileUpload from "express-fileupload";
import database from "./config/DatabaseConfig";
import routes from "./routes";

database.initialize().then(() => {
  const app: Express = express();

  app.use(express.json());
  app.use(expressFileUpload());
  app.use("/files", express.static("uploads"));

  app.use("/", routes);

  app.listen(config.server.port, () => {
    console.log(`Server is running on port ${config.server.port}`);
  });
});
