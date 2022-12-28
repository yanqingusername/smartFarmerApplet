const app = getApp();
const request = require('../../utils/request.js')
const face = require('../../utils/face.js')
const box = require('../../utils/box.js')

Page({
    data:{
        visitEnd: false,
    },

    onLoad: function (options){
        console.log('进入人员详情');
        this.setData({
            id: options.id,
            type:options.type,
        })
    },

    onShow:function(){
        var that = this;
        that.getPersonalInfo();
    },

    // 获取人员信息
    getPersonalInfo:function(){
        var that = this;
        var data = {
            id: that.data.id,
            type: that.data.type
        }
        request.request_get('/personnelManagement/getPersonalInfo.hn',data, function (res) {
            console.info('回调', res)
            if(res.success){
                var personnelInfo = res.msg;
                if(that.data.type == '1'){
                    that.visitingState(personnelInfo.leaving_time);
                }
                that.setData({personnelInfo:personnelInfo});
            }else{
                box.showToast(res.msg)
            }
        })
    },

    //预览图片，放大预览
    preview:function(e) {
        var currentUrl = e.currentTarget.dataset.url
        if(currentUrl == ""){
            box.showToast("暂无头像");
            return;
        }
        wx.previewImage({
            current: currentUrl, // 当前显示图片的http链接
            urls: [currentUrl] // 需要预览的图片http链接列表
        })
    },

    // 离职
    departure:function(){
        var that = this;
        var data = {
            id: that.data.id
        }
        wx.showModal({
            title: '提示',
            content: '此员工是否离职',
            confirmText:'是',
            cancelText:'否',
            success: function (res) {
                if (res.confirm) {
                    request.request_get('/personnelManagement/departure.hn', data , function (res) {
                        console.info('回调', res)
                        if(res.success){
                            wx.showModal({
                                title: '成功',
                                content: '离职成功',
                                showCancel: false,
                                success: function (res) {
                                    if (res.confirm) {
                                        wx.navigateBack({})
                                    }
                                }
                            })
                        }else{
                            box.showToast(res.msg)
                        }
                    })
                }
            }
        })
    },

    // 更新正面照
    ChooseImage:function(){
        var that = this;
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                var src = res.tempFilePaths[0];
                var data = {id: that.data.id, type: that.data.type};
                box.showLoading('更新正面照中');
                face.face_judgment(src, that.faceResult, data);
            }
        })
    },

    faceResult:function(result, need_data){
        var that = this;
        console.log("face++ 返回结果" + result);
        if(result.success){
            var src = result.msg;
            request.upload_file('/personnelManagement/updateAvatar.hn', src, 'headImg', need_data, function (res) {
                console.info('回调', res)
                box.hideLoading();
                if(res.success){
                    wx.showModal({
                        title: '成功',
                        content: '更新成功',
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                that.onShow();
                            }
                        }
                    })
                }else{
                    box.showToast(res.msg)
                }
            })
        }else{
            box.showToast(result.msg);
            box.hideLoading();
        }
    },

    // 查看是否结束访问
    visitingState:function(time){
        var that = this;
        var endTime = new Date(Date.parse(time));
        var curTime = new Date();
        var visitEnd = false;
        if(curTime > endTime){
            visitEnd = true;
        }
        that.setData({visitEnd:visitEnd})
    },
    
    // 修改
    modify:function(){
        var that = this;
        var id = that.data.id;
        var type = that.data.type;
        wx.navigateTo({
            url: '/pages/personal/modify?id=' + id + '&type=' + type,
        })
    },

    // 隔离申请
    isolation:function(){
        var that = this;
        var id = that.data.id;
        wx.navigateTo({
            url: '/pages/personal/isolation?id=' + id,
        })
    },

    // 继续来访
    continueVisit:function(){
        var that = this;
        var id = that.data.id;
        wx.navigateTo({
            url: '/pages/personal/continueVisit?id=' + id,
        })
    },
})