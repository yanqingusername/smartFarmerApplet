const app = getApp();

Page({
    data:{
        modalName:'RadioModal'  
    },
    onLoad: function (options){
        console.log('进入选择猪场页面');
        var userInfo = JSON.parse(decodeURIComponent(options.userInfo));
        this.setData({
            userInfo:userInfo,
        })
    },

    radioChange:function(e){
        console.log('用户选择的猪场：', e.detail.value)
        // 获取相应的猪场信息
        var farmInfo = this.data.userInfo[e.detail.value];
        console.log(farmInfo)
        // 存储用户信息
        app.globalData.userInfo = farmInfo;
        wx.switchTab({
             url: '/pages/home/index',
        })
    }
})