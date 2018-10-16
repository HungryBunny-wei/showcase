import {Controller} from 'egg';

export default class WeappController extends Controller {

  public async formCreate() {
    this.ctx.body = {
      success: true,
      obj: await this.ctx.service.weapp.formCreate(this.ctx.request.body.FormId),
    };
  }

}
