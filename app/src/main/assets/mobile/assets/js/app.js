/**
 * Created by TANG on 2016/2/29.
 */

(function (win) {
    win.env = Object.create(null);

    win.dev = {
        debug: false
    }

    var local = {
        mainUrl: 'http://www.yoya-dev.com/',
        schoolUrl: 'http://school.yoya-dev.com/',
        zykUrl: 'http://zyk.yoya-dev.com/',
        orgUrl: 'http://org.yoya-dev.com/',
    }
    var test = {
        mainUrl: 'http://test.yoya.com/',
        schoolUrl: 'http://school.test.yoya.com/',
        zykUrl: 'http://zyk.test.yoya.com/',
        orgUrl: 'http://org.test.yoya.com/'
    }
    var gray = {
        mainUrl: 'http://www.gray.yoya.com/',
        schoolUrl: 'http://school.gray.yoya.com/',
        zykUrl: 'http://zyk.gray.yoya.com/',
        orgUrl: 'http://org.gray.yoya.com/'
    }

    var prod = {
        mainUrl: 'http://www.yoya.com/',
        schoolUrl: 'http://school.yoya.com/',
        zykUrl: 'http://zyk.yoya.com/',
        orgUrl: 'http://org.yoya.com/'
    }


    win.RD = win.env = gray;

    //视窗控制

    win.calcRem = function () {
        var dpr = window.devicePixelRatio || 1;
        var docWidth = Math.min(480, document.documentElement.clientWidth, document.documentElement.clientHeight, window.screen.availWidth);
        var calcFontSize = docWidth * dpr / 10;
        var scale = parseFloat(1 / dpr).toFixed(2);
        var viwPortEle = document.querySelector('meta[name=viewport]');
        document.querySelector('html').setAttribute('style', 'font-size:' + calcFontSize.toFixed(2) + 'px');
        viwPortEle.setAttribute('content', 'width=' + docWidth * dpr.toFixed(2) + ', user-scalable=no, initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale);
    };
}(window));



document.addEventListener('DOMContentLoaded', function () {
    window.calcRem();
    document.addEventListener('touchmove', {
        passive: true
    }, function (event) {
        if (event.touches.length <= 1) {
            event.preventDefault();
        }
    });
});

//POST 模块转义 (暂时无用）
angular.module('postModule', [], function ($httpProvider) {
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    var param = function (obj) {
        var query = '',
            name, value, fullSubName, subName, subValue, innerObj, i;
        for (name in obj) {
            value = obj[name];
            if (value instanceof Array) {
                for (i = 0; i < value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            } else if (value instanceof Object) {
                for (subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            } else if (value !== undefined && value !== null)
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }
        return query.length ? query.substr(0, query.length - 1) : query;
    };
    $httpProvider.defaults.transformRequest = [function (data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
});

var ngApp = angular.module('ngApp', ['postModule']);

//局部滚动区域 E--ELEMENT元素
ngApp.directive('scrollWrap', function () {
    return {
        restrict: 'C',
        link: function (scope, element) {
            var _self = element[0];
            element.bind('touchstart', function (event) {

                if (event.touches.length <= 1) {
                    event.stopPropagation();
                    _self.allowUp = (_self.scrollTop > 0);
                    _self.allowDown = (_self.scrollTop <= _self.scrollHeight - _self.clientHeight);
                    _self.slideBeginY = event.touches[0].pageY;
                }

            });
            element.bind('touchmove', function (event) {
                if (event.touches.length <= 1) {
                    var up = (event.touches[0].pageY > _self.slideBeginY);
                    var down = (event.touches[0].pageY < _self.slideBeginY);
                    _self.slideBeginY = event.touches[0].pageY;
                    if ((up && _self.allowUp) || (down && _self.allowDown)) {
                        event.stopPropagation();
                    } else {
                        event.preventDefault();
                    }
                }

            });
        }
    }
});



//图片访问出错
ngApp.directive('failBackUrl', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                angular.element(this).attr('src', 'assets/images/' + attrs.failBackUrl)
                element.onError = null;
            });
        }
    }
});

