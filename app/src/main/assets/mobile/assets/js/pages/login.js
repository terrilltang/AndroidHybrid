ngApp.controller('loginCtrl', function ($scope, $http, $timeout, url, __userLoginOut, tipsMsg) {
    var ctrl = this;
    //检查浏览器是否是隐私浏览，页面间的STORAGE传值
    try {
        window.localStorage.foo = 'bar';
    } catch (error) {
        tipsMsg('正在使用隐私浏览模式，更好体验，请退出隐私浏览模式！')
        return false;
    }
    //检查是否有登录成功返回链接地址
    $scope.loginBackUrl = url.search().loginbackurl ? decodeURIComponent(url.search().loginbackurl) : './dynamics.html';
    $scope.loginType = localStorage.loginType = url.search().logintype;

    //切换密码是否显示明文
    $scope.pwdInputType = 'password';
    $scope.togglePwd = function () {
        if ($scope.pwdInputType == 'password') {
            $scope.pwdInputType = 'text';
        } else {
            $scope.pwdInputType = 'password';
        }
    };
    //PC 访问优学是否显示本地差异
    //初始化登录表单
    $scope.loginForm = {
        user: 's-daida-00001', //cd0281
        pwd: '123456' //123456
    };

    window.getFormUser = function (obj) {
        $scope.loginForm.user = obj.value;
    }

    $scope.clearUser = function () {
        $scope.loginForm.user = document.querySelector('#name').value = ''
    }

    //验证格式的正则表达式
    var telReg = /^1[0-9]{10}$/;
    var emailReg = /.+(@).+\.[a-z]+/im;

    //获得用户头像，用户姓名，用户机构,服务于侧边栏
    $scope.getUserInfo = function () {
        $http.jsonp(
            RD.mainUrl + 'do?action=api/user&start=get'
        ).then(function (data) {
            if (data.code == '200') {
                localStorage.userInfo_avatar = data.data[0].full_head_url;
                $http.jsonp(
                    RD.schoolUrl + 'do?action=api/wap/school&start=api&op=userinfo&orgId=' + localStorage.orgId + '&userId=' + localStorage.userId
                ).then(function (profile) {
                    if (profile.code == '200') {
                        localStorage.userInfo_name = profile.data.name;
                        localStorage.userInfo_org = profile.data.className;
                        window.location.href = $scope.loginBackUrl;
                    } else {
                        tipsMsg(profile.msg);
                    }
                });
            } else {
                tipsMsg(data.msg);
            }
        });
    };

    //登录school
    $scope.loginToOrg = function (_option) {
        _option = _option || {};
        __userLoginOut.loginOrg(
            _option
        ).then(function (data) {
            if (data.code == '200' || data.code == '201') {
                $scope.loginTypes = "mobile", $scope.identity = data.data.user_type || 1;
                $http.jsonp(RD.orgUrl + "do?action=api/login_log&start=addLoginLog&login_result=1&plat_form=school&user_id=" + data.user[0].user_id +
                        "&user_code=" + data.user[0].user_code +
                        "&login_name=" + data.user[0].user_name +
                        "&org_id=" + data.user[0].org_id +
                        "&identity=" + $scope.identity +
                        "&login_type=" + $scope.loginTypes)
                    .then(function (sdata) {
                        if (sdata && sdata.code == "200") {
                            $scope.getUserInfo();
                        }
                    });
            } else {
                tipsMsg(data.msg);
            }
        })
    };

    //登录方法
    $scope.loginManual = function () {
        $scope.loginForm.user = document.querySelector('#name').value;
        $scope.loginForm.pwd = document.querySelector('#pwd').value;
        $scope.login();
    }


    $scope.login = function () {
        $scope.type = 'code'; //初始化为CODE类型：账号
        var tel = telReg.test($scope.loginForm.user),
            email = emailReg.test($scope.loginForm.user);
        if (tel) {
            $scope.type = 'mobile';
        }
        if (email) {
            $scope.type = 'email';
        }
        if (!tel && !email) {
            $scope.type = 'code';
        }
        if (!$scope.loginForm.user) {
            tipsMsg('账号不能为空')
            return false;
        }
        if (!$scope.loginForm.pwd) {
            tipsMsg('密码不能为空')
            return false;
        }
        //登录接口讲求开始
        __userLoginOut.loginMainSite({
            user_name: $scope.loginForm.user,
            password: $scope.loginForm.pwd,
            login_type: $scope.type
        }).then(function (data) {
            if (data.code == '200') { //登录主站成功
                if (navigator.userAgent.indexOf('YOYA-XUE.ANDROID') > 0) {
                    NativeJSMethod.syncCookies(RD.mainUrl + 'do?action=api/public_all&start=login');
                }
                __userLoginOut.getUserOrgList({
                    user_id: data.data.user_id
                }).then(function (res) { //获取学生的机构列表
                    if (res.code == '200') {
                        var isHaveOrg = "1";
                        if (res.data.length > 0) {
                            localStorage.orgId = $scope.orgId = res.data[0].org_id;
                            localStorage.orgName = res.data[0].org_name;
                            for (var i = 0; i < res.data.length; i++) {
                                if (res.data[i].is_default_org == '1') {
                                    localStorage.orgId = $scope.orgId = res.data[i].org_id;
                                    localStorage.orgName = res.data[i].org_name;
                                    break;
                                }
                            }
                        } else {
                            isHaveOrg = "0";
                            tipsMsg('您还没有加入任何机构');
                            return;
                        }
                        $scope.loginToOrg({
                            org_id: $scope.orgId,
                            isHaveOrg: isHaveOrg,
                            isPublic: $scope.showTitle ? "" : "1"
                        });
                    } else {
                        tipsMsg(res.msg);
                    }
                });
            } else {
                tipsMsg(data.msg);
            }
        });
    };
});