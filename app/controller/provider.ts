import {Controller} from 'egg';
import {Repository} from 'typeorm';
import {OrderCardOver, OrderCardOverStatus} from '../entity/order-card-over';
import {ServiceProvider, ServiceProviderStatus} from '../entity/service-provider';
import {ErrorService} from '../lib/error/error.service';

import * as moment from 'moment';

export default class ProviderController extends Controller {

  public async save() {
    const localUser = this.ctx.locals.user;
    const body = this.ctx.request.body;
    const serviceProvider = new ServiceProvider();
    serviceProvider.Address = body.Address;
    serviceProvider.AddressName = body.AddressName;
    serviceProvider.Latitude = body.Latitude;
    serviceProvider.Longitude = body.Longitude;
    serviceProvider.Name = body.Name;
    serviceProvider.Phone = body.Phone;
    serviceProvider.UserId = localUser.Id;
    serviceProvider.Status = ServiceProviderStatus.start;
    this.ctx.body = {
      success: true,
      obj: await this.ctx.service.provider.save(serviceProvider),
    };
  }

  public async get() {
    const localUser = this.ctx.locals.user;
    this.ctx.body = {
      success: true,
      obj: await this.ctx.service.provider.findOne(localUser.ServiceProviderId),
    };
  }

  public async update() {
    const body: object = this.ctx.request.body;
    const serviceProvider = this.ctx.app.typeorm.getRepository(ServiceProvider).create(body);
    this.ctx.body = {
      success: true,
      obj: await this.ctx.service.provider.update(serviceProvider),
    };
  }

  public async cardUser() {
    const sql = `
SELECT
  userCard.*,
  cardOver.Id as overId,
  cardOver.Status as cardOverStatus,
  user.Name,
  user.Phone,
  userCarInfo.Address,
  userCarInfo.AddressName,
  userCarInfo.Latitude,
  userCarInfo.Longitude,
  userCarInfo.Brand,
  userCarInfo.CarModel,
  userCarInfo.LicencePlate
FROM order_card_over AS cardOver
  LEFT JOIN User_CardPackage AS userCard
    ON userCard.Id = cardOver.UserCardPackageId
  LEFT JOIN User AS user
    ON user.Id = userCard.UserId
  LEFT JOIN User_CarInfo AS userCarInfo
    ON userCard.UserId = userCarInfo.UserId AND userCarInfo.IsNew = 1
WHERE cardOver.ServiceProviderId = ? and cardOver.CreaTime > ? and cardOver.CreaTime < ?
    `;
    let date: string;
    if (this.ctx.query.date) {
      date = moment(this.ctx.query.date).hours(0).minutes(0).seconds(0).milliseconds(0).toDate().toString();
    } else {
      date = moment().hours(0).minutes(0).seconds(0).milliseconds(0).toDate().toString();
    }
    const tomorrow = moment(date).add('days', 1).toDate().toString();
    this.ctx.body = {
      success: true,
      obj: await this.ctx.app.typeorm.query(sql, [this.ctx.locals.user.ServiceProviderId, date, tomorrow]),
    };
  }

  public async cardOver() {
    const orderCardOverRepo: Repository<OrderCardOver> = this.ctx.app.typeorm.getRepository(OrderCardOver);

    const orderCardOver = await orderCardOverRepo.findOne({
      where: {
        Id: this.ctx.request.body.Id,
      },
    });
    if (!orderCardOver) {
      throw ErrorService.RuntimeErrorNotFind();
    }
    orderCardOver.Status = OrderCardOverStatus.start;
    orderCardOver.uid = this.ctx.request.body.uid;
    await orderCardOverRepo.save(orderCardOver);
    const user = await this.ctx.service.user.findOne(orderCardOver.UserId);
    await this.ctx.service.weapp.sendServiceOver(user, orderCardOver);
    this.ctx.body = {
      success: true,
      obj: orderCardOver,
    };
  }

  public async cardLookOver() {
    this.ctx.body = {
      success: true,
      obj: await this.ctx.service.user.cardLookOver(this.ctx.request.body.Id, this.ctx.request.body.date),
    };
  }

  public async cardReport() {
    const sql = `
select ordercardover.Status,ordercardover.Score from order_card_over as ordercardover
left join User_CardPackage as usercard
  on ordercardover.UserCardPackageId = usercard.Id
where usercard.Type = 0 and ordercardover.ServiceProviderId = ?
    `;
    const overList: any[] = await this.ctx.app.typeorm.query(sql,
      [this.ctx.locals.user.ServiceProviderId]);
    const sumSQl = `
    select sum(ordercard.RealPayment) as sum from User_CardPackage as usercard
left join Order_Card as ordercard
  on usercard.OrderCardId = ordercard.Id
  WHERE usercard.ServiceProviderId = ?
GROUP BY usercard.ServiceProviderId
`;
    const sum: any[] = await this.ctx.app.typeorm.query(sumSQl,
      [this.ctx.locals.user.ServiceProviderId]);
    let confirmSum = 0;
    let score = 0;
    for (const _over of overList) {
      if (_over.Status.toString() === OrderCardOverStatus.confirm.toString()) {
        confirmSum++;
        if (_over.Score) {
          score += _over.Score;
        }
      }
    }
    this.ctx.body = {
      success: true,
      obj: {
        over: overList.length, // 订单数量
        confirm: confirmSum, // 客户确认数量
        overRatio: confirmSum / overList.length, // 完成比率 (订单数量/客户确认数量)
        moneySum: sum[0].sum, // 收益
        scoreRatio: score / (confirmSum * 5), // 好评率
      },
    };
  }
}