//URL参数获取
ngApp.service('url', function () {
    return {
        search: function () {
            var arr = location.search.substr(1).toLocaleLowerCase().split('&');
            var brr = {};
            for (var i = 0; i < arr.length; i++) {
                var _arr = arr[i].split('=');
                if (!_arr[1]) _arr[1] = true;
                brr[_arr[0]] = _arr[1];
            }
            return brr;
        }
    };
});


//转换实体符 &
ngApp.filter('removeAMP', function () {
    return function (str) {
        return str.replace(/&amp;/img, '&');
    }
});

//日期过滤
ngApp.filter('yoyaDate', function () {
    return function (str, format, filter) {
        var arr = [];
        if (typeof str == 'string' && str.length <= 14) {
            arr = str.split('');
            var _year = arr[0] + arr[1] + arr[2] + arr[3],
                _month = arr[4] + arr[5],
                _day = arr[6] + arr[7],
                _h = arr[8] + arr[9],
                _m = arr[10] + arr[11],
                _s = arr[12] + arr[13];
            var timeStamp = new Date(new Date(_year + '/' + _month + '/' + _day + ' ' + _h + ':' + _m + ':' + _s));
            var timeDiff = new Date().getTime() - timeStamp;
            var isToday = timeDiff < 24 * 60 * 60 * 1000 && timeDiff > 0;
            var wd = '日一二三四五六';

            if (isToday && filter) {
                if (timeDiff > 60 * 60 * 1000) {
                    return parseInt(timeDiff / (60 * 60 * 1000)) + '小时前'
                } else {
                    if (timeDiff < 60 * 1000) {
                        return '刚刚'
                    } else {
                        return parseInt(timeDiff / (60 * 1000)) + '分钟前'
                    }

                }
            } else {
                if (format) {
                    format = format.replace('YYYY', timeStamp.getFullYear());
                    format = format.replace('MM', timeStamp.getMonth() + 1);
                    format = format.replace('DD', timeStamp.getDate());
                    format = format.replace('hh', timeStamp.getHours() <= 9 ? '0' + timeStamp.getHours() : timeStamp.getHours());
                    format = format.replace('mm', timeStamp.getMinutes() <= 9 ? '0' + timeStamp.getMinutes() : timeStamp.getMinutes());
                    format = format.replace('ss', timeStamp.getSeconds() <= 9 ? '0' + timeStamp.getSeconds() : timeStamp.getSeconds());
                    format = format.replace('W', wd.charAt(timeStamp.getDay()));
                    return format;

                } else {
                    return arr[0] + arr[1] + arr[2] + arr[3] + '.' + arr[4] + arr[5] + '.' + arr[6] + arr[7];
                }
            }


        } else {
            return '';
        }
    }
});

//LOADING
ngApp.service('yoyaLoading', function () {
    var yyLoading = document.createElement('div'),
        _str;
    yyLoading.setAttribute('class', 'yoyaLoading');

    function createLoading(str) {
        _str = str ? str : '加载中...';
        yyLoading.innerHTML = '<s></s><div class="loading-content"><div class="spinner"><div class="double-bounce1"></div><div class="double-bounce2"></div></div><span>' + _str + '</span></div>';
        document.body.appendChild(yyLoading);
    }

    function removeLoading() {
        if (document.body.querySelector('.yoyaLoading')) {
            document.body.removeChild(yyLoading);
        }
    }

    return {
        on: function (str) {
            removeLoading();
            createLoading(str);
        },
        close: function () {
            removeLoading();
        }
    }
});

//DIALOGS
ngApp.component('yoyaDialog', {
    templateUrl: './widget/popup-dialog.html',
    bindings: {
        dialog: '<'
    },
    controller: function () {
        this.dialog = {
            btn1: '取消',
            btn2: '确认'
        }
    }
});
ngApp.service('dialogs', function ($timeout) {
    var me = this;
    me.opt = {
        show: true,
        title: '',
        des: '此处有提示',
        closeBtn: false,
        closeFun: function () {
            me.opt.show = false;
        },
        btn1: {
            txt: '取消',
            fun: function () {
                me.opt.closeFun();
            }
        },
        btn2: {
            txt: '确认',
            fun: function () {
                alert('CONFIRM')
            }
        }
    };
    return {
        show: function (obj, options) {
            me.opt.show = true;
            obj.dialog = angular.extend(me.opt, options);
        },
        close: function () {
            console.log(me);
            me.opt.show = false;
        }
    }
});


