// This file was auto created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg'; // Make sure ts to import egg declaration at first
import Card from '../../../app/controller/card';
import Gen from '../../../app/controller/gen';
import Home from '../../../app/controller/home';
import Manage from '../../../app/controller/manage';
import Order from '../../../app/controller/order';
import Provider from '../../../app/controller/provider';
import User from '../../../app/controller/user';
import Weapp from '../../../app/controller/weapp';

declare module 'egg' {
  interface IController {
    card: Card;
    gen: Gen;
    home: Home;
    manage: Manage;
    order: Order;
    provider: Provider;
    user: User;
    weapp: Weapp;
  }
}
