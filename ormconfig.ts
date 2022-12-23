import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

dotenv.config();

// const source = new DataSource({
//   type: 'postgres' as const,
//   url: process.env.DATABASE_URL,
//   entities: ['src/server/app/**/*.entity.ts'],
//   migrations: ['src/server/migration/*.{ts,js}'],
//   extra: {
//     ssl:
//       process.env.NODE_ENV === 'production'
//         ? { rejectUnauthorized: false }
//         : false,
//   },
// });

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/src/server/app/**/*.entity{.ts,.js}'],
  synchronize: true,
};
