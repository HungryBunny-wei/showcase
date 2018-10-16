// This file was auto created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg'; // Make sure ts to import egg declaration at first
import UserTs from '../../../app/entity/User-ts';
import Base from '../../../app/entity/base';
import OrderCard from '../../../app/entity/order-card';
import OrderInfo from '../../../app/entity/order-info';
import UserCarInfo from '../../../app/entity/user-car-info';
import UserCardPackage from '../../../app/entity/user-card-package';
import User from '../../../app/entity/user';

declare module 'meiyoucar' {
  interface IEntity {
    UserTs: UserTs.UserTs;
    Base: Base.Base;
    OrderCard: OrderCard.OrderCard;
    OrderInfo: OrderInfo.OrderInfo;
    UserCarInfo: UserCarInfo.UserCarInfo;
    UserCardPackage: UserCardPackage.UserCardPackage;
    User: User.User;
  }
}
