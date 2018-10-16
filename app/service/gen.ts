import {Service} from 'egg';

// import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export default class Test extends Service {

  public bcryptPassword(password: string): Promise<string> {
    // const saltRounds = 10;
    const promise = new Promise<string>((resolve) => {
      // bcrypt.genSalt(saltRounds, (err, salt) => {
      //   this.logger.info(err);
      //   bcrypt.hash(password, salt, (err2, hash) => {
      //     this.logger.info(err2);
      //     resolve(hash);
      //   });
      // });
      const hash = crypto.createHash('sha1').update(password).digest('hex');
      resolve(hash);
    });

    return promise;
  }

  public comparePassword(password: string, hashPassword): Promise<boolean> {
    const promise = new Promise<boolean>((resolve) => {
      // bcrypt.compare(password, hashPassword, (err, res) => {
      //   this.logger.info(err);
      //   resolve(res);
      // });
      if (crypto.createHash('sha1').update(password).digest('hex') === hashPassword) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

    return promise;
  }
}
