/* 
*  获取报警图片js
*  author cuiyf
*  date 2020-11-03
*/
const request = require('../utils/request.js')
const box = require('../utils/box.js')


//打开图片
function openImage(showImagesData, alarmId, that){
    console.log("初始图片数据：" + showImagesData);
    console.log("报警id：" + alarmId);
    if(showImagesData == ''){
        // 数据库无图片记录，获取图片
        showLoadingModal(that);
        getImageData(alarmId,that);
    }else{
        // 数据库有图片，直接展示
        showImages(showImagesData, that);
    }
}

// 打开图片，肯定存在照片
function showImage(showImagesData, that){
    console.log("初始图片数据：" + showImagesData);
    showImages(showImagesData, that);
}

// 初始化等待框
function initLoadingModal(that){
    that.setData({
        LoadingModal:false,
        LoadingModalMsg:'加载中...'
    })
}
// 等待框展示
function showLoadingModal(that){
    that.setData({
        LoadingModal:true
    })
}
// 隐藏等待框
function hideLoadingModal(that){
    that.setData({
        LoadingModal: false
    })
}
// 等待框状态
function getLoadingStatus(that){
    var LoadingModal = that.data.LoadingModal;
    return LoadingModal
}
// 图片展示
function showImages(showImagesData,that){
    showImagesData = showImagesData.split(",");
    var imageList = []
    for(var i in showImagesData){
        var temp = {'id':i, 'url': showImagesData[i]}
        imageList.push(temp)
    }
    console.log("界面展示的图片数据");
    console.log(imageList);
    
    // 轮播图数据处理
    towerSwiper(imageList,that);
}
// 初始化towerSwiper
function towerSwiper(imageList,that) {
    that.setData({swiperRestart:false})
    for (let i = 0; i < imageList.length; i++) {
        imageList[i].zIndex = parseInt(imageList.length / 2) + 1 - Math.abs(i - parseInt(imageList.length / 2))
        imageList[i].mLeft = i - parseInt(imageList.length / 2)
    }
    that.setData({
        swiperList: imageList,
        modalName:'Image', // 初始化成功弹出图片展示的弹框
        swiperRestart:true
    })
}
// 获取图片数据
function getImageData(alarmId,that){
    var data = {
        alarmId: alarmId,
    }
    request.request_get('/pigProjectApplet/sendGetImageCmd.hn', data, function (res) {
        console.info('回调', res)
        if (res) {
            if (res.success) {
                var startGetImageTime = new Date().valueOf(); // 开始获取图片的时间
                checkImageIfGetSuccess(startGetImageTime,alarmId,that);
            } else {
                hideLoadingModal(that);
                box.showToast(res.msg);
            }
        }
    })
}
// 检测图片是否获取成功，默认每2秒检测一次，总共检查十秒
function checkImageIfGetSuccess(startGetImageTime,alarmId,that){
    // 取消获取图片
    if(!getLoadingStatus(that)){
        console.log("用户取消获取图片操作")
        return;
    }
    var data = {
        alarmId: alarmId
    } 
    request.request_get('/pigProjectApplet/getImageByAlarmId.hn', data, function (res) {
        console.info('回调', res)
        if (res) {
            if (res.success) {
                var image = res.msg;
                if(image == ''){
                    console.log("继续检测图片是否获取成功");
                    var currentTime = new Date().valueOf();
                    var checkTime = currentTime - startGetImageTime;
                    if(checkTime <= 10000){
                        setTimeout(function() {
                            checkImageIfGetSuccess(startGetImageTime,alarmId,that)
                        }, 2000); // 每两秒检查一次
                    }else{ // 检查时间超过十秒
                        console.log("检查时间内未获取到图片信息");
                        hideLoadingModal(that);
                        wx.showModal({
                            title: '',
                            content: '暂无图片，请稍后再试',
                            showCancel: false,
                            confirmText:'确定',
                            success: function (res) {
                                if (res.confirm) {
                                    // nodo
                                }
                            }
                        })
                    }
                }else{
                    // 图片获取成功
                    hideLoadingModal(that);
                    showImages(image,that);
                }
            } else {
                hideLoadingModal(that);
                box.showToast(res.msg);
            }
        }
    })
}

module.exports = {
    openImage: openImage,
    initLoadingModal:initLoadingModal,
    showImage:showImage
}