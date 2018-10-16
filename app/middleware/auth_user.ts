import {Context} from 'egg';

export default function authUserMiddleware() {
  return async (ctx: Context, next: any) => {
    const user = await ctx.service.user.check();
    ctx.locals.user = user;
    await next();
  };
}
