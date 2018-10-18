// This file was auto created by egg-ts-helper
// Do not modify this file!!!!!!!!!

import 'egg'; // Make sure ts to import egg declaration at first
import Test from '../../../app/service/Test';
import Card from '../../../app/service/card';
import Gen from '../../../app/service/gen';
import Manage from '../../../app/service/manage';
import Provider from '../../../app/service/provider';
import User from '../../../app/service/user';
import Wachat from '../../../app/service/wachat';
import Weapp from '../../../app/service/weapp';

declare module 'egg' {
  interface IService {
    test: Test;
    card: Card;
    gen: Gen;
    manage: Manage;
    provider: Provider;
    user: User;
    wachat: Wachat;
    weapp: Weapp;
  }
}