//ASIDE MENU
ngApp.component('yoyaAside', {
    templateUrl: './widget/aside.html',
    bindings: {
        aside: '<'
    }
});
ngApp.service('asideMenu', function () {
    return {
        show: function (obj) {
            obj.aside = {
                src: localStorage.userInfo_avatar,
                name: localStorage.userInfo_name,
                org: localStorage.userInfo_org,
                orgId: localStorage.orgId
            };

        },
        hide: function (obj) {
            obj.aside = false;
        }
    }
});

ngApp.directive('videoSrc', function () {
    return {
        restrict: 'A',

        link: function (scope, element, attrs) {
            var _self = element[0];
            console.log(attrs);console.log(attrs);
            _self.setAttribute('src', attrs.videoSrc)
            _self.setAttribute('poster', attrs.videoPoster)
        }
    }
})

ngApp.directive('asideAvatar', function () {
    return {
        restrict: 'C',
        link: function (scope, element) {
            var _self = element[0];
            var content = document.createElement('img');
            var avatarImg = localStorage.userInfo_avatar ? localStorage.userInfo_avatar : './assets/images/avatar-null.png';
            content.setAttribute('src', avatarImg);
            _self.appendChild(content)
        }
    }
});

//TODAY
ngApp.value('todayStr', '' + new Date().getFullYear() + ((new Date().getMonth() + 1) > 9 ? (new Date().getMonth() + 1) : ('0' + (new Date().getMonth() + 1))) + (new Date().getDate() > 9 ? (new Date().getDate()) : ('0' + new Date().getDate())));

ngApp.service('tipsMsg', function () {
    var sysMsg = document.createElement('div'),
        _t;
    sysMsg.setAttribute('class', 'sysMsg')
    var sysMsgEle = document.querySelector('.sysMsg')

    function isSysMsg() {
        return sysMsgEle = document.querySelector('.sysMsg')
    }

    function removeMsg() {
        if (sysMsgEle) {
            //sysMsgEle.classList.remove('enter');
            sysMsgEle.classList.add('out');
            setTimeout(function () {
                try {
                    if (isSysMsg()) {
                        sysMsgEle.classList.remove('out');
                        document.body.removeChild(sysMsg)
                    }
                } catch (err) {
                    console.log(err.message)
                }
            }, 100)
        }

    }

    function msgContent(str) {
        var _str = str ? str : '系统消息提示'
        return sysMsg.innerHTML = '<div class="sysMsgWrap"><div class="sysMsgContent"><s></s><span>' + _str + '</span></div></div>';
    }

    function fadeOutMsg(callback, t) {
        var _t_ = t ? t : 1200
        _t = setTimeout(function () {
            if (isSysMsg()) {
                removeMsg()
                callback ? callback() : '';
            }

        }, _t_ - 200);
    }


    return function (str, callback, t) {
        clearTimeout(_t)
        msgContent(str)
        document.body.appendChild(sysMsg);
        sysMsg.classList.remove('out')
        sysMsg.classList.add('enter')
        fadeOutMsg(callback, t + 400)

        sysMsg.addEventListener('click', function () {
            if (isSysMsg()) {
                removeMsg();
                callback ? callback() : '';
            }
        })
    }
})
//AJAX请求拦截
ngApp.config(function ($httpProvider) {
    var checkAppSkip = function () {
        //子应用 --> 主应用
        if (env.androidApp && window.yoyaOrgJsHandler) {
            yoyaOrgJsHandler.logout();
        } else if (env.iosApp && false) {
            //待实现
        } else {
            window.location.href = './login.html?timestamp=' + Math.random() + '&loginType=1&loginBackUrl=' + encodeURIComponent(location.href.toString())
        }
    }
    $httpProvider.interceptors.push(function (tipsMsg, yoyaLoading) {
        return {
            'request': function (config) {
                //config.timeout=2000
                var addonString = '';
                if (config.url.indexOf("html") > 0) {
                    addonString = '';
                } else {
                    addonString = '&ranStr=' + new Date().getTime();
                }
                config.url = config.url + addonString;
                if (config.method == 'JSONP') {
                    config.url = config.url + '&callback=JSON_CALLBACK';
                }
                return config;
            },
            'response': function (response) {
                if (response.config.url.indexOf('public_all&start=login') > 0) { //如果调用的是登录接口
                    if (response.data.code == '200' && response.data.data.user_id) { //如果获取到用户ID
                        localStorage.repeatUser = localStorage.userId == response.data.data.user_id;
                        sessionStorage.userId = localStorage.userId = response.data.data.user_id;
                    }
                }
                if (response.status < 200 || response.status > 299) {
                    yoyaLoading.close()
                    tipsMsg('服务器开了个小差，请稍候重试')
                }
                if (response.data.code) {
                    switch (response.data.code) {
                        case 200:
                            break;
                        case '200':
                            break;
                        case '401': //会话结束或者未登录
                            tipsMsg(response.data.msg, function () {
                                checkAppSkip();
                            });
                            break;
                        case '402': //用户在别处登录
                            tipsMsg(response.data.msg, function () {
                                localStorage.clear();
                                sessionStorage.clear();
                                checkAppSkip();
                            });
                            break;
                        default: //请求成功
                            tipsMsg(response.data.msg);
                            break;
                    }
                    return response.data;
                } else {
                    return response
                }
            },
            'responseError': function (Error) {
                yoyaLoading.close()
                tipsMsg('请求出错，紧急修复中，请稍候重试!!!', '', 3000)
                return Error
            }
        }
    });
});


