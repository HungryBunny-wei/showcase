import {Context} from 'egg';
import {constants} from '../lib/auth/constants';

export default function WeappMiddleware() {
  /**
   * 需要登录
   */
  return async (ctx: Context, next: () => Promise<any>): Promise<any> => {
    if (ctx.get(constants.WX_HEADER_FORM_ID) && /^[0-9]*[0-9]$/g.test(ctx.get(constants.WX_HEADER_FORM_ID))) {
      await ctx.service.weapp.formCreate(ctx.get(constants.WX_HEADER_FORM_ID));
    }
    await next();
  };
}
