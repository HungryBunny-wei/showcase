import {EggPlugin} from 'egg';

const plugin: EggPlugin = {
    // static: true,
    // nunjucks: {
    //   enable: true,
    //   package: 'egg-view-nunjucks',
    // },
    redis: {
      enable: true,
      package: 'egg-redis',
    },
    nunjucks: {
      enable: true,
      package: 'egg-view-nunjucks',
    },
    static: {
      enable: true,
      package: 'egg-static',
    },
  }
;

export default plugin;
