import {Controller} from 'egg';
import {UserCardPackage} from '../entity/user-card-package';
import {ErrorService} from '../lib/error/error.service';

export default class CardPackageController extends Controller {

  async index() {
    const userCardPackageRepo = this.ctx.app.typeorm.getRepository(UserCardPackage);
    const localUser = this.ctx.locals.user;
    const cards = await userCardPackageRepo.find({where: {UserId: localUser.Id}});
    this.ctx.body = {
      success: true,
      obj: cards,
    };
  }

  async findOne() {
    const userCardPackageRepo = this.ctx.app.typeorm.getRepository(UserCardPackage);
    if (!this.ctx.query.id) {
      throw ErrorService.RuntimeErrorIdIsNull();
    }
    const card = await userCardPackageRepo.findOne({where: {Id: this.ctx.query.id}});
    if (!card) {
      throw ErrorService.RuntimeErrorNotFind();
    }
    this.ctx.body = {
      success: true,
      obj: card,
    };
  }

}
