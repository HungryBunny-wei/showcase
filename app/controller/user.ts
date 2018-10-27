import {Controller} from 'egg';
import {Repository} from 'typeorm';
import {OrderCardOver, OrderCardOverStatus} from '../entity/order-card-over';
import {ErrorService} from '../lib/error/error.service';

import {ServiceProvider} from '../entity/service-provider';

export default class UserController extends Controller {

  /**
   * 登录
   */
  public async login() {
    const Phone = this.ctx.request.body.Phone;
    const Password = this.ctx.request.body.Password;
    if (Phone) { // PC登录
      this.ctx.body = await this.ctx.service.user.localLogin(Phone, Password);
    } else { // weapp登录
      const code = this.ctx.request.body.code;
      const NickName = this.ctx.request.body.NickName;
      const AvatarUrl = this.ctx.request.body.AvatarUrl;
      if (!code) {
        throw ErrorService.RuntimeError('user.codeIsNotNull');
      }
      this.ctx.body = await this.ctx.service.user.weappLogin(code, NickName, AvatarUrl);
    }
  }

  /**
   * 注册
   */
  public async register() {
    const ctx = this.ctx;
    const localUser = ctx.locals.user as any;
    if (localUser.register) { // 只有register等于true的时候才允许注册
      this.ctx.body = {
        success: true,
        obj: await this.ctx.service.user.register(),
      };
    } else {
      throw ErrorService.RuntimeError('user.repeatRegister').setStatus(403);
    }
  }

  /**
   * 获取用户的所有信息
   * 用户信息
   * 卡包
   * 车辆信息
   */
  public async queryAll() {
    const ctx = this.ctx;
    ctx.body = {
      success: true,
      obj: await this.ctx.service.user.queryAll(this.ctx.locals.user.Id),
    };
  }

  public async updateInfo() {
    this.ctx.body = {
      success: true,
      obj: await this.ctx.service.user.updateInfo(this.ctx.request.body),
    };
  }

  public async cardLookOver() {
    const localuser = this.ctx.locals.user;
    this.ctx.body = {
      success: true,
      obj: await this.ctx.service.user.cardLookOver(localuser.Id, this.ctx.query.date),
    };
  }

  public async cardConfirm() {
    const orderCardOverRepo: Repository<OrderCardOver> = this.ctx.app.typeorm.getRepository(OrderCardOver);
    const providerRepo: Repository<ServiceProvider> = this.ctx.app.typeorm.getRepository(ServiceProvider);
    const orderCardOver = await orderCardOverRepo.findOne({where: {Id: this.ctx.request.body.Id}});
    if (!orderCardOver) {
      throw ErrorService.RuntimeErrorNotFind();
    }
    orderCardOver.Status = OrderCardOverStatus.confirm;
    orderCardOver.Evaluate = this.ctx.request.body.Evaluate;
    orderCardOver.Score = this.ctx.request.body.Score;
    await orderCardOverRepo.save(orderCardOver);
    const provider = await providerRepo.findOne({
      where: {
        Id: orderCardOver.ServiceProviderId,
      },
    });
    if (provider) {
      const user = await this.ctx.service.user.findOne(provider.UserId);
      await this.ctx.service.weapp.sendServiceConfirm(user, orderCardOver);
    }
    this.ctx.body = {
      success: true,
      obj: orderCardOver,
    };
  }

}
