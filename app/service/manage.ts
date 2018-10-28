import {Service} from 'egg';
import {EntityManager, MoreThan, Repository} from 'typeorm';
import {OrderCard, OrderCardStatus} from '../entity/order-card';
import {ServiceProvider, ServiceProviderStatus} from '../entity/service-provider';
import {User} from '../entity/user';
import {UserCardPackage} from '../entity/user-card-package';
import {ErrorService} from '../lib/error/error.service';

import * as moment from 'moment';

/**
 * 管理接口服务
 */
export default class ManageService extends Service {
  public async orderCardConfirm(body: { Id: number, Provider: number }) {
    if (!body.Id) {
      throw ErrorService.RuntimeErrorNotFind();
    }
    // 确认订单
    const orderCardRepo: Repository<OrderCard> = this.ctx.app.typeorm.getRepository(OrderCard);
    const userCardPackageRepo: Repository<UserCardPackage> = this.ctx.app.typeorm.getRepository(UserCardPackage);
    const orderCard = await orderCardRepo.findOne({
      where: {
        Id: body.Id,
      },
    });
    if (!orderCard) {
      throw ErrorService.RuntimeErrorNotFind();
    }
    if (orderCard.Status === OrderCardStatus.confirm) {
      throw ErrorService.RuntimeError('meiyoucar.card.repeatConfirm');
    } else {
      orderCard.Status = OrderCardStatus.confirm;
    }
    // 更新用户信息
    const user = await this.ctx.service.user.findOne(orderCard.UserId);
    const card = await userCardPackageRepo.find({
      where: {
        Days: MoreThan(0),
        UserId: user.Id,
      },
      order: {
        EndTime: 'DESC',
      },
    });
    if (card.length === 0) {
      user.CardTitle = orderCard.Title;
      user.CardStartTime = moment().add(0, 'days').toDate();
      user.CardEndTime = moment().add(31, 'days').toDate();
      user.CardDays = 30;
    } else {
      user.CardDays += 30;
      user.CardEndTime = moment(user.CardEndTime).add(31, 'days').toDate();
    }
    // 更新用户月卡
    const userCardPackage = new UserCardPackage();
    const serviceProvider = await this.ctx.service.provider.findOne(body.Provider);
    this.ctx.logger.info(moment(card[0]!.EndTime));
    this.ctx.logger.info(card[0]!.EndTime);
    userCardPackage.StartTime = moment(user.CardEndTime).add(-31, 'days').toDate();
    userCardPackage.EndTime = user.CardEndTime;
    userCardPackage.UserId = user.Id;
    userCardPackage.Num = 1;
    userCardPackage.Max = 1;
    userCardPackage.ServiceProviderId = serviceProvider.Id;
    userCardPackage.ServiceProviderName = serviceProvider.Name;
    userCardPackage.ServiceProviderAddress = serviceProvider.Address;
    userCardPackage.Days = 30;
    userCardPackage.OrderCardId = orderCard.Id;
    userCardPackage.BuyTime = orderCard.CreaTime;
    orderCard.ConfirmTime = moment().toDate();
    userCardPackage.CardId = orderCard.CardId;
    userCardPackage.Title = orderCard.Title;
    userCardPackage.Explain = orderCard.Explain;
    userCardPackage.Price = orderCard.Price;
    userCardPackage.OriginalPrice = orderCard.OriginalPrice;
    await this.ctx.app.typeorm.transaction(async (transactionalEntityManager: EntityManager) => {
      await transactionalEntityManager.save(userCardPackage);
      await transactionalEntityManager.save(orderCard);
      await transactionalEntityManager.save(user);
    });
    await this.service.weapp.sendCardConfirm(user, userCardPackage); // 发送消息
    return userCardPackage;
  }

  public async providerAdd(provider: ServiceProvider): Promise<ServiceProvider> {
    const user = await this.ctx.service.user.findOne(provider.UserId);
    await this.ctx.app.typeorm.transaction(async (transactionalEntityManager: EntityManager) => {
      const providerRepo: Repository<ServiceProvider> = transactionalEntityManager.getRepository(ServiceProvider);
      const userRepo: Repository<User> = transactionalEntityManager.getRepository(User);

      provider.Status = ServiceProviderStatus.confirm;
      await providerRepo.save(provider);
      user.UserType = 'service';
      user.ServiceProviderId = provider.Id;
      user.ServerFlag = true;
      await userRepo.save(user);
    });

    return provider;
  }

