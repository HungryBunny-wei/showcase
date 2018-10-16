import {Service} from 'egg';
import {WeappForm} from '../entity/weapp-form';
import {Repository} from 'typeorm';
import {User} from '../entity/user';
import {MonthCardType, UserCardPackage} from '../entity/user-card-package';
import moment = require('moment');
import {OrderCardOver} from '../entity/order-card-over';
import {UserCarInfo} from '../entity/user-car-info';
import {OrderInfo} from '../entity/order-info';

/**
 * 微信服务
 */
export default class WeappService extends Service {

  // public async formCreate(weappForm: WeappForm): Promise<WeappForm> {
  //   const formRepo: Repository<WeappForm> = this.ctx.app.typeorm.getRepository(WeappForm);
  //   await formRepo.save(weappForm);
  //   return weappForm;
  // }

  public async formCreate(formid: string): Promise<WeappForm[]> {
    if (!this.ctx.locals.user.Id) {
      return [];
    }
    const result: WeappForm[] = [];
    const formids: string[] = formid.split(';');
    const formRepo: Repository<WeappForm> = this.ctx.app.typeorm.getRepository(WeappForm);
    for (const id of formids) {
      const form = new WeappForm();
      form.UserId = this.ctx.locals.user.Id;
      form.FormId = id;
      result.push(form);
      await formRepo.save(form);
    }

    return result;
  }

  public async formDelete(id: string) {
    const formRepo: Repository<WeappForm> = this.ctx.app.typeorm.getRepository(WeappForm);
    await formRepo.delete({
      id,
    });
  }

  public async formFindByUser(userId: number) {
    const formRepo: Repository<WeappForm> = this.ctx.app.typeorm.getRepository(WeappForm);
    return await formRepo.findOne({
      where: {
        UserId: userId,
      },
    });
  }

  /**
   * 预约吸尘
   * @param card
   */
  public async sendAppointment(orderInfo: OrderInfo) {
    const user = await this.ctx.service.user.findOne(orderInfo.UserId);
    let userCar = await this.ctx.app.typeorm.getRepository(UserCarInfo).findOne({
      where: {
        UserId: user.Id,
      },
    });
    if (!userCar) {
      userCar = new UserCarInfo();
    }
    await this.sendTemplate(user, {
      page: this.config.weappSDK.sendAppointment.page,
      template_id: this.config.weappSDK.sendAppointment.template_id,
      data: {
        keyword1: {
          value: '预约吸尘',
        },
        keyword2: {
          value: `${moment(orderInfo.StartTime).toDate().toString()}~${moment(orderInfo.EndTime).toDate().toString()}`,
        },
        keyword3: {
          value: user.Name,
        },
        keyword4: {
          value: user.Phone,
        },
        keyword5: {
          value: `${userCar.Brand}, ${userCar.CarModel}`,
        },
        keyword6: {
          value: userCar.Address,
        },
      },
    });
  }

  /**
   * 错误提醒
   * @param card
   */
  public async sendError(e) {
    this.ctx.logger.error(e);
    for (const card of this.config.weappSDK.sendError.openId) {
      const user = await this.ctx.service.user.queryByOpenId(card);
      if (!user) {
        continue;
      }
      await this.sendTemplate(user, {
        page: this.config.weappSDK.sendError.page,
        template_id: this.config.weappSDK.sendError.template_id,
        data: {
          keyword1: {
            value: '定时任务刷新月卡报错',
          },
          keyword2: {
            value: e.name,
          },
        },
      });
    }
  }

