/**
 * Created by ZLY on 2016/3/31.
 */
ngApp.controller('coursesCtrl', function ($scope, $timeout, $http, yoyaLoading,tipsMsg,asideMenu,__myCourses,__myStepCourses) {
    var ctrl = this;
 
    $scope.userId = localStorage.userId;
    $scope.orgId = localStorage.orgId;
    //SEARCH SHOW
    $scope.showSearchBar = false;
    $scope.toggleSearch = function () {
        $scope.showSearchBar = !$scope.showSearchBar;
    };

    //ASIDE MENU
    $scope.showAside = function () {
        $scope.asideView=true;
        asideMenu.show(ctrl);
    };
    $scope.hideAside = function () {
        $scope.asideView = false;
    };

    $scope.tabs={
        micro:true,
        step:false
    };

    $scope.hasMore = false;
    $scope.courses = [];
    $scope.pageNo = 1;

    $scope.getCourses = function () {
        $scope.noResult = "";
        __myCourses({pageNo:$scope.pageNo})
            .then(function (data) {
                if (data.code == '200') {
                    $scope.courses = $scope.courses.concat(data.data.list);
                    $scope.hasMore=$scope.courses.length<data.data.total;
                    $scope.emptyList=!$scope.courses.length;
                    $scope.pageNo++;
                }
            })
    };

    $scope.hasMoreSteps=false;
    $scope.stepCourses=[];
    $scope.stepPageNo=1;
    $scope.stepCurrTime='';
    $scope.getStepCourses=function(){
        __myStepCourses({
            pageNo:$scope.stepPageNo,
            currTime:$scope.stepCurrTime
        })
            .then(function(data){
                if(data.code=='200'){
                    $scope.stepCourses=$scope.stepCourses.concat(data.data.reList);
                    $scope.hasMoreSteps=$scope.stepCourses.length<data.data.total;
                    $scope.emptyStepList=!$scope.stepCourses.length;
                    $scope.stepPageNo++;
                    $scope.stepCurrTime=data.currTime;
                }

            })
    };


    $scope.getMicro=function(){
        if(sessionStorage.courseCurrTab!='micro'){
            $scope.tabs.micro=true;
            $scope.tabs.step=false;
            sessionStorage.courseCurrTab='micro';
            $scope.hasMore = false;
            $scope.courses = [];
            $scope.pageNo = 1;
            $scope.getCourses();
        }
    };
    $scope.getSteps=function(){
        if(sessionStorage.courseCurrTab!='step'){
            $scope.tabs.micro=false;
            $scope.tabs.step=true;
            sessionStorage.courseCurrTab='step';
            $scope.hasMoreSteps=false;
            $scope.stepCourses=[];
            $scope.stepPageNo=1;
            $scope.stepCurrTime='';
            $scope.getStepCourses();
        }
    };

    $scope.getContents = function (obj) {
        window.location.href = './course-contents.html?course_album_id=' + obj.course_album_id;
    };
    $scope.getCourseDetail=function(obj){
        window.location.href='./course-detail.html?course_id='+obj.course_id+'&org_id='+localStorage.orgId;
    };

    sessionStorage.courseCurrTab='';
    $scope.getCourses();



});