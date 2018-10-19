import {EggAppConfig, EggAppInfo, PowerPartial} from 'egg';

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  // override config from framework / plugin
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1536946665193_6387';

  // add your egg config in here
  config.middleware = [];

  config.redis = {
    client: {
      host: '120.77.240.193',
      // host: '47.105.84.128',
      port: '6379',
      password: 'rabbit-redis',
      db: '0',
    },
  };
  config.middleware = ['locals'];

  config.weappSDK = {
    appId: 'wx3d1ae19f92ba3cd6', // your weapp appId
    appSecret: 'a030ff9e50cb37ca26ddd0df2a7e6833', // weapp appSecret
    sendCardConfirm: {
      page: 'pages/index/index',
      template_id: 'LHLsY-KPbm1W3az3ulW5A2fyO9N4NQNFHuWjxtXe27I',
      name: '美优洗车',
    },
    sendServiceOver: {
      type: '月卡洗车',
      message: '已为您服务，请尽快评价。',
      page: 'pages/index/index',
      template_id: 'BoGQB5f56mh-8x53EVzmdyldeDyYy1pCxqKtEC-fXcI',
    },
    sendServiceConfirm: {
      type: '用户评价了本次洗车服务',
      page: 'pages/index/index',
      template_id: '2XOHJ4Hw-ygVF_CG2eiybZ3CMlnWiyFaZ10taN0xZL4',
    },
    sendCardEndTime: {
      message: '点击查看特权详情，及时续费享受更多特权。',
      page: 'pages/index/index',
      template_id: 'hSuJRXB3foG_afUeaoMbGOrtI-uUspq_vwMM3_U40ec',
    },
    sendError: {
      openId: ['oqHX64kSigryRsPuaxx0INDiY7c0'],
      page: 'pages/index/index',
      template_id: '5xNLKrMkL5cb6-VJoQ5kc-sAQisMrvTESVdZsWP5RZ4',
    },
    sendAppointment: {
      page: 'pages/index/index',
      template_id: 'l1sxRkoEQ-XhEBIl817qix6LZKHmzkaTT_pslSSe_5g',
    },
  };
  config.security = {
    csrf: {
      ignore: ['/api/gen', '/api/user/login'],
      // ignore: '/api/gen',
      ignoreJSON: true, // 默认为 false，当设置为 true 时，将会放过所有 content-type 为 `application/json` 的请求
      queryName: '_csrf', // 通过 query 传递 CSRF token 的默认字段为 _csrf
      bodyName: '_csrf', // 通过 body 传递 CSRF token 的默认字段为 _csrf
    },
  };
  config.view = {
    defaultViewEngine: 'nunjucks',
  };

  // add your special config in here
  const bizConfig = {
    sourceUrl: `https://github.com/eggjs/examples/tree/master/${appInfo.name}`,
  };

  // the return config will combines to EggAppConfig
  return {
    ...config,
    ...bizConfig,
  };
};
