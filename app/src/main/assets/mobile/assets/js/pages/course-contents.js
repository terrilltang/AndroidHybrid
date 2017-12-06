/**
 * Created by ZLY on 2016/3/31.
 */
ngApp.controller('contentsCtrl', function ($scope, $timeout,url, $http,yoyaLoading,__courseAlbum) {
    var ctrl = this;
    $scope.back=function (){
        window.location.href='./courses.html'
    };
    $scope.userId=localStorage.userId;
    $scope.orgId=localStorage.orgId;
    var course_album_id = url.search().course_album_id;
    $scope.hasMore = false;
    $scope.contents = [];
    $scope.pageNo =0;
    $scope.isfile=function(content){
        var types=['doc','docx','xls','xlsx','ppt','pptx','pdf'];
        var i = types.length;
        while (i--) {
            if (types[i] == content.RES_TYPE) {
                return true;
            }
        }
        return false;
    };
    $scope.isImg=function(content){
        var imgtypes = ['jpg', 'jpeg', 'bmp', 'gif', 'png'];
        var i = imgtypes.length;
        while (i--) {
            if (imgtypes[i] == content.RES_TYPE) {
                return true;
            }
        }
        return false;
    };
    $scope.isMovie=function(content){
        var movietypes = ['mp4', 'movie'];
        var i = movietypes.length;
        while (i--) {
            if (movietypes[i] == content.RES_TYPE) {
                return true;
            }
        }
        return false;
    };
    $scope.getDetail=function(obj){
        if(obj.FEEDBACK_ID){
            $scope.feedbackUrl="&FEEDBACK_ID="+obj.FEEDBACK_ID;
        }else{
            $scope.feedbackUrl='';
        }
        window.location.href = './micro-course-detail.html?course_id=' + obj.COURSE_ID+$scope.feedbackUrl+"&send_id="+obj.SEND_ID+'&courseBackUrl='+encodeURIComponent(location.href.toString()+'&pageNo='+$scope.pageNo);
    };
    $scope.getContents = function () {
        yoyaLoading.on();
        if ($scope.lastRecDatetime) {
            $scope.hasPage = '&lastRecDatetime=' + $scope.lastRecDatetime;
        } else {
            $scope.hasPage = '';
        }
        __courseAlbum({course_album_id:course_album_id,lastRecDatetime:$scope.lastRecDatetime,pageNo:$scope.pageNo})
            .then(function (data) {
                yoyaLoading.close();
                if (data.code == '200') {
                   $scope.contents = $scope.contents.concat(data.data.list);
                    if ($scope.contents.length < data.data.length) {
                        $scope.lastRecDatetime = data.data.lastRecDatetime;
                        !$scope.lastRecDatetime?$scope.hasMore=false:$scope.hasMore = true;
                    } else {
                        $scope.hasMore = false;
                    }
                    if ($scope.contents.length == 0) {
                         $scope.emptyList=true;
                    }
                    $scope.pageNo++;
                    console.log(data); 
                }

            })
    };
    $scope.getContents();
});