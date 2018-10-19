import {Controller} from 'egg';
import {EntityManager, Repository} from 'typeorm';
import {OrderCard, OrderCardStatus} from '../entity/order-card';
import {OrderInfo, OrderInfoStatus} from '../entity/order-info';
import {UserCardPackage} from '../entity/user-card-package';
import {ErrorService} from '../lib/error/error.service';

export default class CardController extends Controller {

  /**
   * 保存预约信息
   */
  public async save() {
    const orderInfoRepo: Repository<OrderInfo> = this.ctx.app.typeorm.getRepository(OrderInfo);
    const localUser = this.ctx.locals.user;

    const orderInfo = new OrderInfo();
    orderInfo.UserId = localUser.Id;
    orderInfo.Status = OrderInfoStatus.start;
    Object.assign(orderInfo, this.ctx.request.body);
    const provider = await this.ctx.service.provider.findOne(orderInfo.ServiceProviderId);
    orderInfo.ServiceProviderName = provider.Name;
    orderInfo.ServiceProviderAddress = provider.Address;
    await this.ctx.service.weapp.sendAppointment(orderInfo);
    await orderInfoRepo.save(orderInfo);
    this.ctx.body = {
      success: true,
      obj: orderInfo,
    };
  }

  async index() {
    const orderInfoRepo: Repository<OrderInfo> = this.ctx.app.typeorm.getRepository(OrderInfo);

    const localUser = this.ctx.locals.user;
    const orderInfo = await orderInfoRepo.find({where: {UserId: localUser.Id}});
    this.ctx.body = {
      success: true,
      obj: orderInfo,
    };
  }

  async queryById() {
    const orderInfoRepo: Repository<OrderInfo> = this.ctx.app.typeorm.getRepository(OrderInfo);

    if (!this.ctx.request.body.Id) {
      throw ErrorService.RuntimeError('sys.model.IdIsNull');
    }
    const orderInfo = await orderInfoRepo.findOne({
      where: {
        Id: this.ctx.request.body.Id,
      },
    });
    if (!orderInfo) {
      throw ErrorService.RuntimeError('sys.model.NotFind');
    }
    this.ctx.body = {
      success: true,
      obj: orderInfo,
    };
  }

  /**
   * 购买月卡
   */
  public async buyCard() {
    const orderCardRepo: Repository<OrderCard> = this.ctx.app.typeorm.getRepository(OrderCard);
    const localUser = this.ctx.locals.user;
    const body = this.ctx.request.body;

    const card = await this.ctx.service.card.findOne(body.CardId);
    const orderCard = new OrderCard();
    orderCard.Status = OrderCardStatus.start;
    orderCard.UserId = localUser.Id; // 购买人
    orderCard.CardId = body.CardId;
    orderCard.Title = card.Title;
    orderCard.Explain = card.Explain;
    orderCard.Price = card.Price;
    orderCard.OriginalPrice = card.OriginalPrice;
    await orderCardRepo.save(orderCard);
    await this.ctx.app.typeorm.transaction(async (transactionalEntityManager: EntityManager) => {
      /*
       * 判断有没有为确认订单有就删除
       */
      await transactionalEntityManager.delete(OrderCard, {
        UserId: localUser.Id,
        Status: OrderCardStatus.start,
      });
      await transactionalEntityManager.save(orderCard);
    });

    this.ctx.body = {
      success: true,
      obj: orderCard,
    };
  }

  /**
   * 月卡购买记录
   */
  public async orderCardHistory() {
    const userCardRepo: Repository<UserCardPackage> = this.ctx.app.typeorm.getRepository(UserCardPackage);
    this.ctx.body = {
      success: true,
      obj: await userCardRepo.find({
        where: {
          UserId: this.ctx.locals.user.Id,
        },
      }),
    };
  }

  /**
   * 获取月卡
   */
  public async getCardOrder() {
    const orderCardRepo: Repository<OrderCard> = this.ctx.app.typeorm.getRepository(OrderCard);
    const localUser = this.ctx.locals.user;
    this.ctx.body = {
      success: true,
      obj: await orderCardRepo.find({
        where: {
          UserId: localUser.Id,
        },
      }),
    };
  }

  /**
   * 确认月卡
   */
  public async confirmCardOrder() {
    const localUser = this.ctx.locals.user;
    const orderCardRepo: Repository<OrderCard> = this.ctx.app.typeorm.getRepository(OrderCard);
    const userCardPackageRepo: Repository<UserCardPackage> = this.ctx.app.typeorm.getRepository(UserCardPackage);
    const orderCard = await orderCardRepo.findOne({
      where: {
        Id: this.ctx.request.body.Id,
      },
    });
    const userCardPackage = new UserCardPackage();
    if (!orderCard) {
      throw ErrorService.RuntimeError('sys.model.NotFind');
    }
    const endTime = new Date(); // 获取一个月后的日期
    if (endTime.getMonth() === 11) {
      endTime.setFullYear(endTime.getFullYear() - 1);
      endTime.setMonth(0);
    } else {
      endTime.setMonth(endTime.getMonth() + 1);
    }
    userCardPackage.UserId = localUser.Id;
    userCardPackage.StartTime = new Date();
    userCardPackage.EndTime = endTime;
    userCardPackage.Max = 0;
    userCardPackage.Num = 0;
    userCardPackage.CardId = orderCard.CardId;
    userCardPackage.Title = orderCard.Title;
    userCardPackage.Explain = orderCard.Explain;
    userCardPackage.Price = orderCard.Price;
    userCardPackage.OriginalPrice = orderCard.OriginalPrice;
    await userCardPackageRepo.save(userCardPackage);
    orderCard.Status = OrderCardStatus.confirm;
    await orderCardRepo.save(orderCard);
  }

}
