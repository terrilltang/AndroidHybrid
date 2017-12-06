var ngAppPersonal = angular.module('ngAppPersonal', ['ui.router', 'ngApp']);
ngAppPersonal.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('');
    $stateProvider
        .state('index', {
            url: '',
            templateUrl: './view/personal/index.html',
            controller: 'setCtrl'
        })
        .state('profile', {
            url: '/profile',
            templateUrl: './view/personal/profile.html',
            controller: 'profileCtrl'
        })
        .state('editPwd', {
            url: '/edit-pwd',
            templateUrl: './view/personal/edit-pwd.html',
            controller: 'editPwdCtrl'
        })
        .state('orgList', {
            url: '/org-list',
            templateUrl: './view/personal/org-list.html',
            controller: 'orgListCtrl'
        })
});
ngAppPersonal.controller('personalCtrl', function ($scope, $http, $timeout,asideMenu, $state, dialogs, tipsMsg, yoyaLoading, __userLoginOut, __orgSet) {
    var ctrl = this;
    $scope.showAside = function () {
        $scope.asideView = true;
        asideMenu.show(ctrl);
    };

    $scope.hideAside = function () {
        $scope.asideView = false;
    };
    $http.jsonp(RD.mainUrl + 'do?action=api/user&start=get')
        .then(function (data) {
            if (data.data.code == '200') {
                $scope.userId = data.data.data[0].user_id;
            }
        });

    
    //是否要退出
    $scope.$on('setCtrlDialogs', function (event, data) {
        $scope.$broadcast('ctrlObj', ctrl);
        $scope.logoutDialogsObj = data;
    });
    $scope.logout = function () {
        dialogs.show(ctrl, $scope.logoutDialogsObj)
    };

    //修改密码
    $scope.$on('sendPwdForm', function (event, data) {
        $scope.pwdForm = data;
    });
    $scope.savePwd = function () {
        if ($scope.pwdForm.newPwd == $scope.pwdForm.confirmPwd) {
            __userLoginOut.setPwd({
                    u_password: $scope.pwdForm.newPwd,
                    u_old_password: $scope.pwdForm.oldPwd
                })
                .then(function (data) {
                    if (data.code == '200') {
                        tipsMsg('修改成功', function () {
                            history.go(-1)
                        })
                    }
                });
        } else {
            tipsMsg('两次新密码不一致!')
        }
    };

    //SET ORG
    $scope.$on('sendGetOrgs', function (event, data) {
        $scope.getOrgs = data;
    });
    $scope.setOrg = function () {
        sessionStorage.currOrgId = sessionStorage.chooseOrgId;
        if (sessionStorage.willChangeOrgId != sessionStorage.chooseOrgId) {
            __orgSet.set({
                    default_org_id: sessionStorage.willChangeOrgId
                })
                .then(function (data) {
                    if (data.code == '200') {
                        if (sessionStorage.willChangeOrgId !== localStorage.orgId) {
                            tipsMsg('修改成功，将在下次登录时生效！', function () {
                                __userLoginOut.logoutSchool()
                                    .then(function (res) {
                                        if (res.code == '200') {
                                            __userLoginOut.logoutMainSite()
                                                .then(function (data) {
                                                    if (data.code == '200') {
                                                        dialogs.close();
                                                        localStorage.clear();
                                                        sessionStorage.clear();
                                                        //ANDROID
                                                        if (env.androidApp) {
                                                            yoyaOrgJsHandler.saveLoginInfo('', '')
                                                        }
                                                        //清除所有COOKIE
                                                        var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
                                                        if (keys) {
                                                            for (var i = keys.length; i--;) {
                                                                document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
                                                            }
                                                        }
                                                        tipsMsg('退出成功', function () {
                                                            window.location.href = './login.html';
                                                        })

                                                    }
                                                })
                                        }

                                    });
                            })
                        } else {
                            tipsMsg('跟当前登录机构相同', function () {
                                sessionStorage.chooseOrgId = sessionStorage.willChangeOrgId;
                                $scope.getOrgs();
                            })
                        }

                    }
                })
        } else {
            tipsMsg('没有做任何更改')
        }

    }
});


ngAppPersonal.controller('setCtrl', function ($scope, $http, $timeout, dialogs,asideMenu, tipsMsg, yoyaLoading, __userLoginOut) {

    $scope.isApp = (localStorage.loginType == "0");
    $scope.showAside = function () {
        console.log(333)
        $scope.asideView = true;
        asideMenu.show(ctrl);
    };

    $scope.hideAside = function () {
        $scope.asideView = false;
    };

    $scope.$on('ctrlObj', function (event, data) {
        $scope.ctrlObj = data;
    });
    var dialogObj = {
        des: '您确认要退出吗?',
        btn2: {
            txt: '确认',
            fun: function () {
                __userLoginOut.logoutSchool()
                    .then(function (res) {
                        if (res.code == '200') {
                            __userLoginOut.logoutMainSite()
                                .then(function (data) {
                                    if (data.code == '200') {
                                        dialogs.close();
                                        localStorage.clear();
                                        sessionStorage.clear();

                                        //ANDROID
                                        if (env.androidApp) {
                                            yoyaOrgJsHandler.saveLoginInfo('', '')
                                        }
                                        //清除所有COOKIE
                                        var keys = document.cookie.match(/[^ =;]+(?=\=)/g);
                                        if (keys) {
                                            for (var i = keys.length; i--;) {
                                                document.cookie = keys[i] + '=0;expires=' + new Date(0).toUTCString()
                                            }
                                        }
                                        tipsMsg('退出成功', function () {
                                            window.location.href = './login.html';
                                        })

                                    }
                                })
                        }

                    });
            }
        }
    };
    $scope.$emit('setCtrlDialogs', dialogObj)

});


ngAppPersonal.controller('profileCtrl', function ($scope, $http, yoyaLoading) {
    $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school&start=api&op=userinfo&orgId=' + localStorage.orgId + '&userId=' + localStorage.userId)
        .then(function (data) {
            if (data.code == '200') {
                $scope.profile = data.data;
                $scope.profile.orgName = localStorage.orgName;
            }
        });
    $scope.editOrg = function () {
        window.location.href = './org.html'
    }

});

ngAppPersonal.controller('editPwdCtrl', function ($scope) {
    //初始化修改密码表单
    $scope.pwdForm = {
        oldPwd: '',
        newPwd: '',
        confirmPwd: ''
    };
    $scope.$emit('sendPwdForm', $scope.pwdForm);
});

ngAppPersonal.controller('orgListCtrl', function ($scope, __orgSet) {
    $scope.getOrgs = function () {
        __orgSet.get()
            .then(function (data) {
                if (data.code == '200') {
                    $scope.orgs = data.data;
                }
            })
    };

    $scope.getOrgs();
    $scope.$emit('sendGetOrgs', $scope.getOrgs);

    $scope.chooseOrg = function (index) {
        $scope.orgs.forEach(function (obj, i, Arr) {
            Arr[i].is_default_org = 0;
        });
        $scope.orgs[index].is_default_org = 1;
        sessionStorage.willChangeOrgId = $scope.orgs[index].org_id;
    };


});