/*-----------------------------AJAX SERVICE---------------------------------*/

//登录相关
ngApp.service('__userLoginOut', function ($http) {
    return {
        loginMainSite: function (obj) {
            var un = obj.user_name ? '&user_name=' + obj.user_name : '';
            var pw = obj.password ? '&password=' + obj.password : '';
            var lt = obj.login_type ? '&login_type=' + obj.login_type : '';
            if (dev.debug) {
                console.log('登录主站：');
                console.log(obj);

            }
            return $http.jsonp(RD.mainUrl + 'do?action=api/public_all&start=login' + un + pw + lt)
        },
        getUserOrgList: function (obj) {
            var ui = obj.user_id ? '&user_id=' + obj.user_id : '';
            if (dev.debug) {
                console.log('获取用户机构列表：');
                console.log(obj);
            }
            return $http.jsonp(RD.schoolUrl + 'do?action=api/support&start=join_org_list' + ui)
        },
        loginOrg: function (obj) {
            obj = obj || {};
            var params = "";
            for (var i in obj) {
                params = params + "&" + i + "=" + obj[i];
            }
            if (dev.debug) {
                console.log('登录SCHOOL：');
                console.log(obj);
            }
            return $http.jsonp(RD.schoolUrl + 'do?action=support/login&start=login' + params)
        },
        logoutMainSite: function () {
            return $http.jsonp(RD.mainUrl + 'do?action=api/public_all&start=logout')
        },
        logoutSchool: function () {
            return $http.jsonp(RD.schoolUrl + 'do?action=api/support&start=logout')
        },
        setPwd: function (obj) {
            var up = obj.u_password ? '&u_password=' + obj.u_password : '';
            var uop = obj.u_old_password ? '&u_old_password=' + obj.u_old_password : '';
            if (dev.debug) {
                console.log('修改密码：');
                console.log(obj);
            }
            return $http.jsonp(RD.mainUrl + 'do?action=api/user&start=changepassword' + up + uop)
        }

    }
});

