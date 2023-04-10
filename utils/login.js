const app = getApp()
const request = require('../utils/request.js')
const box = require('../utils/box.js')

/* 
*  登录js
*  author cuiyf
*/
function toLogin(phone){
    console.log("开始登录" + phone);
    var data = {
        openid: app.globalData.openid,
        phone: phone,
    }
    request.request_get('/pigProjectApplet/loginApplet.hn', data, function (res) {
        console.info('回调', res)
        if(res){
            if(res.success){
                console.log('登录成功')
                var userInfo = res.user_info;
                if(userInfo.length>1){
                    userInfo = encodeURIComponent(JSON.stringify(userInfo));
                    wx.reLaunch({
                        url: "/pages/main/select?userInfo=" + userInfo,
                    })
                }else{
                    // 存储用户信息
                    app.globalData.userInfo = userInfo[0];
                    wx.switchTab({
                        url: '/pages/home/index',
                    })
                }
            }else{
                box.showToast(res.msg);
            }
        }
    })
}

module.exports = {
    toLogin: toLogin
}