/**
 * Created by ZLY on 2016/3/31.
 */
ngApp.controller('activitiesCtrl', function ($scope, $timeout, $http, yoyaLoading,asideMenu,todayStr,__myActivities) {
    var ctrl = this;

    $scope.userId = localStorage.userId;
    $scope.orgId = localStorage.orgId;
    $scope.today=todayStr;
    //SEARCH SHOW
    $scope.showSearchBar = false;
    $scope.toggleSearch = function () {
        $scope.showSearchBar = !$scope.showSearchBar;
        if ($scope.searchPage) {
            $scope.searchPage = false;
            $scope.searchList = [];
        }
        $scope.searchList = [];
    };
    $scope.searchPage = false;
    $scope.emptyList = false;

    //ASIDE MENU
    $scope.showAside = function () {
        $scope.asideView=true;
        asideMenu.show(ctrl);
    };
    $scope.hideAside = function () {
        $scope.asideView = false;
    };


    $scope.hasMore = false;
    $scope.coms = [];
    $scope.pageNo = 1;
    $scope.isfile = function (activity) {
        var types = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf'];
        var i = types.length;
        while (i--) {
            if (types[i] == activity.res_type) {
                return true;
            }
        }
        return false;
    };
    $scope.isImg = function (activity) {
        var imgtypes = ['jpg', 'jpeg', 'bmp', 'gif', 'png'];
        var i = imgtypes.length;
        while (i--) {
            if (imgtypes[i] == activity.res_type) {
                return true;
            }
        }
        return false;
    };
    $scope.isMovie = function (activity) {
        var movietypes = ['mp4', 'movie'];
        var i = movietypes.length;
        while (i--) {
            if (movietypes[i] == activity.res_type) {
                return true;
            }
        }
        return false;
    };
    $scope.getStatus = function (code) {
        switch (code) {
            case '01':
                return 'pending';
                break;
            case '02':
                return 'submitted';
                break;
            case '03':
                return 'ended';
                break;
            default:
                return;
        }
    };
    $scope.currStatus = '01';
    $scope.getComs = function (status) {
        if ($scope.currStatus != status) {
            $scope.currStatus = status;
            $scope.pageNo = 1;
            $scope.coms = [];
            $scope.emptyList = false;
        }
        __myActivities({group:status,pageNo:$scope.pageNo})
            .then(function (data) {
                if (data.code == '200') {
                    $scope.coms = $scope.coms.concat(data.data.activityList);
                    console.log($scope.coms);
                    $scope.emptyList = !$scope.coms.length;
                    $scope.hasMore = $scope.coms.length < data.data.total;
                    $scope.pageNo++;
                }
            })
    };
    $scope.getComs('01');
    $scope.getDetail = function (obj) {
        window.location.href = './activity-detail.html?activityid=' + obj.activity_id + "&sendid=" + obj.send_id + '&reedit=true&courseBackUrl=' + encodeURIComponent(location.href.toString());
    };


});