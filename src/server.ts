import express, { Express } from 'express';
import fileUpload from 'express-fileupload';

import database from './config/DatabaseConfig';
import config from './config/EnvConfig';
import routes from './routes';

(async () => {
  try {
    await database.initialize();
  } catch (e) {
    return console.log(e);
  }

  const app: Express = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(fileUpload());

  app.use('/', routes);

  app.listen(config.server.port, () => {
    console.log(`Server is running on port ${config.server.port}`);
  });
})();
