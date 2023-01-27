import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: ['dist/src/server/migration/*.js'],
  migrationsRun: true,
};

const source = new DataSource(typeOrmConfig);

export default source;
