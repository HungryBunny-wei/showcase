import {Context} from 'egg';
import {constants} from '../lib/auth/constants';
import {ErrorService} from '../lib/error/error.service';

export default function localsMiddleware() {
  return async (ctx: Context, next: any) => {
    const app = ctx.app;
    ctx.locals.config = app.config;
    ctx.locals.csrf = ctx.csrf;
    ctx.locals.session = {
      id: ctx.get(constants.WX_HEADER_ID),
      skey: ctx.get(constants.WX_HEADER_SKEY),
    };
    try {
      await next();
      if (ctx.locals.user) {
        const user = ctx.locals.user;
        ctx.logger.info(`[${user.Name}][${user.Id}]`);
      }
    } catch (e) {
      if (e instanceof ErrorService) {
        e.setContext(ctx);
      } else {
        if (!ctx.body) {
          ctx.status = 500;
          ctx.body = {
            success: false,
            code: 'sys.error',
            message: e.message,
            stack: e.stack,
          };
        }
      }
      ctx.logger.error(e);
    }
  };
}
