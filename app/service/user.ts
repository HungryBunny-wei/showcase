import {Service} from 'egg';
import {EntityManager, Repository} from 'typeorm';
import {OrderCard, OrderCardStatus} from '../entity/order-card';
import {User} from '../entity/user';
import {UserCarInfo} from '../entity/user-car-info';
import {UserCardPackage} from '../entity/user-card-package';
import {ErrorService} from '../lib/error/error.service';

import * as moment from 'moment';
import {OrderCardOver} from '../entity/order-card-over';

/**
 * 用户服务 Service
 */
export default class UserService extends Service {

  public async weappLogin(jscode: string, nickName, avatarUrl): Promise<any> {
    const result: any = {
      session: {
        id: '',
        skey: 'bravo',
      },
      userInfo: {register: true},
    };

    const weappSession = await this.ctx.service.wachat.sessionKey(jscode);
    const user = await this.queryByOpenId(weappSession.openId);
    if (user) {
      user.NickName = nickName;
      user.AvatarUrl = avatarUrl;
      user.LoginTime = new Date();
      await this.ctx.app.typeorm.getRepository(User).save(user);
      Object.assign(result.userInfo, user);
      result.userInfo.register = false; // 不需要去注册信息
    }
    const token = this.ctx.uuid();
    result.session.id = token;
    await this.updateUserStatus(token, Object.assign({}, weappSession, result.userInfo));

    return result;
  }

  public async localLogin(phone: string, password: string): Promise<any> {
    const result: any = {
      session: {
        id: '',
        skey: 'bravo',
      },
      userInfo: {register: true},
    };
    const user = await this.ctx.service.user.queryByPhone(phone);
    const compare = await this.ctx.service.gen.comparePassword(password, user.Password);
    if (compare) {
      user.LoginTime = new Date();
      await this.ctx.app.typeorm.getRepository(User).save(user);
      Object.assign(result.userInfo, user);
      result.userInfo.register = false; // 不需要去注册信息
      const token = this.ctx.uuid();
      result.session.id = token;
      await this.updateUserStatus(token, Object.assign({}, result.userInfo));
    } else {
      throw ErrorService.RuntimeError('user.passError'); // 密码错误
    }
    return result;
  }

  public async register(): Promise<User & { register: boolean }> {
    const session = this.ctx.locals.session;
    const localUser = this.ctx.locals.user;
    const body = this.ctx.request.body;
    const user = new User();
    user.Name = body.Name;
    user.UserType = 'user';
    user.Manage = 'none';
    user.Phone = body.Phone;
    user.OpenId = localUser.OpenId;
    user.NickName = body.NickName;
    user.AvatarUrl = body.AvatarUrl;
    user.Birthday = body.Birthday;
    user.LoginTime = new Date();
    const userCarInfo = new UserCarInfo();
    userCarInfo.AddressName = body.site.AddressName;
    userCarInfo.Address = body.site.Address;
    userCarInfo.Latitude = body.site.Latitude;
    userCarInfo.Longitude = body.site.Longitude;
    userCarInfo.Brand = body.Brand;
    userCarInfo.CarModel = body.CarModel;
    userCarInfo.LicencePlate = body.LicencePlate;
    userCarInfo.Motor = body.Motor;
    // 系统字段
    userCarInfo.Version = 1;
    userCarInfo.IsNew = 1;
    await this.ctx.app.typeorm.transaction(async (transactionalEntityManager: EntityManager) => {
      await transactionalEntityManager.save(user);
      userCarInfo.UserId = user.Id;
      await transactionalEntityManager.save(userCarInfo);
    });

    const result = Object.assign({}, user, localUser, {register: false});
    await this.updateUserStatus(session.id, result);

    return result;
  }

  public async queryAll(userId: number):
    Promise<{
      user: User,
      user_carInfo: UserCarInfo[],
      user_cardPackage: UserCardPackage[],
      orderCard: OrderCard | undefined,
    }> {

    const userRepo: Repository<User> = this.ctx.app.typeorm.getRepository(User);
    const userCarInfoRepo: Repository<UserCarInfo> = this.ctx.app.typeorm.getRepository(UserCarInfo);
    const userCardPackageRepo: Repository<UserCardPackage> = this.ctx.app.typeorm.getRepository(UserCardPackage);
    const orderCardRepo: Repository<OrderCard> = this.ctx.app.typeorm.getRepository(OrderCard);
    const user = await userRepo.findOne({
      where: {
        Id: userId,
      },
    });
    if (!user) {
      throw ErrorService.RuntimeError('user.userNotRegister').setStatus(403);
    }
    const userCarInfo = await userCarInfoRepo.find({
      where: {
        UserId: user.Id,
      },
    });
    const userCardPackage = await userCardPackageRepo.find({
      where: {
        UserId: user.Id,
      },
    });
    const orderCard = await orderCardRepo.findOne({
      where: {
        UserId: user.Id,
        Status: OrderCardStatus.start,
      },
    });

    return {
      user,
      orderCard,
      user_carInfo: userCarInfo,
      user_cardPackage: userCardPackage,
    };
  }

