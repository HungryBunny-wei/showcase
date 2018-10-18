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
      data: {
        Phone: phone,
        Password: password,
      },
      headers: this.getPostHeader(),
      method: 'POST',
      // contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
      // processData: false, // NEEDED, DON'T OMIT THIS
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
    'x-csrf-token': this.getCsrf(),
    'X-WX-Id': window.localStorage.getItem(MeiCar.prototype.LOGIN_SESSING),
    'X-WX-Skey': 'bravo',
  }
  if (!result['X-WX-Id']) {
    window.location.href = './login.html';
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
          alert("登录失败: " + responseStr.responseJSON.message);
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
          alert("登录失败: " + responseStr.responseJSON.message);
        }
      }
    });
  })
}
MeiCar.prototype.cehckLogin = function () {
  layui.use(['layer'], () => {
    let layer = layui.layer
      , $ = layui.jquery;
    if (!window.localStorage.getItem(MeiCar.prototype.LOGIN_SESSING)) {
      window.location.href = './login.html';
    }
  })
}

window.meiCar = new MeiCar();