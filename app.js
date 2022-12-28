App({
    onLaunch: function () {
        // ***获取右上角的胶囊**********
        wx.getSystemInfo({
            success: e => {
                this.globalData.StatusBar = e.statusBarHeight;
                let capsule = wx.getMenuButtonBoundingClientRect();
                if (capsule) {
                    this.globalData.Custom = capsule;
                    this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
                } else {
                    this.globalData.CustomBar = e.statusBarHeight + 50;
                }
                this.globalData.ratio = e.windowWidth / 750;
            }
        })
    },
    globalData: {
        //微信信息
        openid: '',
        //设备信息
        systeminfo:'',
        ratio:1, // px和rpx比例
        //用户信息
        userInfo:{},
        //权限信息---仅为描述记录
        permissions_menu:{
            "1":"异常报警-猪只","2":"异常报警-人员","3":"异常报警-车辆","4":"异常报警-异物","5":"异常报警-物品","6":"异常报警-设备",
            "7":"首页-猪场存栏", "8":"疫苗接种", "9": "病原检测",
            "10":"人员权限设置", "11":"人员记录",
            "12":"车辆权限设置", "13":"车辆记录","14":"洗消代驾司机记录","24":"洗消代驾登记",
            "15":"物品登记","16":"物品记录",
            "17":"猪只查看","18":"入栏","19":"转栏","20":"出栏","21":"操作记录","22":"反馈记录","23":"猪舍猪栏管理",
            "25":"蓝牙设置","31":"入场申请"
        },
        // 蓝牙状态
        bluetoothStatus: false, // 未开启
    }
})









// 隐藏功能
/**
 * app.json
 * 
            {
                "pagePath": "pages/message/index",
                "iconPath": "/image/icon/tab_message.png",
                "selectedIconPath": "/image/icon/tab_message_select.png",
                "text": "消息"
            },
 */