//默认机构
ngApp.service('__orgSet', function ($http) {
    return {
        get: function () {
            return $http.jsonp(RD.schoolUrl + 'do?action=api/support&start=join_org_list&userId=' + localStorage.userId)
        },
        set: function (obj) {
            var doi = obj.default_org_id ? '&default_org_id=' + obj.default_org_id : '';
            if (dev.debug) {
                console.log('设置默认机构：');
                console.log(obj);
            }
            return $http.jsonp(RD.schoolUrl + 'do?action=api/support&start=setup_default_org' + doi)
        }
    }
});

//获取动态
ngApp.service('__activityList', function ($http) {
    return function (obj) {
        var nt = obj.news_title ? '&news_title=' + obj.news_title : ''; //获取搜索标题
        var pn = obj.pageNo ? '&pageNo=' + obj.pageNo : ''; //页码

        if (dev.debug) {
            console.log(obj);
            if (!nt) {
                console.log('获取动态：搜索标题为空')
            }
            if (!pn) {
                console.log('获取动态：页码为空')
            }
        }
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school&start=api&op=newsList&org_id=' + localStorage.orgId + '&user_id=' + localStorage.userId + pn + nt)
    }
});

//新闻资讯
ngApp.service('__newsList', function ($http) {
    return function (obj) {
        var ct = obj.cur_time ? '&cur_time=' + obj.cur_time : '';
        var ps = obj.pageSize ? '&pageSize=' + obj.pageSize : '6';
        var pn = obj.pageNumber ? '&pageNumber=' + obj.pageNumber : '';
        var oi = obj.org_id ? '&org_id=' + obj.org_id : '';
        if (dev.debug) {
            console.log('新闻资讯列表：');
            console.log(obj);
        }
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school_public&start=api&op=getOrgNewsList' + oi + pn + ct + ps)
    }
});

//新闻详情
ngApp.service('__newsDetail', function ($http) {
    return function (obj) {
        var oi = obj.org_id ? '&org_id=' + obj.org_id : '';
        var ni = obj.news_id ? '&news_id=' + obj.news_id : '';
        if (dev.debug) {
            console.log(obj)
        }
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school_public&start=api&op=getOrgNewsDetail' + oi + ni)
    }
});

//我的微课
ngApp.service('__myCourses', function ($http) {
    return function (obj) {
        var pn = obj.pageNo ? '&pageNo=' + obj.pageNo : '';
        if (dev.debug) {
            if (!pn) {
                console.log('我的课程：页码不能为空！')
            }
        }
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school&start=api&op=album&orgId=' + localStorage.orgId + '&userId=' + localStorage.userId + pn)
    }
});

//我的进阶课程
ngApp.service('__myStepCourses', function ($http) {
    return function (obj) {
        var pn = obj.pageNo ? '&pageNo=' + obj.pageNo : '';
        var ct = obj.curTime ? '&curTime=' + obj.curTime : '';
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school&start=api&op=myCourseList&org_id=' + localStorage.orgId + '&user_id=' + localStorage.userId + pn + ct)
    }
});

//学习难点
ngApp.service('__tasks', function ($http) {
    return {
        get: function (obj) {
            var pn = obj.pageNo ? '&pageNo=' + obj.pageNo : '';
            var lrdt = obj.lastRecDatetime ? '&lastRecDatetime=' + obj.lastRecDatetime : '';
            if (dev.debug) {
                console.log('获取学习难点：');
                console.log(obj);
            }
            return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school&start=api&op=difficult&orgId=' + localStorage.orgId + '&userId=' + localStorage.userId + pn + lrdt)
        },
        resolve: function (obj) {
            var fi = obj.feedback_id ? '&FEEDBACK_ID=' + obj.feedback_id : '';
            var fd = obj.feedback_difficulty ? '&FEEDBACK_DIFFICULTY=' + obj.feedback_difficulty : '';
            if (dev.debug) {
                console.log('解决学习难点：');
                console.log(obj);
            }
            return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school&start=api&op=difficult_state' + fd + fi)
        }
    }
});

