var ngAppMessage = angular.module('ngAppMessage', ['ui.router', 'ngApp']);

ngAppMessage.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('');
    $stateProvider
        .state("index", {
            url: "",
            templateUrl: "./view/message/index.html",
            controller:'messagesCtrl'
        })
        .state("like", {
            url: "/like",
            templateUrl: "./view/message/like.html",
            scope: false,
            controller: function ($scope, yoyaLoading, __digList, $timeout) {
                $scope.digs = [];
                $scope.hasMoreDigs = false;
                $scope.emptyDigs = false;
                $scope.getDigs = function (str) {
                    __digList({lastRecTime: $scope.nextDigsTime})
                        .then(function (data) {
                            if (data.code == '200') {
                                $scope.digsCount = parseInt(data.data.totalRows);
                                $scope.emptyDigs = !$scope.digsCount;
                                $scope.digs = $scope.digs.concat(data.data.list);
                                $scope.nextDigsTime = data.data.lastRecTime;
                                $scope.hasMoreDigs = $scope.digsCount > $scope.hasMoreDigs.length;
                            }
                        })

                };
                $scope.getDigs();
            }
        })
        .state("comment", {
            url: "/comment",
            templateUrl: "./view/message/comment.html",
            controller: function ($scope, yoyaLoading, __reviewsList) {
                $scope.reviews = [];
                $scope.hasMoreReviews = false;
                $scope.emptyReviews = false;
                $scope.getReviews = function () {
                    __reviewsList({org_id: localStorage.orgId, lastRecTime: $scope.nextReviewsTime})
                        .then(function (data) {
                            if (data.code == '200') {
                                $scope.reviewsCount = parseInt(data.data.totalRows);
                                $scope.emptyReviews = !$scope.reviewsCount;
                                $scope.reviews = $scope.reviews.concat(data.data.list);
                                $scope.nextReviewsTime = data.data.lastRecTime;
                                $scope.hasMoreReviews = $scope.reviewsCount > $scope.reviews.length;
                            }
                        })
                };
                $scope.getReviews();
            }
        })
        .state("notice", {
            url: "/notice",
            templateUrl: "./view/message/notice.html",
            controller: function ($scope, yoyaLoading, __noticeList) {
                $scope.notices = [];
                $scope.hasMoreNotices = false;
                $scope.emptyNotices = false;
                $scope.getNotices = function () {
                    __noticeList({lastRecTime: $scope.nextNoticeTime})
                        .then(function (data) {
                            if (data.code == '200') {
                                $scope.noticesCount = parseInt(data.data.totalRows);
                                $scope.emptyNotice = !$scope.noticesCount;
                                $scope.notices = $scope.notices.concat(data.data.list);
                                $scope.nextNoticeTime = data.data.lastRecTime;
                                $scope.hasMoreNotices = $scope.noticesCount > $scope.notices.length;
                            }
                        })
                };
                $scope.getNotices();
            }
        });
});

ngAppMessage.controller('messagesCtrl', function ($state,$scope, $timeout, $http, yoyaLoading, asideMenu, __reviewsList, __noticeList, __digList) {
    var ctrl = this;
    //侧边栏
    $scope.showAside = function () {
        $scope.asideView = true;
        asideMenu.show(ctrl);
    };

    $scope.hideAside = function () {
        $scope.asideView = false;
    };

    $scope.viewWork = function (obj) {
        var type = parseInt(obj.topic_type);
        if (type == 1) {
            type = 2;
        }
        if (type == 2) {
            type = 1;
        }
        window.location.href = './works-detail.html?source_type=' + type + '&topic_obj_id=' + obj.topic_obj_id + '&org_id=' + localStorage.orgId + "&course_id=" + obj.topic_obj_id + "&user_id=" + obj.belong_user_id;
    };

    
});