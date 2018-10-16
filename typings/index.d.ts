import 'egg';
import {Connection, ConnectionOptions} from 'typeorm';
import {User} from '../app/entity/user';

class Redis {
  get: (key: any) => Promise<any>;
  del: (key: any) => Promise<any>;
  set: (key: any, value: any, op?: string, time?: number) => Promise<any>;
}

interface RedisOption {
  client: {
    host: string,
    port: string,
    password: string,
    db: string,
  };
}

interface WeappSDK {
  appId: string; // your weapp appId
  appSecret: string; // weapp appSecret
  sendCardConfirm: {
    page: string,
    template_id: string,
    name: string,
  };
  sendServiceOver: {
    page: string,
    template_id: string,
    type: string,
    message: string,
  };
  sendServiceConfirm: {
    page: string,
    template_id: string,
    type: string,
  };
  sendCardEndTime: {
    page: string,
    template_id: string,
    message: string,
  };
  sendError: {
    openId: string[],
    page: string,
    template_id: string,
    message: string,
  };
  sendAppointment: {
    page: string,
    template_id: string,
  };
}

declare module 'egg' {

  // 扩展 service


  interface IService {
    news: News;
  }

  // 扩展 app
  interface Application {
    redis: Redis;
    typeorm: Connection;
  }

  // 扩展 context
  interface Context {
    uuid: (a?) => string;
  }

  interface IContextLocals {
    user: User;
    csrf: any;
    config: EggAppConfig;
    session: {
      id: string,
      skey: string,
    };
  }

  // 扩展你的配置
  interface EggAppConfig {
    redis: RedisOption;
    typeorm: ConnectionOptions | ConnectionOptions[];
    weappSDK: WeappSDK;
  }

// 扩展自定义环境
  type EggEnvType = 'local' | 'prod';
}
