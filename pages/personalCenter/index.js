const app = getApp();
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')

Page({
	data:{
        customer_phone: '400-168-1375',
        homePersonal: []
    },
    onLoad:function() {
        console.log("进入个人中心")
    },
    onShow:function(){
        var that = this;
        that.getWorderInfo();
    },
    // **********拨打客服电话******
    call_customer:function(){
        wx.makePhoneCall({
            phoneNumber: this.data.customer_phone,
            success: function () {
                console.log("拨打电话成功！")
            },
            fail: function () {
                console.log("拨打电话失败！")
            }
        })
    },
    //***********进入操作指南 */
    enter_instructions:function(){
        console.log('进入操作指南')
        // wx.navigateTo({
        //     url: '/pages/personalCenter/instructions',
        // })

        wx.navigateTo({
            url: '/modulepages/pages/instructionsModule/index',
        })
    },
    // 获取个人中心的信息
    getWorderInfo:function(){
        var that = this;
        var data = {
            id: app.globalData.userInfo.id
        }
        request.request_get('/personnelManagement/getUserInfo.hn', data, function (res) {
            console.info('回调', res)
            if(res){
                var userInfo = res.msg;
                that.setData({ 
                    userInfo: userInfo,
                    homePersonal: res.personal
                })
            }else{
                box.showToast(res.msg);
            }
        })
    },
    // 退出当前账号
    exit:function(){
        wx.showModal({
            title: '',
            content: '是否退出当前账号',
            success: function (res) {
                if (res.confirm) {
                    var data = {
                        openid:app.globalData.openid,
                    }
                    request.request_get('/pigProjectApplet/appLogOut.hn', data, function (res) {
                        console.info('回调', res)
                        if(res){
                            if(res.success){
                                wx.reLaunch({
                                    url: '/pages/main/login',
                                })
                            }else{
                                box.showToast(res.msg);
                            }
                        }
                    })
                }
            }
        })
    },
    //淋浴一体机设备管理
    catchHandler:function(e){
        let pathstring = e.currentTarget.dataset.pathstring;
        let title = e.currentTarget.dataset.title;
        if(pathstring && title){
            wx.navigateTo({
                url: pathstring + "?title=" + title,
            });
        }
    },
});