import {Application} from 'egg';

export default (app: Application) => {
  const {controller, router, middleware} = app;
  const userRequired: any = middleware.userRequired();
  const authUser: any = middleware.authUser();
  const weapp: any = middleware.weapp();

  router.get('/', controller.home.index);

  router.post('/api/user/login', app.controller.user.login); // 登录
  router.post('/api/user/register', authUser, weapp, app.controller.user.register); // 注册
  router.get('/api/user/queryAll', authUser, userRequired, weapp, app.controller.user.queryAll); // 获取用户信息
  router.post('/api/user/updateInfo', authUser, userRequired, weapp, app.controller.user.updateInfo); // 更新用户信息
  router.get('/api/user/card/lookOver', authUser, userRequired, weapp, app.controller.user.cardLookOver); // 查看月卡订单完成情况
  router.post('/api/user/card/confirm', authUser, userRequired, weapp, app.controller.user.cardConfirm); // 确认月卡完成

  router.post('/api/order/save', authUser, userRequired, weapp, app.controller.order.save); // 保存预约信息
  router.post('/api/order/queryById', authUser, userRequired, weapp, app.controller.order.queryById); // 通过订单id查询订单
  router.get('/api/order', authUser, userRequired, weapp, app.controller.order.index); // 查询预约记录

  router.post('/api/order/buyCard', authUser, userRequired, weapp, app.controller.order.buyCard); // 提交月卡订单
  router.get('/api/order/card/history', authUser, userRequired, weapp, app.controller.order.orderCardHistory); // 月卡购买记录
  router.get('/api/order/getCardOrder', authUser, userRequired, weapp, app.controller.order.getCardOrder); // 获取个人月卡订单
  router.post('/api/order/confirmCardOrder', authUser, userRequired, weapp, app.controller.order.confirmCardOrder); // 确认月卡订单

  router.get('/api/card', app.controller.card.index); // 查询有效月卡
  router.get('/api/card/:id', app.controller.card.findOne); // 查询有效月卡
  router.get('/api/cardPackage', authUser, userRequired, weapp, app.controller.cardPackage.index); // 查询个人卡包
  router.get('/api/cardPackage/:id', authUser, userRequired, weapp, app.controller.cardPackage.findOne); // 查询个人卡包

  router.post('/api/weapp/form', authUser, userRequired, weapp, app.controller.weapp.formCreate);
  /**
   * 服务商接口
   */
  router.get('/api/provider', authUser, userRequired, weapp, app.controller.provider.get); // 获取供应商
  router.post('/api/provider', authUser, userRequired, weapp, app.controller.provider.save); //
  router.put('/api/provider', authUser, userRequired, weapp, app.controller.provider.update); // 更新供应商
  router.get('/api/provider/report', authUser, userRequired, weapp, app.controller.provider.cardReport); // 供应商报表
  router.get('/api/provider/card/user', authUser, userRequired, weapp, app.controller.provider.cardUser); // 查看月卡用户
  router.post('/api/provider/card/addStaff', authUser, userRequired, weapp, app.controller.provider.cardAddStaff); // 月卡指定完成员工
  router.post('/api/provider/card/over', authUser, userRequired, weapp, app.controller.provider.cardOver); // 完成月卡
  router.post('/api/provider/card/lookOver', authUser, userRequired, weapp, app.controller.provider.cardLookOver); // 查看月卡完成情况
  router.post('/api/provider/order/over', authUser, userRequired, weapp, app.controller.provider.orderOver); // 确认完成订单
  /**
   * 员工接口
   */
  router.get('/api/staff/card/user', authUser, userRequired, weapp, app.controller.staff.cardUser); // 获取供应商
  router.get('/api/staff/report', authUser, userRequired, weapp, app.controller.staff.cardReport); // 报表

  /**
   * 管理接口
   */
  router.get('/api/manage/cardOrder', authUser, userRequired, weapp, app.controller.manage.orderCardIndex); // 获取所有月卡订单
  router.post('/api/manage/cardOrder/confirm', authUser, userRequired, weapp, app.controller.manage.orderCardConfirm); // 确认月卡
  router.get('/api/manage/provider', authUser, userRequired, weapp, app.controller.manage.providerIndex); // 获取所有服务供应商 (无权限)
  router.post('/api/manage/provider', authUser, userRequired, weapp, app.controller.manage.providerAdd); // 添加服务供应商
  // router.post('/api/manage/provider/confirm', authUser, userRequired, weapp, app.controller.manage.providerConfirm); // 确认供应商
  // router.post('/api/manage/provider/refuse', authUser, userRequired, weapp, app.controller.manage.providerRefuse); // 确认供应商
  router.post('/api/manage/provider/del', authUser, userRequired, weapp, app.controller.manage.providerDel); // 删除供应商
  router.get('/api/manage/user', authUser, userRequired, weapp, app.controller.manage.userIndex); // 查询用户
  router.post('/api/manage/user', authUser, userRequired, weapp, app.controller.manage.userAdd); // 添加用户
  router.put('/api/manage/user', authUser, userRequired, weapp, app.controller.manage.userUpdate); // 修改用户
  router.post('/api/manage/user/resetPassword', authUser, userRequired, weapp, app.controller.manage.resetPassword); // 管理员重置用户密码
  router.get('/api/manage/user/manage', authUser, userRequired, weapp, app.controller.manage.userManage); // 查询管理员
  router.post('/api/manage/user/manage', authUser, userRequired, weapp, app.controller.manage.userAddManage); // 添加管理员
  router.del('/api/manage/user/manage/:id', authUser, userRequired, weapp, app.controller.manage.userDelManage); // 删除管理员
  router.get('/api/manage/user/:id', authUser, userRequired, weapp, app.controller.manage.userFindById); // 查询用户
  router.get('/api/manage/card', authUser, userRequired, weapp, app.controller.manage.cardIndex); // 查询月卡
  router.post('/api/manage/card', authUser, userRequired, weapp, app.controller.manage.cardSave); // 新增月卡
  router.put('/api/manage/card', authUser, userRequired, weapp, app.controller.manage.cardUpdate); // 更新月卡
  router.post('/api/manage/staff/add', authUser, userRequired, weapp, app.controller.manage.staffAdd); // 添加服务人员
  router.post('/api/manage/staff/del', authUser, userRequired, weapp, app.controller.manage.staffDel); // 更新月卡

  /**
   * 通用接口
   */
  app.router.get('/api/gen/form', app.controller.gen.form);
  app.router.get('/api/gen/multiple', app.controller.gen.multiple);
  app.router.post('/api/gen/upload', app.controller.gen.upload); // 上传一个文件
  app.router.post('/api/gen/uploads', app.controller.gen.uploads); // 上传多个文件
  app.router.get('/api/gen/getFile', app.controller.gen.getFile);
  app.router.post('/api/gen/getFile', app.controller.gen.getFile);

};
