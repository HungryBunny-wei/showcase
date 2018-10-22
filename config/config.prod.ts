import {EggAppConfig, PowerPartial} from 'egg';
import * as path from 'path';

export default () => {
  const config: PowerPartial<EggAppConfig> = {};
  config.redis = {
    client: {
      host: '127.0.0.1',
      // host: '120.77.240.193',
      // host: '47.105.84.128',
      port: '6379',
      // password: 'rabbit-redis',
      db: '0',
    },
  };
  config.typeorm = {
    type: 'mysql',
    // host: '47.105.84.128',
    // host: '120.77.240.193',
    host: 'localhost',
    port: 3306,
    username: 'meiyou_3a4c5a_cn',
    password: 'si3KzSXzJWW7d3j5',
    database: 'meiyou_3a4c5a_cn',
    timezone: '+08:00',
    synchronize: false,
    // dateStrings: true,
    logging: false,
    // enableAnsiNullDefault: true,
    entities: [
      'app/entity/**/*.js',
    ],
    migrations: [
      'app/migration/**/*.ts',
    ],
    subscribers: [
      'app/subscriber/**/*.ts',
    ],
    cli: {
      entitiesDir: 'app/entity',
      migrationsDir: 'app/migration',
      subscribersDir: 'app/subscriber',
    },
  };
  config.logger = {
    dir: path.join(__dirname, '../logs/prod'),
  };
  return config;
};