//我的作品
ngApp.service('__myWorks', function ($http) {
    return function (obj) {
        var lt = obj.lastRecTime ? '&lastRecTime=' + obj.lastRecTime : '';
        var pc = obj.pageCount ? '&pageCount=' + obj.pageCount : '';
        var page = obj.page ? '&page=' + obj.page : '';
        if (dev.debug) {
            console.log('我的作品：');
            console.log(obj);
        }
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school&start=api&op=myMovie&org_id=' + localStorage.orgId + '&user_id=' + localStorage.userId + lt + pc + page)
    }
});

//课程内容
ngApp.service('__courseAlbum', function ($http) {
    return function (obj) {
        var cai = obj.course_album_id ? '&course_album_id=' + obj.course_album_id : '';
        var np = obj.lastRecDatetime ? '&lastRecDatetime=' + obj.lastRecDatetime : '';
        var pn = obj.pageNo ? '&pageNo=' + obj.pageNo : '';
        if (dev.debug) {
            if (!cai) {
                console.log('课程内容：课程内容ID不能为空')
            }
            if (!np) {
                console.log('课程内容：第1页后面的下一页参数不能为空')
            }
            if (!pn) {
                console.log('课程内容：页码不能为空')
            }
        }
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school&start=api&op=albumSource&userId=' + localStorage.userId + '&orgId=' + localStorage.orgId + cai + np + pn)
    }
});

//活动详情
ngApp.service('__activityDetail', function ($http) {
    return function (obj) {
        var si = obj.send_id ? '&send_id=' + obj.send_id : ''; //活动发送ID
        var ai = obj.activity_id ? '&activity_id=' + obj.activity_id : ''; //活动ID
        if (dev.debug) {
            console.log(obj);
            if (!si) {
                console.log('活动详情：发送ID为空')
            }
            if (!ai) {
                console.log('活动详情：活动ID为空')
            }
        }
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school&start=api&op=activityDetail&user_id=' + localStorage.userId + si + ai)
    }
});

//课程详情
ngApp.service('__courseDetail', function ($http) {
    return function (obj) {
        var si = obj.send_id ? '&send_id=' + obj.send_id : '';
        var ci = obj.course_id ? '&course_id=' + obj.course_id : '';
        var nii = obj.news_index_id ? '&news_index_id=' + obj.news_index_id : '';
        if (dev.debug) {
            if (!si) {
                console.log('课程详情：SEND ID不能为空')
            }
            if (!ci) {
                console.log('课程详情：COURSE ID不能为空')
            }
            if (!nii) {
                console.log('课程详情：NEWS INDEX ID不能为空')
            }
        }
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school&start=api&op=course_detail&orgId=' + localStorage.orgId + '&userId=' + localStorage.userId + si + ci + nii)
    }
});

//微课反馈
ngApp.service('__addOrUpdateFeedback', function ($http) {
    return function (obj) {
        var si = obj.send_id ? '&SEND_ID=' + obj.send_id : '';
        var nii = obj.news_index_id ? '&NEWS_INDEX_ID=' + obj.news_index_id : '';
        var fi = obj.feedback_id ? '&feedback_id=' + obj.feedback_id : '';
        var ri = fi ? '&RECORD_ID=edit' : '';

        var fd = obj.feedback_level ? '&FEEDBACK_DIFFICULTY=' + obj.feedback_level : '';
        var fc = obj.feedback_content ? '&FEEDBACK_CONTENT=' + obj.feedback_content : '';
        if (dev.debug) {
            if (!si) {
                console.log('反馈：SEND ID不能为空')
            }
            if (!nii) {
                console.log('反馈：NEWS INDEX ID不能为空')
            }
            if (!fi) {
                console.log('反馈：添加反馈')
            }
            if (fi) {
                console.log('反馈：修改反馈')
            }
            if (!fd) {
                console.log('反馈：反馈难度不能没有')
            }

        }
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school&start=api&op=addOrUpdateFeedBack&orgId=' + localStorage.orgId + '&FEEDBACK_USER_ID=' + localStorage.userId + si + nii + fi + ri + fd + fc)
    }
});

