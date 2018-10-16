import {Context} from 'egg';
import crypto = require('crypto');

export class WXBizDataCrypt {
  constructor(public appId, public sessionKey, public ctx: Context) {
  }

  decryptData(encryptedData, iv) {
    // base64 decode
    const sessionKey = new Buffer(this.sessionKey, 'base64');
    encryptedData = new Buffer(encryptedData, 'base64');
    iv = new Buffer(iv, 'base64');
    let decoded;
    try {
      // 解密
      const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv);
      // 设置自动 padding 为 true，删除填充补位
      decipher.setAutoPadding(false);
      decoded = decipher.update(encryptedData, 'binary', 'utf8');
      decoded += decipher.final('utf8');
      decoded = JSON.parse(decoded);

    } catch (err) {
      this.ctx.logger.error(err);
      throw new Error('Illegal Buffer');
    }

    if (decoded.watermark.appid !== this.appId) {
      throw new Error('Illegal Buffer appid not EQ');
    }

    return decoded;
  }
}
