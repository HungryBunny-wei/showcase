import {Controller} from 'egg';
import {UserCardPackage} from '../entity/user-card-package';

export default class CardPackageController extends Controller {

  async index() {
    const userCardPackageRepo  = this.ctx.app.typeorm.getRepository(UserCardPackage);
    const localUser = this.ctx.locals.user;
    const cards = await userCardPackageRepo.find({ where: { UserId: localUser.Id } });
    this.ctx.body = {
      success: true,
      obj: cards,
    };
  }

}