//微课列表（带筛选）
ngApp.service('__microCoursesList', function ($http) {
    return function (obj) {
        var ci = obj.column_id ? '&column_id=' + obj.column_id : '';
        var oi = obj.org_id ? '&org_id=' + obj.org_id : '';
        var pn = obj.pageNo ? '&pageNo=' + obj.pageNo : '';
        var cn = obj.course_name ? '&course_name=' + obj.course_name : '';
        var ot = obj.order_type ? '&order_type=' + obj.order_type : '';
        if (dev.debug) {
            if (ci) {
                console.log('微课列表：COLUMN ID相应微课')
            }
            if (!oi) {
                console.log('微课列表：ORG ID不能为空')
            }
            if (!pn) {
                console.log('微课列表：页码--' + obj.pageNo)
            }
            if (cn) {
                console.log('微课列表：搜索关键词--' + obj.course_name)
            }
        }
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school_public&start=api&op=courseList' + oi + pn + ci + cn + ot)
    }
});

//微课筛选条件一级
ngApp.service('__microCoursesParentFilter', function ($http) {
    return function (obj) {
        var oi = obj.org_id ? '&org_id=' + obj.org_id : '';
        oi += obj.column_type ? '&column_type=' + obj.column_type : '';
        if (dev.debug) {
            if (!oi) {
                console.log('总微课列表：ORG ID不给为空')
            }
        }
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school_public&start=api&op=courseColumnList' + oi)
    }
});

//微课筛选条件子级
ngApp.service('__microCoursesChildFilter', function ($http, url) {
    return function (obj) {
        var ci = obj.column_id ? '&column_id=' + obj.column_id : '';
        var oi = obj.org_id ? '&org_id=' + obj.org_id : '&org_id=' + url.search().org_id;
        ci += obj.column_type ? '&column_type=' + obj.column_type : '';
        if (dev.debug) {
            if (!ci) {
                console.log('微课筛选：COLUMN ID不能为空')
            }
            if (!oi) {
                console.log('ORGID不能为空')
            }
        }
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school_public&start=api&op=courseChildColumnList' + oi + ci)
    }
});

//提交作品
ngApp.service('__submitWorks', function ($http) {
    return function (obj) {
        var si = obj.send_id ? '&send_id=' + obj.send_id : ''; //活动发送ID
        var wd = obj.work_desc ? '&work_desc=' + obj.work_desc : ''; //提交的作品描述
        var fi = obj.folder_id ? '&folder_id=' + obj.folder_id : ''; //活动folder id
        var wn = obj.work_name ? '&work_name=' + obj.work_name : ''; //提交的作品名称
        var um = obj.uploadMode ? '&uploadMode=' + obj.uploadMode : ''; //提交的上传模式
        var ri = obj.resource_id ? '&resource_id=' + obj.resource_id : ''; //上传的作品资源ID
        var re = obj.resource_ext ? '&resource_ext=' + obj.resource_ext : ''; //上传的文件后缀
        var ws = obj.work_status ? '&work_status=' + obj.work_status : ''; //上传文件状态

        if (dev.debug) {
            if (!si) {
                console.log('提交作品：活动发送ID为空')
            }
            if (!wd) {
                console.log('提交作品：提交的作品描述为空')
            }
            if (!fi) {
                console.log('提交作品：folder_id为空')
            }
            if (!wn) {
                console.log('提交作品：作品名称为空')
            }
            if (!um) {
                console.log('提交作品：上传模式未设置')
            }
            if (!ri) {
                console.log('提交作品：上传的作品资源ID为空')
            }
            if (!re) {
                console.log('提交作品：文件后缀为空')
            }
        }
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school&start=api&op=addActivityWork&submit_user_id=' + localStorage.userId + '&org_id=' + localStorage.orgId + si + wd + fi + wn + um + ri + re + ws)
    }
});

