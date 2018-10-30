import {Subscription} from 'egg';
import {LessThan, MoreThan} from 'typeorm';
import {UserCardPackage} from '../entity/user-card-package';

import * as moment from 'moment';
import {OrderCardOver, OrderCardOverStatus} from '../entity/order-card-over';
import {User} from '../entity/user';

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
      const userRepo = this.ctx.app.typeorm.getRepository(User);
      // const orderCardOverList: OrderCardOver[] = []; // 生成的订单
      const userCardPackageList: User[] = []; // 通知的月卡
      // 查询有效的月卡
      const userList = await userRepo.find({
        where: {
          CardStartTime: LessThan(moment().add(1, 'days').format('YYYY-MM-DD')),
          CardDays: MoreThan(0),
        },
        order: {
          CardStartTime: 'ASC',
        },
      });
      const userCardPackage = await userCardPackageRepo.find({
        where: {
          StartTime: LessThan(moment().add(1, 'days').format('YYYY-MM-DD')),
          Days: MoreThan(0),
        },
        order: {
          EndTime: 'ASC',
        },
      });
      for (const user of userList) {
        const index = user.CardDays;
        // 计算剩余天数
        user.CardDays = moment(user.CardEndTime).diff(moment(), 'days');
        // 如果天数为3消息提示
        if (index !== user.CardDays) {
          await userRepo.save(user);
          if (user.CardDays === 3 || user.CardDays === 1) {
            userCardPackageList.push(user);
          }
        }
      }
      for (const _userCardPackage of userCardPackage) {
        const index = _userCardPackage.Days;
        // 天数大于0就生成订单完成记录
        if (_userCardPackage.Days > 0) {
          const noSave = await orderCardOverRepo.findOne({
            where: {
              UserId: _userCardPackage.UserId,
              ServiceProviderId: _userCardPackage.ServiceProviderId,
              CreaTime: MoreThan(moment(new Date()).format('YYYY-MM-DD')),
            },
          });
          if (!noSave) {
            const _orderCardOver = new OrderCardOver();
            _orderCardOver.Status = OrderCardOverStatus.noStart;
            _orderCardOver.UserCardPackageId = _userCardPackage.Id;
            _orderCardOver.UserId = _userCardPackage.UserId;
            _orderCardOver.ServiceProviderId = _userCardPackage.ServiceProviderId;
            _orderCardOver.ServiceProviderName = _userCardPackage.ServiceProviderName;
            await orderCardOverRepo.save(_orderCardOver);
          }
        }
        // 计算剩余天数
        _userCardPackage.Days = moment(_userCardPackage.EndTime).diff(moment(), 'days');
        if (index !== _userCardPackage.Days) {
          await userCardPackageRepo.save(userCardPackage);
        }
      }
      await ctx.service.weapp.sendCardEndTime(userCardPackageList);
    } catch (e) {
      await ctx.service.weapp.sendError(e);
    }
  }
}
