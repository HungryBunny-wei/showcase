function MeiCar() {

}

MeiCar.prototype.LOGIN_SESSING = 'meiyou.session';
MeiCar.prototype.getCsrf = function () {
  var keyValue = document.cookie.match('(^|;) ?csrfToken=([^;]*)(;|$)');
  return keyValue ? keyValue[2] : null;
}
MeiCar.prototype.login = function (phone, password) {
  layui.use(['layer'], () => {
    let layer = layui.layer
      , $ = layui.jquery;

    $.ajax({
      url: '/api/user/login',
      // headers: this.getPostHeader(),
      data: {
        Phone: phone,
        Password: password
      },
      method: 'POST',
      success: function (result) {
        window.localStorage.setItem(MeiCar.prototype.LOGIN_SESSING, result.session.id);
        window.location.href = './index.html';
      },
      error: function (responseStr, a) {
        console.log(responseStr);
        layer.alert(responseStr.responseJSON.message, {
          title: '登录失败'
        });
      }
    });

  });
}
MeiCar.prototype.getPostHeader = function () {
  let result = {
    'X-WX-Id': window.localStorage.getItem(MeiCar.prototype.LOGIN_SESSING),
    'X-WX-Skey': 'bravo',
  }
  if (!result['X-WX-Id']) {
    window.location.href = './login.html';
  }
  if(this.getCsrf()){
    result['x-csrf-token'] = this.getCsrf();
  }
  return result;
}
MeiCar.prototype.userAddManage = function (data, call) {
  layui.use(['layer'], () => {
    let layer = layui.layer
      , $ = layui.jquery;
    $.ajax({
      url: '/api/manage/user/manage?_csrf=' + this.getCsrf(),
      data: data,
      headers: this.getPostHeader(),
      method: 'POST',
      success: function (result) {
        call(result);
      },
      error: function (responseStr, a) {
        console.log(responseStr);
        layer.alert(responseStr.responseJSON.message, {
          title: '提交失败'
        });
      }
    });
  })
}
MeiCar.prototype.userDelManage = function (id, call) {
  layui.use(['layer'], () => {
    let layer = layui.layer
      , $ = layui.jquery;
    $.ajax({
      url: `/api/manage/user/manage/${id}`,
      headers: this.getPostHeader(),
      method: 'DELETE',
      success: function (result) {
        call(result);
      },
      error: function (responseStr, a) {
        console.log(responseStr);
        layer.alert(responseStr.responseJSON.message, {
          title: '提交失败'
        });
      }
    });
  })
}
MeiCar.prototype.post = function (url, body, call, errCall) {
  layui.use(['layer'], () => {
    let layer = layui.layer
      , $ = layui.jquery;
    $.ajax({
      url: url,
      headers: this.getPostHeader(),
      data: body,
      method: 'POST',
      success: function (result) {
        call(result)
      },
      error: function (responseStr, a) {
        console.log(responseStr);
        if (errCall) {
          errCall(responseStr);
        } else {
          layer.alert(responseStr.responseJSON.message, {
            title: '请求失败'
          });
        }
      }
    });
  })
}
MeiCar.prototype.get = function (url, body, call, errCall) {
  layui.use(['layer'], () => {
    let layer = layui.layer
      , $ = layui.jquery;
    $.ajax({
      url: url,
      headers: this.getPostHeader(),
      data: body,
      method: 'GET',
      success: function (result) {
        call(result)
      },
      error: function (responseStr, a) {
        console.log(responseStr);
        if (errCall) {
          errCall(responseStr);
        } else {
          layer.alert(responseStr.responseJSON.message, {
            title: '请求失败'
          });
        }
      }
    });
  })
}
MeiCar.prototype.put = function (url, body, call, errCall) {
  layui.use(['layer'], () => {
    let layer = layui.layer
      , $ = layui.jquery;
    $.ajax({
      url: url,
      headers: this.getPostHeader(),
      data: body,
      method: 'PUT',
      success: function (result) {
        call(result)
      },
      error: function (responseStr, a) {
        console.log(responseStr);
        if (errCall) {
          errCall(responseStr);
        } else {
          layer.alert(responseStr.responseJSON.message, {
            title: '请求失败'
          });
        }
      }
    });
  })
}
MeiCar.prototype.checkLogin = function (call) {
  layui.use(['layer'], () => {
    let layer = layui.layer
      , $ = layui.jquery;
    if (window.localStorage.getItem(MeiCar.prototype.LOGIN_SESSING)) {
      this.get('/api/user/queryAll', {}, (result) => {
        call(result.obj);
        window.sessionStorage.setItem('meiyou.userInfo', JSON.stringify(result.obj));
      }, () => {
        window.location.href = './login.html';
      })
    } else {
      window.location.href = './login.html';
    }
  })
}
MeiCar.prototype.getUser = function () {
  return JSON.parse(window.sessionStorage.getItem('meiyou.userInfo'));
}

window.meiCar = new MeiCar();