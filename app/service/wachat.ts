import {Service} from 'egg';
import {ErrorService} from '../lib/error/error.service';
import {WXBizDataCrypt} from '../lib/helper/WXBizDataCrypt';

/**
 * 微信服务
 */
export default class WachatService extends Service {

  public async sessionKey(jscode: string): Promise<{ sessionKey: string, openId: string, OpenId: string }> {
    try {
      const requestUrl = this.buildUrl(jscode);
      const result = await this.ctx.curl(requestUrl, {dataType: 'json'});
      if (result.status === 200) { // 200 就是请求成功了
        if ('session_key' in result.data) {
          return {sessionKey: result.data.session_key, openId: result.data.openid, OpenId: result.data.openid};
        }
        this.ctx.logger.error(result.data);
        throw ErrorService.RuntimeError('jscode.session.failed');
      } else {
        this.ctx.logger.error(result.status);
        this.ctx.logger.error(result.data);
        throw ErrorService.RuntimeError('jscode.request.statusError');
      }
    } catch (error) {
      throw ErrorService.RuntimeError('jscode.request.failed');
    }
  }

  public buildUrl(jscode: string): string {
    const apiUrl = 'https://api.weixin.qq.com/sns/jscode2session';
    const appId = this.app.config.weappSDK.appId;
    const appSecret = this.app.config.weappSDK.appSecret;
    const params = `?appid=${appId}&secret=${appSecret}&js_code=${jscode}&grant_type=authorization_code`;
    return `${apiUrl}${params}`;
  }

  public async accessToken(): Promise<{ access_token: string, expires_in: number }> {
    const redis = this.ctx.app.redis;
    const tokenStr = await redis.get('weapp-access-token');
    if (tokenStr) {
      const token: { access_token: string, expires_in: number } = JSON.parse(tokenStr);
      return token;
    }
    try {
      const result = await this.ctx.curl(this.buildAccesTokenUrl(), {dataType: 'json'});
      if (result.status === 200) { // 200 就是请求成功了
        if (result.data.errcode && result.data.errcode !== 0) {
          this.ctx.logger.error(result.data.errmsg);
          throw ErrorService.RuntimeError(`weapp.error.${result.data.errcode}`);
        }
        await redis.set('weapp-access-token', JSON.stringify({
          access_token: result.data.access_token,
          expires_in: result.data.expires_in,
        }));
        return {access_token: result.data.access_token, expires_in: result.data.expires_in};
      } else {
        this.ctx.logger.error(result.status);
        this.ctx.logger.error(result.data);
        throw ErrorService.RuntimeError('accessToken.request.statusError');
      }
    } catch (error) {
      throw ErrorService.RuntimeError('accessToken.request.failed');
    }
  }

  public buildAccesTokenUrl(): string {
    const apiUrl = 'https://api.weixin.qq.com/cgi-bin/token';
    const appId = this.app.config.weappSDK.appId;
    const appSecret = this.app.config.weappSDK.appSecret;
    const params = `?appid=${appId}&secret=${appSecret}&grant_type=client_credential`;
    return `${apiUrl}${params}`;
  }

  public decrypt(sessionKey, encryptedData, iv) {
    const config = this.ctx.app.config.weappSDK;
    try {
      const appId = config.appId;
      const pc = new WXBizDataCrypt(appId, sessionKey, this.ctx);
      const data = pc.decryptData(encryptedData, iv);
      return data;
    } catch (e) {
      return {
        code: 1,
        msg: e,
      };
    }
  }
}
