import {Controller} from 'egg';

export default class HomeController extends Controller {
  public async index() {
    const {ctx} = this;
    const accesstoken = await this.ctx.service.wachat.accessToken();
    const result = await this.ctx.curl('https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=' + accesstoken.access_token, {
      method: 'POST',
      dataType: 'json',
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        touser: 'oqHX64kSigryRsPuaxx0INDiY7c0',
        form_id: '1538665025545',
        page: 'pages/index/index',
        template_id: 'LHLsY-KPbm1W3az3ulW5A2fyO9N4NQNFHuWjxtXe27I',
        access_token: accesstoken.access_token,
        data: {
          keyword1: {
            value: '高级会员月卡',
          },
          keyword2: {
            value: '2018-09-30',
          },
          keyword3: {
            value: '300.00',
          },
          keyword4: {
            value: '美优洗车',
          },
          keyword5: {
            value: '2018-10-01~2018-10-31',
          },
        },
      },
    });
    this.ctx.logger.info(result);
    ctx.body = result;
  }
}