//我的活动
ngApp.service('__myActivities', function ($http) {
    return function (obj) {
        var g = obj.group ? '&group=' + obj.group : '';
        var pn = obj.pageNo ? '&pageNo=' + obj.pageNo : '';
        if (dev.debug) {
            console.log(obj);
            if (!g) {
                console.log('我的活动：完成状态不能为空')
            }
            if (!pn) {
                console.log('我的活动：页码不能为空')
            }
        }
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school&start=api&op=activityList&org_id=' + localStorage.orgId + '&user_id=' + localStorage.userId + g + pn)
    }

});

//获取评论
ngApp.service('__reviewsList', function ($http) {
    return function (obj) {
        // eg:{topic_obj_id:$scope.activityDetail.activity_id,lastRecTime:'',pageCount:''}
        var toi = obj.topic_obj_id ? '&topic_obj_id=' + obj.topic_obj_id : ''; //实体ID
        var np = obj.lastRecTime ? '&lastRecTime=' + obj.lastRecTime : ''; //下一页参数
        var pc = obj.pageCount ? '&pageCount=' + obj.pageCount : ''; //每页数
        var od = obj.org_id ? '&org_id=' + obj.org_id : '';
        if (dev.debug) {
            console.log(obj);
            if (!toi) {
                console.log('获取评论:实体ID不能为空')
            }
            if (!np) {
                console.log('获取评论:第一次请求或者第二次请求的lastRecTime为空')
            }
            if (!od) {
                console.log('获取评论:ORGID不能为空')
            }
        }
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school_public&start=api&op=getMessageList&user_id=' + localStorage.userId + od + toi + np + pc)
    };
});

//添加评论
ngApp.service('__writeReview', function ($http) {
    return function (obj) {
        // eg:{topic_obj_id:$scope.activityDetail.activity_id,comment_content:$scope.reviewForm.content}
        var toi = obj.topic_obj_id ? '&topic_obj_id=' + obj.topic_obj_id : ''; //实体ID
        var cc = obj.comment_content ? '&comment_content=' + obj.comment_content : '';
        var oo = obj.org_id ? obj.org_id : localStorage.orgId;
        if (dev.debug) {
            console.log(obj);
            if (!toi) {
                console.log('写评论的实体ID:实体ID不能为空')
            }
            if (!cc) {
                console.log('写评论内容:评论内容不能为空')
            }
        }
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school&start=api&op=message&fn=add_comment&org_id=' + oo + '&user_id=' + localStorage.userId + toi + cc)
    }
});

//消息通知
ngApp.service('__noticeList', function ($http) {
    return function (obj) {
        var pc = obj.pageCount ? '&pageCount=' + obj.pageCount : ''; //页面SIZE
        var np = obj.lastRecTime ? '&lastRecTime=' + obj.lastRecTime : ''; //下一页参数
        if (dev.debug) {
            console.log(obj);
            if (!np) {
                console.log('获取评论的lastRecTime:第一次请求或者第二次请求的lastRecTime为空')
            }
        }
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school&start=api&op=message&fn=notice&org_id=' + localStorage.orgId + '&user_id=' + localStorage.userId + np + pc)
    }
});

//点赞列表
ngApp.service('__digList', function ($http) {
    return function (obj) {
        var pc = obj.pageCount ? '&pageCount=' + obj.pageCount : ''; //页面SIZE
        var np = obj.lastRecTime ? '&lastRecTime=' + obj.lastRecTime : ''; //下一页参数
        if (dev.debug) {
            console.log(obj);
            if (!np) {
                console.log('获取点赞列表的lastRecTime:第一次请求或者第二次请求的lastRecTime为空')
            }
        }
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school&start=api&op=message&fn=like&org_id=' + localStorage.orgId + '&user_id=' + localStorage.userId + np + pc)
    }
});

//学习进阶课程
ngApp.service('__learnCourse', function ($http) {
    return function (obj) {
        var rqStr = '';
        Object.getOwnPropertyNames(obj).forEach(function (ele, i, arr) {
            if (obj[arr[i]] != undefined) {
                rqStr += ('&' + ele + '=' + obj[arr[i]]);
            }
        });
        //多加一个ORGID
        // return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school&start=api&op=updateJoinLearn' + rqStr);
        return $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school_public&start=api&op=updateJoinLearn' + rqStr);

    }
});