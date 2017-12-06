/**
 * Created by TANG on 2016/3/31.
 */

ngApp.controller('microCourseDetailCtrl', function ($scope, $timeout, $http, $sce, url, yoyaLoading, tipsMsg, asideMenu, __writeReview, __reviewsList, __courseDetail, __addOrUpdateFeedback) {
    var ctrl = this;
    $scope.courseId = url.search().course_id;
    $scope.newsIndexId = url.search().news_index_id;
    $scope.sendId = url.search().send_id;
    $scope.backUrl = url.search().coursebackurl;
    $scope.orgId = localStorage.orgId;
    $scope.userId = localStorage.userId;
    //ASIDE MENU
    $scope.showAside = function () {
        $scope.asideView = true;
        asideMenu.show(ctrl);
    };
    $scope.hideAside = function () {
        $scope.asideView = false;
    };

    //定义反馈难度字段映射
    $scope.level = [{
        NO: '01',
        TXT: '简单'
    }, {
        NO: '02',
        TXT: '一般'
    }, {
        NO: '03',
        TXT: '困难'
    }];

    //初始化反馈表单提交的内容
    $scope.feedbackForm = {
        dif: '',
        con: ''
    };
    $scope.feedBackUrl = '';


    //获取课程详情
    $scope.getDetail = function () {
        __courseDetail({
                course_id: $scope.courseId,
                send_id: $scope.sendId,
                news_index_id: $scope.newsIndexId
            })
            .then(function (data) {
                if (data.code == '200') {
                    $scope.content = data.data;
                    $scope.getReviews();
                    $scope.resType = $scope.content.course.RES_TYPE;

                    if ($scope.content.feedBack && $scope.content.feedBack.FEEDBACK_DIFFICULTY) {
                        $scope.feedBackId = $scope.content.feedBack.FEEDBACK_ID;
                        $scope.feedbackForm = {
                            dif: $scope.content.feedBack.FEEDBACK_DIFFICULTY,
                            con: ($scope.content.feedBack.FEEDBACK_CONTENT.toString() == 'undefined' || '') ? '' : $scope.content.feedBack.FEEDBACK_CONTENT.substr(0, 140)
                        };
                        //console.log($scope.feedbackForm.con);
                        switch ($scope.content.feedBack.FEEDBACK_DIFFICULTY) {
                            case '01':
                                $scope.diffName = $scope.level[0].TXT;
                                break;
                            case '02':
                                $scope.diffName = $scope.level[1].TXT;
                                break;
                            case '03':
                                $scope.diffName = $scope.level[2].TXT;
                                break;
                        }
                    } else {
                        $scope.feedbackForm = {
                            dif: '',
                            con: ''
                        }
                    }
                }
            })
    };
    $scope.getDetail();

    $scope.viewDetail = function () {
        if (!$scope.content.course.palyUrl) {
            tipsMsg('播放资源失效，请联系课程制作人');
            return false;
        }
        switch ($scope.content.course.RES_TYPE) {
            case 'mp4':
            case 'mp3':
            case 'wmv':
            case 'avi':
                $scope.playUrl = $sce.trustAsResourceUrl($scope.content.course.palyUrl)

                break;
            default:
                if (navigator.userAgent.indexOf('YOYA-XUE.ANDROID') > 0) {
                    NativeJSMethod.openUrl($scope.content.course.palyUrl, $scope.content.course.COURSE_NAME);
                } else {
                    window.location.href = $scope.content.course.palyUrl || $scope.content.course.downloadUrl
                }

                break;
        }
    }

    //返回功能
    $scope.clickBack = function () {
        if ($scope.backUrl) {
            window.location.href = decodeURIComponent($scope.backUrl)
        } else {
            if (history.length <= 1) {
                window.location.href = './dynamics.html';
            } else {
                history.back();
            }
        }
    };



    //修改反馈
    $scope.modifyFeedBack = function () {
        $scope.editFeedback = true;
    };
    //填写反馈时置顶输入框
    $scope.topFeedback = function () {
        document.querySelector('.feedback-content-wrap').scrollIntoView(true);
    };
    //字符检查
    $scope.checkCharsets = function () {

        if ($scope.feedbackForm.con.toString().length >= 139) {
            $scope.feedbackForm.con = $scope.feedbackForm.con.toString().substr(0, 140);
        }
    };

    //选择难度
    $scope.chooseDiff = function (num) {
        $scope.currDiff = num + 1;
        $scope.feedbackForm.dif = $scope.level[num].NO;
    };
    $scope.closeFeedBack = function () {
        $scope.editFeedback = false;
    };


    //提交反馈
    $scope.canSubmit = 0;
    $scope.submitFeedback = function () {

        //开始提交
        $scope.canSubmit++;
        if ($scope.canSubmit <= 1) {
            if ($scope.feedbackForm.dif) {
                __addOrUpdateFeedback({
                        send_id: $scope.sendId,
                        news_index_id: $scope.newsIndexId,
                        feedback_id: $scope.feedBackId,
                        feedback_level: $scope.feedbackForm.dif,
                        feedback_content: $scope.feedbackForm.con
                    })
                    .then(function (data) {
                        if (data.code == '200') {
                            $scope.editFeedback = false;
                            if ($scope.feedBackId) {
                                $scope.canSubmit = 0;
                                location.reload(true);
                            } else {
                                window.location.href = location.href.toString() + '&feedback_id=' + data.data.FEEDBACK_ID;
                            }
                        } else {
                            $scope.canSubmit = 0;
                        }
                    })
            } else {
                $scope.canSubmit = 0;
                tipsMsg('学习难度必须选择')
            }
        }
    };


    //定义并初始化TABS
    $scope.tabs = {
        feedback: true,
        review: false
    };

    //查看或者提交作品
    $scope.viewSubmitFeedback = function () {
        $scope.tabs.feedback = true;
        $scope.tabs.review = !$scope.tabs.feedback;
    };
    $scope.viewWriteReview = function () {
        $scope.tabs.review = true;
        $scope.tabs.feedback = !$scope.tabs.review;
    };

    //初始化评论表单
    $scope.reviewForm = {
        content: ''
    };


    $scope.disAdd = 0;
    $scope.addReview = function () {
        $scope.disAdd++;
        if ($scope.disAdd > 1) {
            return false;
        }
        console.log($scope.reviewForm.content);
        if (!$scope.reviewForm.content) {
            tips.show(ctrl, {
                des: '评论内容不能为空!'
            });
            $scope.disAdd = 0;
            return false;
        }
        yoyaLoading.on('发送评论中...');
        __writeReview({
                topic_obj_id: $scope.sendId,
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
                topic_obj_id: $scope.sendId,
                lastRecTime: $scope.nextTime
            })
            .then(function (data) {
                if (data.code == '200') {
                    $scope.reviewsCount = parseInt(data.data.totalRows);
                    $scope.reviews = $scope.reviews.concat(data.data.list);
                    $scope.nextTime = data.data.lastRecTime;
                    $scope.hasMoreViews = $scope.reviewsCount > $scope.reviews.length;
                }
            })
    };

    // var initialScale = 100;
    // $scope.zoomIn = function () {
    //     initialScale += 10;
    //     if (initialScale > 200) {
    //         initialScale=200;
    //         return false;
    //     }
    //     scaleAtt(initialScale)
    // }
    // $scope.zoomOut = function () {
    //     initialScale -= 10;
    //     if (initialScale < 100) {
    //         initialScale=100;
    //         return false;
    //     }
    //     scaleAtt(initialScale)
    // }


});