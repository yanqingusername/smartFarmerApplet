const app = getApp()
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')
const login = require('../../utils/login.js')
const utils = require('../../utils/utils.js')

Page({
    data: {
        codeBtText: "获取验证码",
        codeBtState: false,
        currentTime: 60,
        phone: "",
        phoneCode: ["", ""], //正确的 手机号 和 验证码
        notVerifyAccount: [],
    },

    onLoad: function () {
        this.getNotVerifyAccount();
    },

    // 获取免验证登录的账号
    getNotVerifyAccount:function () {
        var that = this;
        // 获取时间大概 50ms以内，异步获取即可，无验证只内部人员使用
        request.request_get('/pigProjectApplet/getNotVerifyAccount.hn', {}, function (res) {
            console.info('回调', res);
            if(res){
                if(res.success){
                    var notVerifyAccount = res.msg;
                    that.setData({notVerifyAccount:notVerifyAccount});
                }else{
                    box.showToast(res.msg);
                }
            }
        })
    },

    // 检测手机号输入框
    phoneInput: function (e) {
        this.setData({
            phone: e.detail.value,
        })
    },

    // 获取验证码按钮
    getCode: function () {
        var that = this;
        var phone = that.data.phone;
        var currentTime = that.data.currentTime;
        console.log("需要获取验证码的手机号" + phone);

        if (that.data.codeBtState) {
            console.log("还未到达时间");
        } else {
            if (phone == '') {
                box.showToast("请填写手机号");
            } else if (!utils.checkPhone(phone)) {
                box.showToast("手机号有误");
            } else {
                request.request_get('/pigProjectApplet/Verification.hn', { phone: phone }, function (res) {
                    console.info('回调', res)
                    if(res){
                        if(res.success){
                            that.setData({ phoneCode: [phone, res.code] });
                        }else{
                            box.showToast("验证码发送失败");
                        }
                    }
                })

                // 倒计时
                var interval = setInterval(function () {
                    currentTime--;
                    that.setData({
                        codeBtText: currentTime + 's',
                        codeBtState: true
                    })
                    if (currentTime <= 0) {
                        clearInterval(interval)
                        that.setData({
                            codeBtText: '重新发送',
                            currentTime: 60,
                            codeBtState: false,
                        })
                    }
                }, 1000);
            }
        }
    },

    // 登录
    login: function (e) {
        var that = this;
        var info = e.detail.value;
        var phone = info.phone;
        var code = info.code;
        var phoneCode = that.data.phoneCode;
        console.log('手机号和验证码：', phone, code);
        console.log(phoneCode);
        
        // 是否为免验证账号
        var notVerifyAccount = that.data.notVerifyAccount;
        for(var a in notVerifyAccount){
            var account = notVerifyAccount[a].account;
            if(account == phone){
                // 获取密码
                var password = notVerifyAccount[a].password;
                if(password == code){
                    console.log("免验证账号进入：" + phone);
                    login.toLogin(phone);
                    return;
                }else{
                    box.showToast("密码错误");
                    return;
                }
            }
        }
        
        if (phone == '') {
            box.showToast("请填写手机号");
            return;
        } 
        if (!utils.checkPhone(phone)) {
            box.showToast("手机号有误");
            return;
        }
        if (code == '') {
            box.showToast("请填写验证码");
            return;
        } 
        if (phoneCode[0] == ""){ // 没点击过获取验证码按钮，说明验证码肯定错误
            box.showToast("验证码错误");
            return;
        } 
        if (phoneCode[0] != phone) { // 验证码获取的手机号和提交的手机号不一致
            box.showToast("验证码过期");
            return;
        }
        if (phoneCode[1] != code) { // 验证码错误
            box.showToast("验证码错误");
            return;
        } 

        login.toLogin(phone);
    }
})
