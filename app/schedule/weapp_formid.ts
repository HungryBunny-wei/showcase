import {Subscription} from 'egg';
import {WeappForm} from '../entity/weapp-form';

import * as moment from 'moment';
export default class UpdateCache extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      // interval: '110m', // 110 分钟间隔
      cron: '0 0 0 * * ? ',
      type: 'worker', // 指定所有的 worker 都需要执行
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const weappFormRepo = this.ctx.app.typeorm.getRepository(WeappForm);
    const weappFormList = await weappFormRepo.find();
    for (const _form of weappFormList) {
      const now = moment().format('YYYY-MM-DD');
      const days = moment(_form.CreaTime).add('days', 6).diff(moment(now), 'days');
      if (days < 1) {
        await weappFormRepo.delete(_form);
      }
    }
  }
}
