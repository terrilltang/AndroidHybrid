/**
 * Created by ZLY on 2016/3/31.
 */
ngApp.controller('dynamicsCtrl', function ($scope, $timeout, $http, yoyaLoading, tipsMsg, todayStr, asideMenu, __activityList) {


    /* $scope.testNativeMethod=function(){
        if(navigator.userAgent.indexOf('YOYA-XUE.ANDROID')>0){
            alert('YOYA.ANDROID');
            NativeJSMethod.openUrl('http://www.baidu.com','BADU');
        }else{
            alert('BROWSER');
        }

    } */

    var ctrl = this;
    $scope.userId = localStorage.userId;
    $scope.orgId = localStorage.orgId;
    $scope.searchPage = false;
    $scope.emptyList = false;
    $scope.hasMore = false;
    $scope.activities = [];
    $scope.pageNo = 1;
    $scope.spageNo = 1;
    $scope.today = todayStr;

    //SEARCH SHOW
    $scope.showSearchBar = false;
    $scope.toggleSearch = function () {
        $scope.showSearchBar = !$scope.showSearchBar;
        $scope.searchPage = !$scope.searchPage;
        $scope.searchList = [];
    };
    //ASIDE MENU
    $scope.showAside = function () {
        $scope.asideView = true;
        asideMenu.show(ctrl);
        console.log(ctrl)
    };

    $scope.hideAside = function () {
        $scope.asideView = false;
    };
    $scope.refresh = function () {
        $scope.activities = [];
        $scope.lastRecDatetime = '';
        $scope.pageNo = 1;
        $scope.spageNo = 1;
        $scope.hasMore = false;
        $scope.getActivities();
        $scope.emptyList = false;
    };

 
    $scope.getStatus = function (ac) {
        if (ac.news_type == '02' && ac.obj_end_time != '' && ac.obj_end_time.substr(0, 8) < $scope.today && ac.news_status == '01') {
            return "end";
        } else {
            switch (ac.news_status) {
                case '01':
                    return 'pending';
                    break;
                case '02':
                    return 'submitted';
                    break;
                default:
                    return;
            }
        }
    };
    $scope.getActivities = function () {
        yoyaLoading.on();
        __activityList({
                pageNo: $scope.pageNo
            })
            .then(function (data) {
                console.log(data)
                yoyaLoading.close();
                if (data.code == '200') {
                    $scope.activities = $scope.activities.concat(data.data.newsList);
                    $scope.hasMore = $scope.activities.length < data.data.total;
                    if ($scope.activities.length == 0) {
                        $scope.emptyList = true;
                    }
                    $scope.pageNo++;
                }
            })
    };
    $scope.getActivities();

    $scope.getDetail = function (obj) {

        if (obj.news_type == '01') {
            if (obj.feedback_id) {
                $scope.feedbackUrl = "&FEEDBACK_ID=" + obj.feedback_id;
            } else {
                $scope.feedbackUrl = '';
            }
            window.location.href = './micro-course-detail.html?course_id=' + obj.news_obj_id + $scope.feedbackUrl + "&send_id=" + obj.send_id + "&news_index_id=" + obj.news_index_id + '&courseBackUrl=' + encodeURIComponent(location.href.toString());
        }
        if (obj.news_type == '02') {
            window.location.href = './activity-detail.html?activityid=' + obj.news_obj_id + "&sendid=" + obj.send_id + "&news_index_id=" + obj.news_index_id + '&reedit=true&courseBackUrl=' + encodeURIComponent(location.href.toString());
        }
        if (obj.news_type == '03') {
            window.location.href = './course-detail.html?course_id=' + obj.news_obj_id + '&org_id=' + $scope.orgId;
        }
    };

    $scope.search = function (str, newSearch) {
        console.log(str);
        if (!str || str == "") {
            tipsMsg('动态标题不能为空')
        } else {
            yoyaLoading.on();
            if (str != $scope.searchStr || newSearch) {
                $scope.searchList = [];
                $scope.spageNo = 1;
            }
            $scope.searchStr = str;
            $scope.emptySearch = false;
            $scope.sHasMore = false;
            $scope.searchPage = true;

            __activityList({
                    pageNo: $scope.spageNo,
                    news_title: $scope.searchStr
                })
                .then(function (data) {
                    yoyaLoading.close();
                    if (data.code == '200') {
                        $scope.searchList = $scope.searchList.concat(data.data.newsList);
                        $scope.shasMore = $scope.searchList.length < data.data.total;
                        if ($scope.searchList.length == 0) {
                            $scope.emptySearch = true;
                        }
                        $scope.spageNo++;
                    }
                })
        }

    };

});