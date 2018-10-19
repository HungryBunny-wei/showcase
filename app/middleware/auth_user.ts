import {Context} from 'egg';
import {User} from '../entity/user';
import {ErrorService} from '../lib/error/error.service';

export default function authUserMiddleware() {
  return async (ctx: Context, next: any) => {
    const weappSession = await ctx.service.user.check();
    ctx.locals.weappSession = weappSession;
    if (ctx.locals.weappSession) {
      const userRepo = ctx.app.typeorm.getRepository(User);
      let user: User | undefined;
      if (ctx.locals.weappSession.OpenId) { // 如果有OpenId
        user = await userRepo.findOne({
          OpenId: ctx.locals.weappSession.OpenId,
        });
      } else if (!user && ctx.locals.weappSession.UserId) {
        user = await userRepo.findOne({
          Id: ctx.locals.weappSession.UserId,
        });
      } else if (!user && ctx.locals.weappSession.Phone) {
        user = await userRepo.findOne({
          Phone: ctx.locals.weappSession.Phone,
        });
      }
      if (user) {
        ctx.locals.user = user;
      } else {
        user = new User();
        user.register = true;
        ctx.locals.user = user;
      }
    } else {
      throw ErrorService.RuntimeError('sys.noLogin').setStatus(401);
    }
    await next();
  };
}
