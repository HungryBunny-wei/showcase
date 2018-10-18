import {Service} from 'egg';
import {Card} from '../entity/card';
import {ErrorService} from '../lib/error/error.service';

/**
 * 微信服务
 */
export default class CardService extends Service {

  async findOne(id: number) {
    if (!id) {
      throw ErrorService.RuntimeErrorIdIsNull();
    }
    const cardRepo = this.ctx.app.typeorm.getRepository(Card);
    const card = await cardRepo.findOne({
      Id: id,
    });
    if (!card) {
      throw ErrorService.RuntimeErrorNotFind();
    }
    return card;
  }
}
