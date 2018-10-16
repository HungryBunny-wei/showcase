import {Subscription} from 'egg';
import {LessThan, MoreThan} from 'typeorm';
import {UserCardPackage} from '../entity/user-card-package';

import * as moment from 'moment';
import {OrderCardOver, OrderCardOverStatus} from '../entity/order-card-over';

export default class UpdateCache extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      // cron: '0 0 0 * * ? ',
      interval: '5m', // 1 分钟间隔
      type: 'worker', // 指定所有的 worker 都需要执行
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const ctx = this.ctx;
    try {
      const userCardPackageRepo = this.ctx.app.typeorm.getRepository(UserCardPackage);
      const orderCardOverRepo = this.ctx.app.typeorm.getRepository(OrderCardOver);
      // const orderCardOverList: OrderCardOver[] = []; // 生成的订单
      const userCardPackageList: UserCardPackage[] = []; // 通知的月卡
      // 查询有效的月卡
      const userCardPackage = await userCardPackageRepo.find({
        where: {
          StartTime: LessThan(moment().add('days', 1).format('YYYY-MM-DD')),
          Days: MoreThan(0),
        },
      });
      for (const _userCardPackage of userCardPackage) {
        // 如果天数为3消息提示
        if (_userCardPackage.Days === 3 || _userCardPackage.Days === 1) {
          userCardPackageList.push(_userCardPackage);
        }
        // 天数大于0就生成订单完成记录
        if (_userCardPackage.Days > 0) {
          const _orderCardOver = new OrderCardOver();
          _orderCardOver.Status = OrderCardOverStatus.noStart;
          _orderCardOver.UserCardPackageId = _userCardPackage.Id;
          _orderCardOver.UserId = _userCardPackage.UserId;
          _orderCardOver.ServiceProviderId = _userCardPackage.ServiceProviderId;
          _orderCardOver.ServiceProviderName = _userCardPackage.ServiceProviderName;
          const noSave = await orderCardOverRepo.findOne({
            where: {
              UserId: _userCardPackage.UserId,
              ServiceProviderId: _userCardPackage.ServiceProviderId,
              CreaTime: MoreThan(moment(new Date()).format('YYYY-MM-DD')),
            },
          });
          if (!noSave) {
            await orderCardOverRepo.save(_orderCardOver);
          }
        }
        // 计算剩余天数
        _userCardPackage.Days = moment(_userCardPackage.EndTime).diff(moment(), 'days');
      }
      await ctx.service.weapp.sendCardEndTime(userCardPackageList);
      // await orderCardOverRepo.save(orderCardOverList);
      await userCardPackageRepo.save(userCardPackage);
    } catch (e) {
      await ctx.service.weapp.sendError(e);
    }
  }
}