  /**
   * 月卡到期提醒
   * @param card
   */
  public async sendCardEndTime(cardList: UserCardPackage[]) {
    for (const card of cardList) {
      const user = await this.ctx.service.user.findOne(card.UserId);
      await this.sendTemplate(user, {
        page: this.config.weappSDK.sendCardEndTime.page,
        template_id: this.config.weappSDK.sendCardEndTime.template_id,
        data: {
          keyword1: {
            value: card.Type === MonthCardType.vip ? '高级会员月卡' : '单双月会员月卡',
          },
          keyword2: {
            value: moment(card.EndTime).format('YYYY-MM-DD'),
          },
          keyword3: {
            value: card.Days + '天',
          },
          keyword4: {
            value: this.config.weappSDK.sendCardEndTime.message,
          },
        },
      });
    }
  }

  /**
   * 管理员确认月卡
   * @param user
   * @param card
   */
  public async sendCardConfirm(user: User, card: UserCardPackage) {
    await this.sendTemplate(user, {
      page: this.config.weappSDK.sendCardConfirm.page,
      template_id: this.config.weappSDK.sendCardConfirm.template_id,
      data: {
        keyword1: {
          value: card.Type === MonthCardType.vip ? '高级会员月卡' : '单双月会员月卡',
        },
        keyword2: {
          value: moment(card.BuyTime).format('YYYY-MM-DD'),
        },
        keyword3: {
          value: card.Type === MonthCardType.vip ? '300.00' : '220.00',
        },
        keyword4: {
          value: this.config.weappSDK.sendCardConfirm.name,
        },
        keyword5: {
          value: `${moment(card.StartTime).format('YYYY-MM-DD')}~${moment(card.EndTime).format('YYYY-MM-DD')}`,
        },
      },
    });
  }

  /**
   * 供应商服务完成
   */
  public async sendServiceOver(user: User, orderCardover: OrderCardOver) {
    const carRepo = this.ctx.app.typeorm.getRepository(UserCarInfo);
    const car = await carRepo.findOne({
      where: {
        UserId: user.Id,
      },
    });
    if (!car) {
      this.ctx.logger.error(`用户 : ${user.Name} 没有车辆信息`);
      return;
    }
    await this.sendTemplate(user, {
      page: this.config.weappSDK.sendServiceOver.page,
      template_id: this.config.weappSDK.sendServiceOver.template_id,
      data: {
        keyword1: {
          value: this.config.weappSDK.sendServiceOver.type,
        },
        keyword2: {
          value: `${car.Brand}, ${car.CarModel}`,
        },
        keyword3: {
          value: orderCardover.ServiceProviderName,
        },
        keyword4: {
          value: moment(orderCardover.CreaTime).toDate().toString(),
        },
        keyword5: {
          value: this.config.weappSDK.sendServiceOver.message,
        },
      },
    });
  }

  /**
   * 用户确认服务完成
   */
  public async sendServiceConfirm(user: User, orderCardover: OrderCardOver) {
    await this.sendTemplate(user, {
      page: this.config.weappSDK.sendServiceConfirm.page,
      template_id: this.config.weappSDK.sendServiceConfirm.template_id,
      data: {
        keyword1: {
          value: `用户：${user.Name}, 评价了本次洗车服务`,
        },
        keyword2: {
          value: moment(new Date()).toDate().toString(),
        },
        keyword3: {
          value: `${orderCardover.Score}星, 评价： ${orderCardover.Evaluate}`,
        },
      },
    });
  }

  /**
   * 发布模板消息
   * @param user
   * @param option
   */
  public async sendTemplate(user: User, option: { page: string, template_id: string, data: any }) {
    const token = await this.ctx.service.wachat.accessToken();
    const formid = await this.formFindByUser(user.Id);
    if (!formid) {
      return;
    }
    const url = `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${token.access_token}`;
    const result = await this.ctx.curl(url, {
      method: 'POST',
      dataType: 'json',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        touser: user.OpenId,
        form_id: formid.FormId,
        access_token: token.access_token,
        page: option.page,
        template_id: option.template_id,
        data: option.data,
      },
    });
    if (result.data.errcode != 0) {
      this.ctx.logger.error(result.data);
    }
    await this.formDelete(formid.id);
  }
}
