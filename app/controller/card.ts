import {Controller} from 'egg';
import {Card, CardStatus} from '../entity/card';
import {ErrorService} from '../lib/error/error.service';

export default class CardController extends Controller {

  /**
   * 查询有效月卡
   */
  async index() {
    const cardRepo = this.ctx.app.typeorm.getRepository(Card);
    const cards = await cardRepo.find({where: {Status: CardStatus.enable}});
    this.ctx.body = {
      success: true,
      obj: cards,
    };
  }

  async findOne(id: number) {
    if (!id) {
      throw ErrorService.RuntimeErrorIdIsNull();
    }
    const cardRepo = this.ctx.app.typeorm.getRepository(Card);
    const card = await cardRepo.find({where: {Id: id}});
    if (!card) {
      throw ErrorService.RuntimeErrorNotFind();
    }
    return card;
  }
}
