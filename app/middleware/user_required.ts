import { Context } from 'egg';
import {ErrorService} from '../lib/error/error.service';

export default function userRequiredMiddleware() {
  /**
   * 需要注册
   */
  return async (ctx: Context, next: () => Promise<any>): Promise<any> => {
    if (!ctx.locals.user) {
      throw ErrorService.RuntimeError('sys.noLogin').setStatus(401);
    }
    await next();
  };
}
