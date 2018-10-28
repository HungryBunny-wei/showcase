import {Controller} from 'egg';

export default class HomeController extends Controller {
  public async index() {
    const {ctx} = this;
    ctx.body = {};
  }

  public async getMenu() {
    const localUser = this.ctx.locals.user;
    const result: any = [];
    if (localUser.Manage === 'admin') {
      result.push({
        "text": "管理员操作",
        "icon": "&#xe638;",
        "subset": [
          {
            "text": "月卡申请列表",
            "icon": "&#xe638;",
            "href": "manage/card-order-list.html"
          },
          {
            "text": "月卡管理",
            "icon": "&#xe638;",
            "href": "manage/card-list.html"
          },
          {
            "text": "用户管理",
            "icon": "&#xe638;",
            "href": "manage/user-list.html"
          },
          {
            "text": "配置服务人员",
            "icon": "&#xe638;",
            "href": "manage/staff-list.html"
          },
          {
            "text": "配置服务商",
            "icon": "&#xe638;",
            "href": "manage/service-list.html"
          },
          {
            "text": "配置管理员",
            "icon": "&#xe638;",
            "href": "manage/manage-list.html"
          }
        ]
      });
    } else if (localUser.Manage === 'manage') {
      result.push({
        "text": "管理员操作",
        "icon": "&#xe638;",
        "subset": [
          {
            "text": "月卡申请列表",
            "icon": "&#xe638;",
            "href": "manage/card-order-list.html"
          },
          {
            "text": "月卡管理",
            "icon": "&#xe638;",
            "href": "manage/card-list.html"
          },
          {
            "text": "用户管理",
            "icon": "&#xe638;",
            "href": "manage/user-list.html"
          },
          {
            "text": "配置服务人员",
            "icon": "&#xe638;",
            "href": "manage/staff-list.html"
          },
          {
            "text": "配置服务商",
            "icon": "&#xe638;",
            "href": "manage/service-list.html"
          }
        ]
      });
    }
    if (localUser.StaffFlag) {

    }
    if(localUser.ServerFlag){
      result.push({
        "text": "服务商操作",
        "icon": "&#xe638;",
        "subset":[
          {
            "text": "月卡服务订单",
            "icon": "&#xe638;",
            "href": "service/card-list.html"
          },
          {
            "text": "预约洗尘订单",
            "icon": "&#xe638;",
            "href": "service/order-list.html"
          }
        ]
      });
    }
    this.ctx.body = {
      data: result,
    };
  }
}
