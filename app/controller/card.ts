import {Controller} from 'egg';
import {Card, CardStatus} from '../entity/card';

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

  async findOne() {
    this.ctx.body = {
      success: true,
      obj: await this.ctx.service.card.findOne(this.ctx.query.id),
    };
  }
}
