/**
 * Created by TANG on 2016/3/31.
 */


ngApp.controller('courseDetailCtrl', function ($scope, $timeout, dialogs, $http, $sce, url, yoyaLoading, tipsMsg, __learnCourse, __writeReview, __reviewsList) {
    var ctrl = this;
    $scope.courseId = url.search().course_id;
    $scope.sendId = url.search().send_id;
    $scope.backUrl = url.search().coursebackurl;
    $scope.orgId = url.search().org_id;
    $scope.userId = localStorage.userId || "";
    $scope.newOpenPlay = false;


    //获取课程详情

    $scope.showFooterLearn = function () {
        $scope.unlearn = !$scope.unlearn;
    };
    $scope.unlearn = true;
    $scope.getCourseDetail = function () {
        yoyaLoading.on('获取课程详情...');
        $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school_public&start=api&op=furtherCourseInfo&org_id=' + $scope.orgId + '&course_id=' + $scope.courseId + '&user_id=' + $scope.userId + "&back_as_tree=0")
            .then(function (data) {
                yoyaLoading.close();
                $scope.courseDetail = data;
                $scope.courseDes = $scope.courseDetail.data.courseDesc;
                $scope.courseDir = $scope.delHideData(data.data.courseMenus);
                $scope.courseDir = $scope.build2Tree($scope.courseDir);
                $scope.learnResId = $scope.courseDes.course_res_id;
                $scope.isCompleted = $scope.courseDes.complete_study != 1;
                $scope.unlearn = $scope.courseDes.is_finished != '2';
                $scope.is_finished = $scope.courseDes.is_finished == '2';
                $scope.res_count = $scope.courseDes.res_count;
                $scope.learnTxt = $scope.courseDes.res_name ? ($scope.opCode != 'join' ? '继续学习:' + $scope.courseDes.res_name : "开始学习") : '加入学习';
                //没有课程资源直接显示已学完
                if ($scope.courseDes && ($scope.courseDes.res_count == "0" || $scope.courseDes.is_finished == "2")) {
                    $scope.unlearn = false;
                    $scope.is_finished = true;
                    $scope.learnTxt = "我已经学完";
                }
            });
    };
    $scope.getCourseDetail();


    $scope.delHideData = function (data) {
        $scope.course_menu_arr = [];
        if (data.length > 0) {
            var list = data;
            for (var i in list) {
                $scope.course_menu_arr[list[i].course_cat_id] = {
                    'course_cat_id': list[i].course_cat_id,
                    'p_course_cat_id': list[i].p_course_cat_id,
                    'cat_status': list[i].cat_status,
                    'is_parent_show': "1"
                }
            }
            for (var i in list) {
                var t_cat = $scope.course_menu_arr[list[i].course_cat_id];
                if (t_cat.p_course_cat_id) {
                    if (!$scope.course_menu_arr[t_cat.p_course_cat_id]['courseChildMenuList']) {
                        $scope.course_menu_arr[t_cat.p_course_cat_id]['courseChildMenuList'] = []
                    }
                    $scope.course_menu_arr[t_cat.p_course_cat_id]['courseChildMenuList'].push(t_cat);
                }
            }
            for (var i in $scope.course_menu_arr) {
                if ($scope.course_menu_arr[i]['courseChildMenuList']) {
                    $scope.updateChildCatStatus($scope.course_menu_arr[i]['courseChildMenuList']);
                }
            }
            var reList = [];
            for (var i in list) {
                if ($scope.course_menu_arr[list[i].course_cat_id].is_parent_show != 2 && $scope.course_menu_arr[list[i].course_cat_id].cat_status != 2) {
                    reList.push(list[i]);
                }
            }
            return reList;
        }
    };

    $scope.updateChildCatStatus = function (nodes) {
        if (nodes) {
            for (var i in nodes) {
                var t_cat = $scope.course_menu_arr[nodes[i].course_cat_id];
                t_cat.is_parent_show = $scope.course_menu_arr[t_cat.p_course_cat_id].cat_status;
                /*判断父级节点的父级节点是否展示*/
                if ($scope.course_menu_arr[t_cat.p_course_cat_id].is_parent_show == 2) {
                    t_cat.is_parent_show = 2;
                }
                if (nodes[i].courseChildMenuList) {
                    $scope.updateChildCatStatus(nodes[i].courseChildMenuList);
                }
            }
        }
    };

    $scope.build2Tree = function (data) {
        var list = [];
        for (var i in data) {
            $scope.course_menu_arr[data[i].course_cat_id] = {
                'course_cat_id': data[i].course_cat_id,
                'p_course_cat_id': data[i].p_course_cat_id,
                'cat_status': data[i].cat_status,
                'course_cat_level': data[i].course_cat_level,
                'course_cat_name': data[i].course_cat_name,
                'courseResList': data[i].courseResList,
                'is_parent_show': "1"
            };
        }
        for (var i in data) {
            var t_cat = $scope.course_menu_arr[data[i].course_cat_id];
            if (t_cat.p_course_cat_id) {
                if (!$scope.course_menu_arr[t_cat.p_course_cat_id]['courseChildMenuList']) {
                    $scope.course_menu_arr[t_cat.p_course_cat_id]['courseChildMenuList'] = []
                }
                $scope.course_menu_arr[t_cat.p_course_cat_id]['courseChildMenuList'].push(t_cat);
            } else {
                list.push(t_cat);
            }
        }
        return list;
    };

    //学习
   
    $scope.playObj = {
        url: '',
        id: '',
        type: '',
        name: '',
        permission: true
    }

    //学习
    $scope.clickCount = 0;
    $scope.startLearn = function () {
        $scope.clickCount++;
        if ($scope.clickCount > 1) {
            return false
        } else {
            if (!$scope.userId) {
                tipsMsg('你还没有登录，无法开始学习', function () {
                    $scope.clickCount = 0;
                    window.location.href = './login.html?loginBackUrl=' + encodeURIComponent(location.href.toString())
                })
            } else {
                if ($scope.learnTxt == '我已经学完') {
                    $scope.clickCount = 0;
                    if ($scope.playObj.id != null && $scope.playObj.id != "") {
                        if (!$scope.playObj.fin) {
                            dialogs.show(ctrl, {
                                des: '您确认要标记学完当前章节?',
                                btn2: {
                                    txt: '标记',
                                    fun: function () {
                                        __learnCourse({
                                            manage_code: 2,
                                            course_id: $scope.courseId,
                                            course_res_id: $scope.playObj.id,
                                            org_id: $scope.orgId,
                                            user_id: localStorage.userId
                                        }).then(function (data) {
                                            if (data.code == '200') {
                                                dialogs.close();
                                                tipsMsg('恭喜你已完成此章节学习', function () {
                                                    sessionStorage.tabsMenu = 1;
                                                    window.location.reload(true);
                                                })
                                            } else {
                                                dialogs.close();
                                            }
                                        });

                                    }
                                }
                            });
                        } else {
                            tipsMsg('您已标记过了')
                        }
                    }
                } else { //继续学习
                    $scope.viewMenus();
                    $scope.clickCount = 0;
                    var __playObj = {};
                    if ($scope.playObj.url) {
                        __playObj = $scope.playObj;
                    } else if ($scope.courseDes.res_name) {
                        $scope.playObj = {
                            id: $scope.courseDes.course_res_id,
                            url: __playObj.play_url ? __playObj.play_url : $scope.courseDes.play_url,
                            fin: $scope.courseDes.isStudied && $scope.courseDes.isStudied != '0',
                            shareId: $scope.courseDes.share_id,
                            name: $scope.courseDes.res_name,
                            type: $scope.courseDes.res_type,
                            permission: true
                        }
                        __playObj = $scope.playObj;
                        if ($scope.playObj.type == 'movie') {
                            if (__playObj.url) {
                                if (__playObj.shareId) {
                                    $scope.playObj.url = $scope.courseDes.hddyUrl + "bs-" + __playObj.shareId + ".html"
                                } else {
                                    var callbackUrl = $scope.courseDes.callbackUrl;
                                    $scope.playObj.url = __playObj.url + "?callbackUrl=" + callbackUrl;
                                }
                            } else {
                                $scope.playObj.url = $scope.courseDes.hddyUrl + "bs-" + $scope.courseDes.share_id + ".html"
                            }
                        }
                        if (!$scope.playObj.url) {
                            tipsMsg('该课程正在转码中，请等会儿再试！')
                            return false
                        }
                        $scope.isCompleted = $scope.courseDes.is_finished != '0' || $scope.courseDes.complete_study != '1';
                        $scope.learnTxt = '我已经学完';
                    } else {
                        $scope.joinLearn();
                    }
                }
            }
        }

    };

    $scope.joinLearn = function () { //加入学习

        /*
         * 1，判断有无登录
         * 2，判断是否在此机构
         * 3，同时满足以上两个条件才可以加入学习
         */
        if (!$scope.userId) {
            tipsMsg('你还没有登录，不能加入学习', function () {
                window.location.href = './login.html?loginBackUrl=' + encodeURIComponent(location.href.toString())
            })
            return false;
        } else {
            __learnCourse({
                manage_code: 0,
                org_id: $scope.orgId,
                user_id: localStorage.userId,
                course_id: $scope.courseId
            }).then(function (data) {
                if (data.code == '200') {
                    tipsMsg('加入学习成功', function () {
                        //重新加载课程信息
                        $scope.getCourseDetail();
                        $scope.opCode = "join";
                    })

                }
            })
        }
    }

    $scope.updateLearn = function (obj, dir) {
        // console.log(obj);
        // console.log(dir);
        if (!$scope.courseDes.play_permission || $scope.courseDes.play_permission == '1' || $scope.courseDes.play_permission == '2') { //需要登录才有权限播放
            if (!obj.play_url) {
                tipsMsg('该课程正在转码中，请等会儿再试！')
            } else {
                if (!$scope.userId) {
                    tipsMsg('此课程需要登录才能查看，请登录!', function () {
                        window.location.href = './login.html?loginBackUrl=' + encodeURIComponent(location.href.toString())
                    })
                } else {
                    __learnCourse({
                        manage_code: 1,
                        course_res_id: obj.course_res_id,
                        user_id: localStorage.userId,
                        org_id: $scope.orgId,
                        course_id: $scope.courseId,
                        course_cat_name: dir.course_cat_name,
                        course_cat_level: dir.course_cat_level
                    }).then(function (data) {
                        if (data.code = '200') {
                            $scope.learnTxt = '我已经学完';
                            $scope.playObj = {
                                id: obj.course_res_id,
                                name: obj.res_name,
                                fin: obj.isStudied && obj.isStudied != '0',
                                shareId: obj.share_id,
                                url: obj.play_url,
                                type: obj.res_type,
                                permission: true
                            }
                            if (obj.res_type == 'movie') {
                                if (obj.share_id) {
                                    $scope.playObj.url = $scope.courseDes.hddyUrl + "bs-" + obj.share_id + ".html"
                                } else {
                                    var callbackUrl = $scope.courseDes.callbackUrl;
                                    $scope.playObj.url = obj.play_url + "?callbackUrl=" + callbackUrl;
                                }

                            }
                            $scope.$watch('playObj', function (newVal,oldVal) {
                                console.log(oldVal);
                                console.log(newVal);
                                viewVideo($scope.playObj)
                            })
                        }
                    });
                }
            }
        }

        if ($scope.courseDes.play_permission == '3') { //需要登录且在此机构才有权限播放
            if (!obj.play_url) {
                tipsMsg('该课程正在转码中，请等会儿再试！')
            } else {
                if (!$scope.userId) {
                    tipsMsg('此课程需要登录才能查看，请登录!', function () {
                        window.location.href = './login.html?loginBackUrl=' + encodeURIComponent(location.href.toString())
                    })
                } else {
                    __learnCourse({
                        manage_code: 1,
                        course_res_id: obj.course_res_id,
                        user_id: localStorage.userId,
                        course_id: $scope.courseId,
                        course_cat_name: dir.course_cat_name,
                        course_cat_level: dir.course_cat_level,
                        org_id: $scope.orgId
                    }).then(function (data) {
                        if (data.code = '200') {
                            if (data.data.member_id) {
                                $scope.learnTxt = '我已经学完';
                                $scope.playObj = {
                                    id: obj.course_res_id,
                                    name: obj.res_name,
                                    fin: obj.isStudied && obj.isStudied != '0',
                                    shareId: obj.share_id,
                                    url: obj.play_url,
                                    type: obj.res_type,
                                    permission: true
                                }
                                $scope.$watch('playObj', function (newVal,oldVal) {
                                    console.log(oldVal);
                                    console.log(newVal);
                                    viewVideo($scope.playObj)
                                })
                                
                            } else {
                                tipsMsg('你不在当前机构，没有权限学习!', function () {
                                    $scope.playObj = {
                                        id: '',
                                        name: obj.res_name,
                                        url: obj.play_url,
                                        type: 'movie',
                                        permission: false
                                    }
                                })
                            }
                        }
                    })
                }
            }
        }
    }



    function viewVideo(videoObj) {
        switch (videoObj.type) {
            case 'mp4':
            case 'mp3':
            case 'wmv':
            case 'avi':
                var videoEle=document.querySelector('#video')
                videoEle.pause()
                angular.element(videoEle).prop('src','')
                angular.element(videoEle).prop('src',videoObj.url)
                break;
            default:
                window.open(videoObj.url,"_blank")
                break;

        }

    }

    $scope.viewDetail = function () {
        if(!$scope.playObj.url && !$scope.playObj.type){
            tipsMsg("请选择你要学习的课程");
            $scope.viewMenus();
            return false;
        }
        if($scope.playObj.type && !$scope.playObj.url){
            tipsMsg("课程资源失效，联系课程制作人")
            return false;
        }
        if (navigator.userAgent.indexOf('YOYA-XUE.ANDROID') > 0) {
            NativeJSMethod.openUrl($scope.playObj.url, $scope.playObj.name);
        } else {
            window.location.href = $scope.playObj.url
        }
    }

    //返回功能
    $scope.clickBack = function () {
        if ($scope.backUrl) {
            window.location.href = decodeURIComponent($scope.backUrl)
        } else {
            history.back();
        }
    };


    //定义并初始化TABS
    $scope.tabs = {
        desc: true,
        menu: false,
        review: false
    };


    $scope.resetTabs = function () {
        sessionStorage.tabsMenu = 0;
        var tl = Object.getOwnPropertyNames($scope.tabs);
        for (var _i = 0; _i < tl.length; _i++) {
            $scope.tabs[tl[_i]] = false;
        }
    };

    $scope.tabs.menu = sessionStorage.tabsMenu == '1';
    $scope.tabs.desc = sessionStorage.tabsMenu != '1';




    //查看或者提交作品
    $scope.viewDesc = function () {
        $scope.resetTabs();
        $scope.tabs.desc = true;
    };

    $scope.viewMenus = function () {
        if ($scope.learnTxt == '加入学习') {
            tipsMsg('请先加入学习');
            return false;
        }
        $scope.resetTabs();
        $scope.tabs.menu = true;
    };

    $scope.viewReviews = function () {
        $scope.resetTabs();
        $scope.tabs.review = true;
    };




    //初始化评论表单
    $scope.reviewForm = {
        content: ''
    };



    //添加评论
    $scope.disAdd = 0;
    $scope.addReview = function () {
        if (!sessionStorage.userId) {
            tipsMsg('此课程需要登录才能评论，请登录!', function () {
                window.location.href = './login.html?loginBackUrl=' + encodeURIComponent(location.href.toString())
            });
            return;
        }
        $scope.disAdd++;
        if ($scope.disAdd > 1) {
            return false;
        }
        if (!$scope.reviewForm.content) {
            tipsMsg('评论内容不能为空!')
            $scope.disAdd = 0;
            return false;
        }
        yoyaLoading.on('发送评论中...');
        __writeReview({
                topic_obj_id: $scope.courseId,
                comment_content: $scope.reviewForm.content
            })
            .then(function (data) {
                yoyaLoading.close();
                if (data.code == '200') {
                    tipsMsg('评论成功!', function () {
                        $scope.reviews = [];
                        $scope.hasMoreReviews = false;
                        $scope.nextTime = '';
                        $scope.reviewForm.content = '';
                        $scope.disAdd = 0;
                        $scope.getReviews();
                    })
                } else {
                    $scope.disAdd = 0;
                }
            })
    };


    //获取评论
    $scope.reviews = [];
    $scope.hasMoreViews = false;
    $scope.getReviews = function () {
        __reviewsList({
                org_id: localStorage.orgId,
                topic_obj_id: $scope.courseId,
                lastRecTime: $scope.nextTime
            })
            .then(function (data) {
                if (data.code == '200') {
                    $scope.reviewsCount = parseInt(data.data.totalRows);
                    $scope.reviews = $scope.reviews.concat(data.data.list);
                    $scope.nextTime = data.lastRecTime;
                    $scope.hasMoreViews = $scope.reviewsCount > $scope.reviews.length;
                }
            })
    };
    $scope.getReviews();




});