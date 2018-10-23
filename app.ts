import {createConnection} from 'typeorm';
import moment = require('moment');

import 'reflect-metadata';

export default (app) => {
  // 第一个参数 mysql 指定了挂载到 app 上的字段，我们可以通过 `app.mysql` 访问到 MySQL singleton 实例
  // 第二个参数 createMysql 接受两个参数(config, app)，并返回一个 MySQL 的实例
  // app.addSingleton('typeorm', createTypeorm);
  Date.prototype.toString = function toString(): string {
    return moment(this).format('YYYY-MM-DD HH:mm:ss');
  };
  Date.prototype.toDateString = function toString(): string {
    return moment(this).format('YYYY-MM-DD HH:mm:ss');
  };
  Date.prototype.toJSON = function toString(): string {
    return moment(this).format('YYYY-MM-DD HH:mm:ss');
  };

  app.beforeStart(async () => {
    // 从配置中心获取 MySQL 的配置 { host, post, password, ... }
    const typeormConfig = await app.config.typeorm;
    // 动态创建 MySQL 实例
    app.typeorm = await createConnection(typeormConfig);
    await app.redis.del('weapp-access-token');
  });
};

/**
 * @param  {Object} config   框架处理之后的配置项，如果应用配置了多个 MySQL 实例，会将每一个配置项分别传入并调用多次 createMysql
 * @param  {Application} app 当前的应用
 * @return {Object}          返回创建的 MySQL 实例
 */
// async function createTypeorm(config): Promise<Connection> {
//     console.log(config);
//     const connection = await createConnection(config);
//     return connection;
// }