  public async providerConfirm(id: string): Promise<ServiceProvider> {
    const session = this.ctx.locals.session;
    const localUser = this.ctx.locals.user;
    let serviceProvider: ServiceProvider | any;
    let user: User;

    await this.ctx.app.typeorm.transaction(async (transactionalEntityManager: EntityManager) => {
      const providerRepo: Repository<ServiceProvider> = transactionalEntityManager.getRepository(ServiceProvider);
      const userRepo: Repository<User> = transactionalEntityManager.getRepository(User);
      serviceProvider = await this.ctx.service.provider.findOne(id);
      user = await this.ctx.service.user.findOne(serviceProvider.UserId);

      serviceProvider.Status = ServiceProviderStatus.confirm;
      user.UserType = 'service';
      user.ServiceProviderId = serviceProvider.Id;

      await providerRepo.save(serviceProvider);
      await userRepo.save(user);

      const result = Object.assign({}, localUser, user, {register: false});
      await this.ctx.service.user.updateUserStatus(session.id, result);

    });

    return serviceProvider;
  }

  public async providerRefuse(id: string): Promise<ServiceProvider> {
    let serviceProvider: ServiceProvider | any;

    await this.ctx.app.typeorm.transaction(async (transactionalEntityManager: EntityManager) => {
      const providerRepo: Repository<ServiceProvider> = transactionalEntityManager.getRepository(ServiceProvider);
      serviceProvider = await this.ctx.service.provider.findOne(id);
      serviceProvider.Status = ServiceProviderStatus.refuse;
      await providerRepo.save(serviceProvider);

    });

    return serviceProvider;
  }

  public async providerDel(id: string): Promise<ServiceProvider> {
    let serviceProvider: ServiceProvider | any;
    let user: User;
    await this.ctx.app.typeorm.transaction(async (transactionalEntityManager: EntityManager) => {
      const providerRepo: Repository<ServiceProvider> = transactionalEntityManager.getRepository(ServiceProvider);
      const userRepo: Repository<User> = transactionalEntityManager.getRepository(User);
      serviceProvider = await this.ctx.service.provider.findOne(id);
      user = await this.ctx.service.user.findOne(serviceProvider.UserId);
      serviceProvider.Status = ServiceProviderStatus.del;

      user.UserType = 'user';
      user.ServiceProviderId = -1;
      user.ServerFlag = false;
      await providerRepo.save(serviceProvider);
      await userRepo.save(user);

    });

    return serviceProvider;
  }

  /**
   * 查询用户
   */
  public async userIndex(param) {
    const userRepo: Repository<User> = this.ctx.app.typeorm.getRepository(User);
    return await userRepo.find({
      where: param,
    });
  }

  /**
   * 重置用户密码
   */
  async resetPassword(userId: number, password: string) {
    const userRepo: Repository<User> = this.ctx.app.typeorm.getRepository(User);
    const user = await this.ctx.service.user.findOne(userId);
    user.Password = await this.ctx.service.gen.bcryptPassword(password);

    await userRepo.save(user);
  }

  /**
   * 查询管理员
   */
  public async userManage() {
    const userRepo: Repository<User> = this.ctx.app.typeorm.getRepository(User);
    return await userRepo.find({
      where: {
        Manage: 'manage',
      },
    });
  }

  /**
   * 添加为管理员
   */
  public async userAddManage(userId: number): Promise<User> {
    const userRepo: Repository<User> = this.ctx.app.typeorm.getRepository(User);
    const user = await this.ctx.service.user.findOne(userId);
    // 用户已经是管理员
    if (user.Manage === 'manage' || user.Manage === 'admin') {
      throw ErrorService.RuntimeError('manage.user.isManage');
    }
    user.Manage = 'manage';
    await userRepo.save(user);
    return user;
  }

  /**
   * 删除管理员
   */
  public async userDelManage(id: string) {
    const userRepo: Repository<User> = this.ctx.app.typeorm.getRepository(User);
    const user = await this.ctx.service.user.findOne(id);
    if (!user) {
      throw ErrorService.RuntimeError('manage.user.notFind');
    }
    if (user.Manage === 'none') {
      throw ErrorService.RuntimeError('manage.user.isNotManage');
    }
    user.Manage = 'none';
    await userRepo.save(user);
    return user;
  }
}
