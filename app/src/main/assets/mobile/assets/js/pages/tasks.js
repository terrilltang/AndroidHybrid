/**
 * Created by ZLY on 2016/3/31.
 */
ngApp.controller('tasksCtrl', function ($scope, $timeout, $http, yoyaLoading, tipsMsg, dialogs, asideMenu, __tasks) {
    var ctrl = this;
    $scope.userId = localStorage.userId;
    $scope.orgId = localStorage.orgId;

    $scope.getDetail = function (obj) {
        if (obj.FEEDBACK_ID) {
            $scope.feedbackUrl = "&FEEDBACK_ID=" + obj.FEEDBACK_ID;
        } else {
            $scope.feedbackUrl = '';
        }
        window.location.href = './micro-course-detail.html?course_id=' + obj.COURSE_ID + $scope.feedbackUrl + "&send_id=" + obj.SEND_ID + '&courseBackUrl=' + encodeURIComponent(location.href.toString());
    };

    //ASIDE MENU
    $scope.showAside = function () {
        $scope.asideView = true;
        asideMenu.show(ctrl);
    };
    $scope.hideAside = function () {
        $scope.asideView = false;
    };


    $scope.hasMore = false;
    $scope.tasks = [];
    $scope.pageNo = 1;

    $scope.isfile = function (task) {
        var types = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf'];
        var i = types.length;
        while (i--) {
            if (types[i] == task.RES_TYPE) {
                return true;
            }
        }
        return false;
    };
    $scope.isImg = function (task) {
        var imgtypes = ['jpg', 'jpeg', 'bmp', 'gif', 'png'];
        var i = imgtypes.length;
        while (i--) {
            if (imgtypes[i] == task.RES_TYPE) {
                return true;
            }
        }
        return false;
    };
    $scope.isMovie = function (task) {
        var movietypes = ['mp4', 'movie'];
        var i = movietypes.length;
        while (i--) {
            if (movietypes[i] == task.RES_TYPE) {
                return true;
            }
        }
        return false;
    };
    $scope.getTasks = function () {
        yoyaLoading.on();
        __tasks.get({pageNo: $scope.pageNo, lastRecDatetime: $scope.lastRecDatetime})
            .then(function (data) {
                yoyaLoading.close();
                if (data.code == '200') {
                    $scope.tasks = $scope.tasks.concat(data.data.list);
                    if ($scope.tasks.length < data.data.count) {
                        $scope.lastRecDatetime = data.data.lastRecDatetime;
                        !$scope.lastRecDatetime ? $scope.hasMore = false : $scope.hasMore = true;
                    } else {
                        $scope.hasMore = false;
                    }
                    if ($scope.tasks.length == 0) {
                        $scope.emptyList = true;
                    }
                    $scope.pageNo++;
                }
            })
    };
    $scope.updateLevel=function(n){
      $scope.level=n;
    };
    $scope.delTask = function (id) {
        dialogs.show(ctrl, {
            des: '更改学习难度',
            closeBtn: true,
            btn2: {
                txt: '确认',
                fun: function () {
                    if($scope.level=='01' || $scope.level=='02'){
                        __tasks.resolve({feedback_difficulty: $scope.level, feedback_id: id})
                            .then(function (data) {
                                if (data.code == '200') {
                                    dialogs.close();
                                    tipsMsg('加油，你已经解决一个难点!')
                                    $scope.tasks = [];
                                    $scope.pageNo = 1;
                                    $scope.hasMore = false;
                                    $scope.lastRecDatetime = '';
                                    $scope.getTasks();
                                }
                            })
                    }else{
                        tipsMsg('请选择一个难度级别')
                    }

                }
            }
        })
    };

    $scope.getTasks();
    $scope.showIntro = !localStorage.repeatUser && !$scope.emptyList;
    $scope.hideIntro = function () {
        $scope.showIntro = false;
    }
});