import { DataSource } from 'typeorm';

import config from './EnvConfig';

const database = new DataSource({
  ...config.database,
  type: 'mysql',
  synchronize: true,
  entities: ['dist/models/*.js'],
});

export default database;
