import {Controller} from 'egg';
import * as moment from 'moment';
import {OrderCardOverStatus} from '../entity/order-card-over';

export default class ProviderController extends Controller {

  public async cardUser() {
    const sql = `
SELECT
  userCard.*,
  cardOver.Id as overId,
  cardOver.Status as cardOverStatus,
  user.Name,
  user.Phone,
  staff.Id as StaffId,
  staff.Phone as StaffPhone,
  staff.Name as StaffName,
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
  LEFT JOIN User AS staff
    ON staff.Id = cardOver.StaffId
  LEFT JOIN User_CarInfo AS userCarInfo
    ON userCard.UserId = userCarInfo.UserId AND userCarInfo.IsNew = 1
WHERE cardOver.ServiceProviderId = ? and cardOver.CreaTime > ? and cardOver.CreaTime < ? and cardOver.StaffId = ?
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
      obj: await this.ctx.app.typeorm.query(sql, [this.ctx.locals.user.ServiceProviderId, date, tomorrow, this.ctx.locals.user.Id]),
    };
  }
  public async cardReport() {
    const sql = `
select ordercardover.Status,ordercardover.Score from order_card_over as ordercardover
left join User_CardPackage as usercard
  on ordercardover.UserCardPackageId = usercard.Id
where usercard.Type = 0 and ordercardover.ServiceProviderId = ? and ordercardover.StaffId = ?
    `;
    const overList: any[] = await this.ctx.app.typeorm.query(sql,
      [this.ctx.locals.user.ServiceProviderId, this.ctx.locals.user.Id]);
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
        scoreRatio: score / (confirmSum * 5), // 好评率
      },
    };
  }

}
