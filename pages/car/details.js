const app = getApp();
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')

Page({
    data:{
    },

    onLoad: function (options){
        console.log('进入车辆详情');
        this.setData({
            id: options.id
        })
    },

    onShow:function(){
        var that = this;
        that.getCarInfo();
    },

    // 获取车辆信息
    getCarInfo:function(){
        var that = this;
        var data = {
            id: that.data.id
        }
        request.request_get('/carManagement/getCarInfo.hn',data, function (res) {
            console.info('回调', res)
            if(res.success){
                var carInfo = res.msg;
                that.setData({carInfo:carInfo});
            }else{
                box.showToast(res.msg)
            }
        })
    },

    // 删除车辆-》禁止入内
    delete:function(){
        var that = this;
        var data = {
            id: that.data.id
        }
        wx.showModal({
            title: '提示',
            content: '是否删除此车辆',
            confirmText:'是',
            cancelText:'否',
            success: function (res) {
                if (res.confirm) {
                    request.request_get('/carManagement/deleteCar.hn', data , function (res) {
                        console.info('回调', res)
                        if(res.success){
                            wx.showModal({
                                title: '成功',
                                content: '删除成功',
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

    // 修改
    modify:function(){
        var that = this;
        var id = that.data.id;
        wx.navigateTo({
            url: '/pages/car/modify?id=' + id,
        })
    },

    // 病毒检测
    virusDetection:function(){
        var that = this;
        var car_num = that.data.carInfo.car_num;
        wx.navigateTo({
            url: '/pages/car/virusDetection?car_num=' + car_num,
        })
    }
})