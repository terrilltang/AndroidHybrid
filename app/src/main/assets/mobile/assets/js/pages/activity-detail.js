/**
 * Created by TANG on 2016/4/7.
 */

ngApp.controller('activityDetailCtrl', function ($scope, $http, url, $sce, $timeout, tipsMsg, todayStr, yoyaLoading,__reviewsList, __writeReview, __activityDetail, __submitWorks) {

    $scope.reedit = url.search().reedit;
    var ctrl = this;
    if (!url.search().iscallback) {
        sessionStorage.selectedWorks = '';
    }
    //检查跳转URL
    $scope.backUrl = function () {
        if ($scope.viewAttPage) {
            $scope.viewAttPage = false
        } else {
            if (url.search().coursebackurl) {
                window.location.href = decodeURIComponent(url.search().coursebackurl)
            }
            else {
                window.location.href = './activities.html'
            }


        }

    };

    //制作电影按钮出现
    $scope.canDo = window.screen.availWidth >= 1000;
    $scope.goAddMovie = function () {
        $http.jsonp(RD.zykUrl + 'do?action=api/api&start=api&op=CreateMovie&type=5')
            .then(function (data) {
                if (data.code == '200') {
                    window.location.href = data.data.url;
                }
            })
    };

    $scope.today = todayStr;

    //获取相应请求参数
    localStorage.sendId = localStorage.sendId ? localStorage.sendId : url.search().sendid;
    $scope.sendId = url.search().sendid;
    $scope.activityId = localStorage.activityId = url.search().activityid;

    if (!$scope.sendId || !$scope.activityId) {
        tipsMsg('发送ID或者活动ID不正确')
    }

    if (localStorage.sendId != $scope.sendId) {
        sessionStorage.removeItem('selectedWorks');
        sessionStorage.removeItem('work_desc');
        sessionStorage.removeItem('choosePhotos');
        localStorage.sendId = $scope.sendId;
    }
    $scope.works = sessionStorage.selectedWorks ? JSON.parse(sessionStorage.selectedWorks) : [];

    //获取活动详情
    $scope.getDetail = function () {
        __activityDetail({send_id: $scope.sendId, activity_id: $scope.activityId})
            .then(function (data) {
                if (data.code == '200') {
                    $scope.activityDetail = data.data.activityDetail[0];
                    $scope.getReviews();
                }
            });
    };
    $scope.getDetail();


    //定义并初始化TABS
    $scope.tabs = {
        workSubmit: true,
        review: false
    };

    //查看或者提交作品
    $scope.viewSubmitWork = function () {
        $scope.tabs.workSubmit = true;
        $scope.tabs.review = !$scope.tabs.workSubmit;
    };
    $scope.viewWriteReview = function () {
        $scope.tabs.review = true;
        $scope.tabs.workSubmit = !$scope.tabs.review;
    };


    //获取评论
    $scope.reviews = [];
    $scope.hasMoreViews = false;
    $scope.getReviews = function () {
        __reviewsList({
            org_id: localStorage.orgId,
            topic_obj_id: $scope.activityDetail.activity_id,
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


    //添加评论
    $scope.reviewForm = {
        content: ''
    };


    $scope.disAdd = 0;
    $scope.addReview = function () {
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
        __writeReview({topic_obj_id: $scope.activityDetail.activity_id, comment_content: $scope.reviewForm.content})
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


    //INIT WORK FORM VALUE

    $scope.workForm = {
        dir_id: '',
        send_id: '',
        resource_id: '',
        resource_name: '',
        work_desc: ''
    };
    $scope.workForm.work_desc = sessionStorage.work_desc ? sessionStorage.work_desc : '';

    //检查字符和计算字符数
    $scope.checkCharsets = function () {
        if ($scope.workForm.work_desc.toString().length >= 139) {
            $scope.$apply($scope.workForm.work_desc = $scope.workForm.work_desc.toString().substr(0, 140));
        }
    };


    //选择‘我的作品’
    $scope.showChoose = false;
    $scope.photos = [];
    $scope.chooseWork = function () {
        $scope.showChoose = true;
        $timeout(function () {
            $scope.showUploadDialog = true;
            if (!$scope.androidApp) {
                document.querySelector('#add-att').addEventListener('change', function (event) {
                    $scope.works = [];
                    sessionStorage.selectedWorks = "";
                    if($scope.photos.length>=7){
                        $scope.showChoose = false;
                        $scope.$apply(tipsMsg('活动上传图片不得超过7张哦~'));
                        return;
                    }
                    var reg = /image\/(png|jpg|jpeg|gif)/;
                    var files = event.target.files;
                    var imgFile = files[0];
                    if (reg.test(imgFile.type)) {
                        var reader = new FileReader();
                        reader.readAsArrayBuffer(imgFile)
                        reader.onload = function (event) {
                            console.log(imgFile)
                            console.log(event.target.result)
                            $scope.$apply($scope.photos.push({
                                file: event.target.result,
                                fileName: imgFile.name,
                                size: imgFile.size,
                                type: 'file'
                            }))
                            $scope.$apply($scope.showChoose = false);
                        }
                        reader.onerror = function () {
                            $scope.$apply(tipsMsg('您上传的图片出错，请重试！'))
                        }
                    } else {
                        $scope.$apply(tipsMsg('您选择的不是图片哦'));
                    }
                });
            }
        }, 0);

    };
    $scope.androidApp = env.androidApp;
    $scope.andChooseFile = function () {
        if ($scope.androidApp) {
            if($scope.photos.length>=7){
                $scope.showChoose = false;
                $scope.$apply(tipsMsg('活动上传图片不得超过7张哦~'));
                return;
            }
            yoyaOrgJsHandler.onpenFileChoser();
            var androidFile = {};
            window.callWebViewFile = function (obj) {//返回ANDROID文件选择对象
                if (obj) {
                    $scope.works = [];
                    getAndroidFile(obj);
                }
            };
            function getAndroidFile(obj) {
                androidFile = JSON.parse(obj);
                if (androidFile.code == '200') {
                    $scope.hideChoose();
                    $scope.$apply($scope.photos.push({
                        file : androidFile.data.fileNames,
                        fileName: androidFile.orgFileNames,
                        size: androidFile.sizes,
                        type: 'file'
                    }))
                } else {
                    tipsMsg('上传失败，请选择图片格式较小文件重试')
                }
                return androidFile;
            }
        }

    };
    $scope.removePhotos = function (n) {
        $scope.photos = $scope.photos.slice(n + 1);
    };

    $scope.removeWorks = function (obj) {
        $scope.works = [];
        sessionStorage.removeItem('selectedWorks');
    };


    $scope.hideChoose = function () {
        $scope.showUploadDialog = false;
        $timeout(function () {
            $scope.showChoose = false;
        }, 200)
    };

    $scope.chooseMyWork = function () {
        sessionStorage.work_desc = $scope.workForm.work_desc;
        window.location.href = './myworks.html?backUrl=' + encodeURIComponent(window.location.href.toString())
    };


    $scope.viewAtt = function (url,att) {
        // alert(att)
        if(!url){
            tipsMsg('链接失效，请联系活动发布人员！')
            return false;
        }
        if(navigator.userAgent.indexOf('YOYA-XUE.ANDROID')>0){
            NativeJSMethod.openUrl(url,att);
        }else{
            window.location.href = url
        }
        

    }
    //提交作品描述
    $scope.canComplete = 0;
    $scope.complete = function () {
        $scope.canComplete++;
        $scope.uploadCount = 0;
        $scope.submitWorks = []
        if ($scope.canComplete <= 1) {
            if ($scope.photos) {
                $scope.submitWorks = $scope.submitWorks.concat($scope.photos)
            }
            if ($scope.works) {
                $scope.submitWorks = $scope.submitWorks.concat($scope.works)
            }
            console.log($scope.submitWorks);
            if ($scope.submitWorks.length <= 0 || !$scope.workForm.work_desc) {
                $scope.canComplete = 0;
                tipsMsg('作品描述与作品均不能为空！')
                return false
            } else {
                $scope.submitWorks.forEach(function (ele) {
                    if (ele.type == 'file') {
                        //先上传文件
                        $scope.dir_id = $scope.activityDetail.folder_id;
                        $scope.send_id = $scope.activityDetail.send_id;
                        $scope.work_status = $scope.activityDetail.work_status;
                        $scope.work_desc = $scope.workForm.work_desc;
                        $scope.submitLocalFile = function (fileNames, orgFileNames, sizes) {
                            //is_single=1 单个文件上传
                            $http.jsonp(RD.schoolUrl + 'do?action=api/wap/school_public&start=api_activityCommit&is_single=1' + '&user_id=' + localStorage.userId + '&org_id=' + localStorage.orgId + '&dir_id=' + $scope.dir_id + '&send_id=' + $scope.send_id + '&work_desc=' + $scope.work_desc + '&fileNames=' + fileNames + '&orgFileNames=' + orgFileNames + '&sizes=' + sizes+'&work_status='+ $scope.work_status)
                                .then(function (item) {
                                    yoyaLoading.close()
                                    if (item.code == '200') {
                                        $scope.uploadCount++;
                                        if ($scope.uploadCount == $scope.submitWorks.length) {
                                            tipsMsg('作品提交成功',function () {
                                                    $scope.canComplete = 0;
                                                window.location.href = './activity-detail.html?activityid=' + url.search().activityid + "&sendid=" + url.search().sendid + '&reedit=true&courseBackUrl=' + encodeURIComponent(RD.schoolUrl+"mobile/campaigns.html");
                                                })
                                        }
                                    } else {
                                        $scope.canComplete = 0;
                                    }
                                })
                        }
                        yoyaLoading.on('文件上传中...')
                        if ($scope.androidApp) {
                            $scope.submitLocalFile(ele.file, ele.fileName, ele.size)
                        } else {
                            $http.post(RD.schoolUrl + 'do?action=api/wap/school_public&start=api_commonUploadFile&is_file=0&is_single=1' + '&sizes=' + ele.size + '&orgFileNames=' + ele.fileName, ele.file, {
                                transformRequest: angular.identity,
                                headers: {'Content-Type': 'text/plain;charset=x-user-defined-binary', 'Accept': '*!/!*'}
                            }).then(function (_data) {
                                if (_data.code == '200') {
                                    var _fileNames = _data.data.fileNames;
                                    var _orgFileNames = _data.orgFileNames;
                                    var _sizes = _data.sizes;
                                    $scope.submitLocalFile(_fileNames, _orgFileNames, _sizes)
                                } else {
                                    $scope.canComplete = 0;
                                }
                            })
                        }

                    } else {
                        $scope.workForm.dir_id = $scope.activityDetail.folder_id;
                        $scope.workForm.send_id = $scope.activityDetail.send_id;
                        $scope.workForm.resource_id = ele.id;
                        $scope.workForm.resource_name = ele.name;
                        if ($scope.works.length) {
                            __submitWorks({
                                send_id: $scope.workForm.send_id,
                                folder_id: $scope.workForm.dir_id,
                                uploadMode: 1,
                                resource_ext: 'movie',
                                resource_id: $scope.workForm.resource_id,
                                work_name: $scope.workForm.resource_name,
                                work_desc: $scope.workForm.work_desc,
                                work_status:$scope.activityDetail.work_status
                            })
                                .then(function (data) {
                                    if (data.code == '200') {
                                        $scope.uploadCount++;
                                        if ($scope.uploadCount == $scope.submitWorks.length) {
                                            tipsMsg('作品提交成功',function () {
                                                    $scope.canComplete = 0;
                                                window.location.href = './activity-detail.html?activityid=' + url.search().activityid + "&sendid=" + url.search().sendid + '&reedit=true&courseBackUrl=' + encodeURIComponent(RD.schoolUrl+"mobile/campaigns.html");
                                                })
                                        }
                                    } else {
                                        $scope.canComplete = 0;
                                    }

                                })
                        }
                    }
                });
            }
        }
    }

    $scope.recall = function () {
       window.location.href = './activity-detail.html?activityid=' + url.search().activityid + "&sendid=" + url.search().sendid + '&reedit=false&courseBackUrl=' + encodeURIComponent(RD.schoolUrl+"mobile/campaigns.html");
    }

    /*附件缩放*/

    var initialScale = 100;
    $scope.zoomIn = function () {
        initialScale += 10;
        if (initialScale > 200) {
            initialScale=200;
            return false;
        }
        scaleAtt(initialScale)
    }
    $scope.zoomOut = function () {
        initialScale -= 10;
        if (initialScale < 100) {
            initialScale=100;
            return false;
        }
        scaleAtt(initialScale)
    }

});