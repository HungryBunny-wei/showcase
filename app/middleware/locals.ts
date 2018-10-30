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

      ctx.logger.info('头部');
      ctx.logger.info(ctx.request.headers);
      ctx.logger.info('响应');
      ctx.logger.info(ctx.response.headers);
      if (ctx.locals.user) {
        const user = ctx.locals.user;
        ctx.logger.info(`[${user.Name}][${user.Id}]`);
      } else {
        ctx.logger.info(``);
      }
    } catch (e) {
      ctx.logger.error(e);
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
    }
  };
}
