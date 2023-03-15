import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: ['dist/src/server/migration/*.js'],
  migrationsRun: true,
};

export const gisdbConfig: DataSourceOptions = {
  type: 'postgres',
  name: 'gisDB',
  url: process.env.GISDB_URL,
  useUTC: true,
  entities: [__dirname + '/**/*.gisdb-entity{.ts,.js}'],
};

const source = new DataSource(typeOrmConfig);

export default source;
