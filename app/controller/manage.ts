import {Controller} from 'egg';
import {User} from '../entity/user';
import {ServiceProvider, ServiceProviderStatus} from '../entity/service-provider';
import {Card, CardStatus} from '../entity/card';

export default class ManageController extends Controller {

  public async orderCardIndex() {
    // const repo: Repository<OrderCard> = this.ctx.app.typeorm.getRepository(OrderCard);
    const sql = `
    select orderCard.*,userCarInfo.Address,userCarInfo.AddressName,user.Name,user.Phone from order_card as orderCard
    left join User_CarInfo as userCarInfo
      on orderCard.UserId = userCarInfo.UserId and userCarInfo.IsNew = 1
    left join User as user
      on orderCard.UserId = user.Id
    `;
    this.ctx.body = {
      success: true,
      obj: await this.ctx.app.typeorm.query(sql),
    };
  }

  public async orderCardConfirm() {
    const body = this.ctx.request.body;
    this.ctx.body = {
      success: true,
      obj: await this.ctx.service.manage.orderCardConfirm(body),
    };
  }

  public async providerIndex() {
    const sql = `
select provider.*,user.AvatarUrl,user.Name as UserName from ServiceProvider as provider
left join User as user
  on provider.UserId = user.Id
${this.ctx.query.Status ? 'where provider.Status = ?' : ''}
`;
    this.ctx.body = {
      success: true,
      obj: await this.ctx.app.typeorm.query(sql, [this.ctx.query.Status]),
    };
  }

  public async providerAdd() {
    const body = this.ctx.request.body;
    const serviceProvider = new ServiceProvider();
    serviceProvider.Address = body.Address;
    // serviceProvider.AddressName = body.AddressName;
    // serviceProvider.Latitude = body.Latitude;
    // serviceProvider.Longitude = body.Longitude;
    serviceProvider.Name = body.Name;
    serviceProvider.Phone = body.Phone;
    serviceProvider.UserId = body.UserId;
    serviceProvider.Status = ServiceProviderStatus.confirm;

    this.ctx.body = {
      success: true,
      obj: await this.ctx.service.manage.providerAdd(serviceProvider),
    };
  }

  public async providerConfirm() {
    const body = this.ctx.request.body;
    this.ctx.body = {
      success: true,
      obj: await this.ctx.service.manage.providerConfirm(body.Id),
    };
  }

  public async providerRefuse() {
    const body = this.ctx.request.body;
    this.ctx.body = {
      success: true,
      obj: await this.ctx.service.manage.providerRefuse(body.Id),
    };
  }

  public async providerDel() {
    const body = this.ctx.request.body;
    this.ctx.body = {
      success: true,
      obj: await this.ctx.service.manage.providerDel(body.Id),
    };
  }

  public async userIndex() {
    this.ctx.body = {
      success: true,
      obj: await this.ctx.service.manage.userIndex(this.ctx.request.query),
    };
  }

  public async userAdd() {
    const user = new User();
    user.Password = await this.ctx.service.gen.bcryptPassword(this.ctx.request.body.Password);
    user.Name = await this.ctx.request.body.Name;
    user.Phone = this.ctx.request.body.Phone;
    user.UserType = 'user';
    user.Manage = 'none';
    user.register = true;
    await this.ctx.app.typeorm.getRepository(User).save(user);
    this.ctx.body = {
      success: true,
      obj: user,
    };
  }

  public async resetPassword() {
    const body = this.ctx.request.body;
    await this.ctx.service.manage.resetPassword(body.UserId, body.Password);
    this.ctx.body = {
      success: true,
      obj: {},
    };
  }

  public async userFindById() {
    this.ctx.body = {
      success: true,
      obj: await this.ctx.service.user.queryAll(this.ctx.params.id),
    };
  }

  public async userManage() {
    this.ctx.body = {
      success: true,
      obj: await this.ctx.service.manage.userManage(),
    };
  }

  public async userAddManage() {
    this.ctx.body = {
      success: true,
      obj: await this.ctx.service.manage.userAddManage(this.ctx.request.body.UserId),
    };
  }

  public async userDelManage() {
    this.ctx.body = {
      success: true,
      obj: await this.ctx.service.manage.userDelManage(this.ctx.params.id),
    };
  }

  public async cardIndex() {
    const cardRepo = this.ctx.app.typeorm.getRepository(Card);
    this.ctx.body = {
      success: true,
      obj: await cardRepo.find(),
    };
  }

  public async cardSave() {
    const cardRepo = this.ctx.app.typeorm.getRepository(Card);
    const card = new Card();
    Object.assign(card, this.ctx.request.body);
    card.Status = CardStatus.enable;
    card.Max = 1;
    await cardRepo.save(card);
    this.ctx.body = {
      success: true,
      obj: card,
    };
  }

  public async cardUpdate() {
    const cardRepo = this.ctx.app.typeorm.getRepository(Card);
    // const card = await this.ctx.service.card.findOne(this.ctx.request.body.Id);
    // Object.assign(card, this.ctx.request.body);
    const card = await await cardRepo.update({Id: this.ctx.request.body.Id}, this.ctx.request.body);
    this.ctx.body = {
      success: true,
      obj: card,
    };
  }
}
