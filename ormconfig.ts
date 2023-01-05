import 'dotenv/config';
import { DataSource } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/src/server/app/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/src/server/migration/*.{ts,js}'],
  // synchronize: true,
};

const source = new DataSource({
  type: 'postgres' as const,
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/src/server/app/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/src/server/migration/*.{ts,js}'],
  extra: {
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  },
});

export default source;
