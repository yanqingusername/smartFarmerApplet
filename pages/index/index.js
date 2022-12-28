
const app = getApp()
const updateApp = require('../../utils/updateApp.js')
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')
const login = require('../../utils/login.js')

Page({
    onShow:function(){
        var that = this;
        // 获取设备信息
        wx.getSystemInfo({
            success: res => {
                app.globalData.systeminfo = res
            }
        })
        // 自动检查小程序版本并更新
        updateApp.updateApp("卡尤迪智慧畜牧系统");
        // 登录小程序
        that.loginApp();
    },

    loginApp:function(){
        wx.login({
            success: (res) => {
                var code = res.code;
                console.log("获取code成功" + code );
                request.request_get('/pigProjectApplet/entryApplet.hn', { wxCode: code }, function (res) {
                    console.info('回调', res);
                    if(res){
                        if(res.success){
                            app.globalData.openid = res.msg;
                            if(res.code=='200'){    //没有登陆过小程序
                                wx.reLaunch({
                                    url: '/pages/main/login',
                                })
                            } else if (res.code=='199'){    // 获取登录账号的相关信息
                                login.toLogin(res.phone);
                            }
                        }else{
                            box.showToast(res.msg);
                        }
                    }
                })
            },
            fail:(res) => {
                console.log("登录信息获取失败：" + res);
                box.showToast("登录信息获取失败，请重试")
            }
        })
    },
})
