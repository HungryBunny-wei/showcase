// This file was auto created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg'; // Make sure ts to import egg declaration at first
import AuthUser from '../../../app/middleware/auth_user';
import Locals from '../../../app/middleware/locals';
import UserRequired from '../../../app/middleware/user_required';
import Weapp from '../../../app/middleware/weapp';

declare module 'egg' {
  interface IMiddleware {
    authUser: typeof AuthUser;
    locals: typeof Locals;
    userRequired: typeof UserRequired;
    weapp: typeof Weapp;
  }
}
