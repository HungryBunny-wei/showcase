import {Subscription} from 'egg';

export default class UpdateCache extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '110m', // 110 分钟间隔
      type: 'worker', // 指定所有的 worker 都需要执行
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const redis = this.ctx.app.redis;
    await redis.del('weapp-access-token');
    await this.ctx.service.wachat.accessToken();
  }
}