  public async updateInfo(data) {
    const localUser = this.ctx.locals.user;
    const user = await this.findOne(localUser.Id);
    user.Name = data.Name;
    user.Phone = data.Phone;
    user.Birthday = data.Birthday;
    await this.ctx.app.typeorm.transaction(async (transactionalEntityManager: EntityManager) => {
      await transactionalEntityManager.save(user);
      const userCarInfoRepo = transactionalEntityManager.getRepository(UserCarInfo);
      const car = await userCarInfoRepo.findOne({
        where: {
          UserId: localUser.Id,
        },
      });
      if (!car) {
        throw ErrorService.RuntimeErrorNotFind();
      }
      car.AddressName = data.AddressName;
      car.Address = data.Address;
      car.Latitude = data.Latitude;
      car.Longitude = data.Longitude;
      car.Brand = data.Brand;
      car.CarModel = data.CarModel;
      car.LicencePlate = data.LicencePlate;
      car.Motor = data.Motor;
      await userCarInfoRepo.save(car);
    });
  }

  public async check() {
    const session = this.ctx.locals.session;
    if (!session.id) {
      throw ErrorService.RuntimeError('user.auth.headerNot(X-WX-Id)');
    }
    if (!session.skey) {
      throw ErrorService.RuntimeError('user.auth.headerNot(X-WX-Skey)');
    }
    if (session.skey !== 'bravo') {
      throw ErrorService.RuntimeError('user.auth.X-WX-SkeyNotEQBravo');
    }

    const redis = this.app.redis;
    const res = await redis.get(session.id);
    const result = res ? JSON.parse(res) : null;
    return result;
  }

  public async queryByOpenId(openId: string): Promise<User | undefined> {
    const userRepo: Repository<User> = this.ctx.app.typeorm.getRepository(User);
    const user = await userRepo.findOne({
      where: {
        OpenId: openId,
      },
    });
    return user;
  }

  public async queryByPhone(phone: string): Promise<User> {
    const userRepo: Repository<User> = this.ctx.app.typeorm.getRepository(User);
    const user = await userRepo.findOne({
      where: {
        Phone: phone,
      },
    });
    if (!user) {
      throw ErrorService.RuntimeError('manage.user.notFind');
    }
    return user;
  }

  public async updateUserStatus(token, user: any) {
    const redis = this.app.redis;
    const value = JSON.stringify(user);
    await redis.del(token);
    await redis.set(token, value, 'PX', 1000 * 60 * 60 * 24 * 30);
  }

  public async findOne(id: any): Promise<User> {
    if (!id) {
      throw ErrorService.RuntimeErrorIdIsNull();
    }
    const userRepo: Repository<User> = this.ctx.app.typeorm.getRepository(User);
    const user = await userRepo.findOne({
      where: {
        Id: id,
      },
    });
    if (!user) {
      throw ErrorService.RuntimeErrorNotFind();
    }
    return user;
  }

  public async cardLookOver(userId, date?) {
    const userCardPackageRepo: Repository<UserCardPackage> = this.ctx.app.typeorm.getRepository(UserCardPackage);
    const userCarInfoRepo: Repository<UserCarInfo> = this.ctx.app.typeorm.getRepository(UserCarInfo);
    const orderCardOverRepo: Repository<OrderCardOver> = this.ctx.app.typeorm.getRepository(OrderCardOver);
    let userCardPack;
    let provider;
    let usercar;
    let user;

    let toDate: string;
    if (date) {
      toDate = moment(date).hours(0).minutes(0).seconds(0).milliseconds(0).toDate().toString();
    } else {
      toDate = moment().hours(0).minutes(0).seconds(0).milliseconds(0).toDate().toString();
    }
    const tomorrow = moment(toDate).add('days', 1).toDate().toString();
    this.ctx.logger.info(`${toDate},${tomorrow}`);
    const orderCardOver = await orderCardOverRepo.createQueryBuilder()
      .where('UserId = :UserId and CreaTime >= :toDay and CreaTime < :tomorrow', {
        UserId: userId,
        toDay: toDate,
        tomorrow,
      }).getOne();
    if (orderCardOver) {
      userCardPack = await userCardPackageRepo.findOne({
        where: {
          Id: orderCardOver.UserCardPackageId,
        },
      });
      provider = await this.ctx.service.provider.findOne(userCardPack.ServiceProviderId);
      usercar = await userCarInfoRepo.findOne({
        where: {
          UserId: userId,
        },
      });
      user = await this.ctx.service.user.findOne(userId);
    }

    return {
      orderCardOver, // 月卡订单完成,
      userCardPack, // 用户月卡
      provider, // 服务商
      usercar, // 车辆信息
      user, // 用户信息
    };
  }

}
