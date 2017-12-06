ngApp.controller('worksDetailCtrl', function ($http, $scope, $sce, $interval, url, yoyaLoading, tipsMsg, asideMenu, __reviewsList, __writeReview) {
    var ctrl = this;
    $scope.showTitle = env.androidApp || env.iosApp;
    $scope.userId = '';


    $scope.userId = sessionStorage.userId || "";

    $scope.create_user_id = url.search().user_id;
    $scope.orgId = url.search().org_id;
    if ($scope.orgId) {
        localStorage.temporaryOrgId = $scope.orgId;
    } else {
        $scope.orgId = localStorage.temporaryOrgId;
    }


    $scope.source_type = url.search().source_type;
    $scope.topic_obj_id = url.search().topic_obj_id;
    $scope.course_id = url.search().course_id;
    $scope.res_type = url.search().res_type;
    $scope.source_id = '';

    $scope.isHave = false;

   


    $scope.getMovieDetail = function () {
        $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school_public&start=api&op=movieDetail&topic_obj_id=' + $scope.topic_obj_id + '&org_id=' + $scope.orgId + '&res_type=' + $scope.res_type + '&course_id=' + $scope.course_id + '&source_type=' + $scope.source_type + "&user_id=" + $scope.create_user_id)
            .then(function (data) {
                if (data.code == '200') {
                    document.title = data.data.NAME || data.data.COURSE_NAME;
                    $scope.movie = data.data;
                    if (data.data.hddyUrl) {
                        if (env.wx) {
                            var ir = document.createElement('iframe');
                            ir.setAttribute('src', location.href.toString());
                            document.querySelector('body').appendChild(ir);
                            angular.element(ir).on('load', function () {
                                document.querySelector('body').removeChild(ir);
                            });
                        }
                        $scope.playPermission = $scope.movie.PLAY_PERMISSION ? $scope.movie.PLAY_PERMISSION : '1';

                        $scope.source_id = data.data.SOURCE_ID;


                        $scope.playObj = { //声明一个播放对象
                            url: '',
                            type: ''
                        }

                        if ($scope.source_type == '1') { //如果是学生作品
                            $scope.timer = $interval(function () {
                                $scope.countPlay();
                            }, 5000, 1);
                            if ($scope.movie.imgPath) {
                                $scope.playObj = [];
                                for (var i in $scope.movie.imgPath) {
                                    $scope.playObj.push({
                                        url: $sce.trustAsResourceUrl($scope.movie.imgPath[i].playUrl),
                                        type: $scope.movie.imgPath[i].work_type
                                    })
                                }
                            } else {
                                $scope.playObj = {
                                    url: $sce.trustAsResourceUrl($scope.movie.playUrl),
                                    type: $scope.movie.WORK_TYPE
                                }
                            }
                        }

                        if ($scope.source_type == '2') { //如果是互动微课
                            $scope.timer = $interval(function () {
                                $scope.countPlay();
                            }, 5000, 1);
                            $scope.playObj.type = 'movie';
                            if ($scope.playPermission == '1') { //如果都可以播放
                                $scope.playObj.url = $sce.trustAsResourceUrl($scope.movie.hddyUrl + 'bs-' + $scope.movie.SHARE_ID + '.html');
                            }
                            if ($scope.playPermission == '2') { //如果登录都可以播放
                                if ($scope.userId) {
                                    $scope.playObj.url = $sce.trustAsResourceUrl($scope.movie.hddyUrl + 'bs-' + $scope.movie.SHARE_ID + '.html');
                                }
                            }

                            if ($scope.playPermission == '3') { //如果非机构的不可播放
                                if ($scope.userId) {
                                    $scope.playObj.url = $sce.trustAsResourceUrl($scope.movie.hddyUrl + "g-" + $scope.movie.ref_id + ".html?callbackUrl=" + $scope.movie.callbackUrl);
                                }
                            }
                        }
                    } else {
                        $scope.source_id = data.data.COURSE_ID;
                        $scope.login_user_id = data.data.login_user_id;
                        $scope.playPermission = $scope.movie.PLAY_PERMISSION ? $scope.movie.PLAY_PERMISSION : '1';

                        $scope.resType = $scope.movie.RES_TYPE;
                        var filetypes = ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'pdf', 'folder', 'jpg', 'jpeg', 'bmp', 'gif', 'png'];
                        if (filetypes.indexOf($scope.resType) >= 0) {
                            $scope.isFile = true;
                            $scope.downloadUrl = $scope.movie.palyUrl;
                            !$scope.downloadUrl ? $scope.showDefault = true : $scope.showDefault = false;
                        }
                        var imgtypes = ['jpg', 'jpeg', 'bmp', 'gif', 'png'];
                        if (imgtypes.indexOf($scope.resType) >= 0) {
                            $scope.isImg = true;
                        }
                        var movietypes = ['mp4', 'movie', 'mp3', 'wmv', 'avi'];
                        if (movietypes.indexOf($scope.resType) >= 0) {
                            $scope.timer = $interval(function () {
                                $scope.countPlay();
                            }, 5000, 1);
                            $scope.isMovie = true;
                            $scope.movUrl = $sce.trustAsResourceUrl($scope.movie.palyUrl);
                            $scope.iconUrl = $scope.movie.ICON_URl;
                            console.log($scope.iconUrl);
                            if (!$scope.movUrl) {
                                $scope.showDefault = true;
                            }
                        }
                        if (!$scope.isFile && !$scope.isImg && !$scope.isMovie) {
                            $scope.showDefault = true;
                        }

                    }
                 


                    $scope.getCommentList();
                    if ($scope.userId) {
                        $scope.is_have();
                    }
                }
            })
    };

    $scope.startDownload = function () {
        $scope.countPlay();
        $scope.viewAttPage = true;
        $scope.viewAttPageUrl = $sce.trustAsResourceUrl($scope.downloadUrl)
    };
    $scope.closeViewAtt = function () {
        $scope.viewAttPage = false;
    };

    $scope.isInOrg = false;
    $scope.isInTheOrg = function () {
        if (!$scope.userId || !$scope.orgId) {
            return;
        }
        $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school_public&start=api&op=isTheOrgMember&user_id=' + $scope.userId + '&org_id=' + $scope.orgId)
            .then(function (data) {
                if (data.code == '200') {
                    $scope.isInOrg = data.data;
                }
            })
    };

    $scope.countPlay = function () {
        if (!$scope.source_id) {
            return;
        }
        $http.jsonp(RD.schoolUrl + 'do?action=portal/count_play&start=countPlay&obj_id=' + $scope.source_id)
            .then(function (data) {
                if (data.code == '200') {

                }
            })
    };

    $scope.comments = [];
    $scope.hasMorecomments = false;
    $scope.getCommentList = function () {
        __reviewsList({
                org_id: $scope.orgId,
                topic_obj_id: $scope.source_id,
                lastRecTime: $scope.nextTime
            })
            .then(function (data) {
                if (data.code == '200') {
                    $scope.commentCount = parseInt(data.data.totalRows);
                    $scope.comments = $scope.comments.concat(data.data.list);
                    $scope.nextTime = data.data.lastRecTime;
                    $scope.hasMorecomments = $scope.commentCount > $scope.comments.length;
                } else {
                    $scope.hasMorecomments = false;
                }
            })
    };

    $scope.reviewForm = {
        content: sessionStorage.commentContent ? sessionStorage.commentContent : ''
    };
    $scope.disAdd = 0;
    $scope.addComment = function () {
        $scope.disAdd++;
        if ($scope.disAdd > 1) {
            return false;
        }
        if (!$scope.userId || !$scope.orgId) {
            sessionStorage.commentContent = $scope.reviewForm.content;
            $scope.loginOrg();
            $scope.disAdd = 0;
            return false;
        }
        if (!$scope.isInOrg) {
            tipsMsg('您还不是该机构的成员，请先加入该机构再进行评论!')
            return false;
        }
        if (!$scope.reviewForm.content) {
            tipsMsg('评论内容不能为空!')
            $scope.disAdd = 0;
            return false;
        }
        if ($scope.reviewForm.content.length > 140) {
            tipsMsg('字数不能超过140字哦!')
            $scope.disAdd = 0;
            return false;
        }
        yoyaLoading.on('发送评论中...');
        __writeReview({
                topic_obj_id: $scope.source_id,
                comment_content: $scope.reviewForm.content,
                org_id: $scope.orgId
            })
            .then(function (data) {
                yoyaLoading.close();
                if (data.code == '200') {
                    tipsMsg('评论成功!', function () {
                        $scope.comments = [];
                        $scope.hasMorecomments = false;
                        $scope.nextTime = '';
                        $scope.reviewForm.content = '';
                        $scope.disAdd = 0;
                        sessionStorage.removeItem('commentContent');
                        $scope.getCommentList();
                    })
                } else {
                    $scope.disAdd = 0;
                }
            })
    };

    $scope.add_like = function () {
        if (!$scope.userId || !$scope.orgId) {
            $scope.loginOrg();
            return false;
        }
        if (!$scope.isInOrg) {
            tipsMsg('您还不是该机构的成员，请先加入该机构再进行点赞!')
            return false;
        }
        $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school&start=api&op=message&&fn=add_like&topic_obj_id=' + $scope.source_id + '&org_id=' + $scope.orgId + '&user_id=' + $scope.userId)
            .then(function (data) {
                if (data.code == '200') {
                    if ($scope.isHave) {
                        $scope.isHave = false;
                        tipsMsg('已取消点赞')
                    } else {
                        $scope.isHave = true;
                        tipsMsg('点赞成功~')
                    }


                }
            })
    };

    $scope.is_have = function () {

        $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school&start=api&op=message&&fn=is_have&topic_obj_id=' + $scope.source_id + '&org_id=' + $scope.orgId + '&user_id=' + $scope.userId)
            .then(function (data) {
                if (data.code == '200') {
                    $scope.isHave = data.data.isHave;
                }
            });

    };


    $scope.loginOrg = function () {
        tipsMsg('您还未登陆，请登陆后进行评论!', function () {
            window.location.href = './login.html?loginBackUrl=' + encodeURIComponent(location.href.toString() + "&org_id=" + $scope.orgId);
        })
    };

    $scope.getMovieDetail();
    $scope.isInTheOrg();

});