const app = getApp()
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')

Page({
    data:{
        textareaAValue:'',
    },
    onLoad: function (options){
        this.setData({
            sty: options.sty,
            label_id:options.label_id,
            label_serial:options.label_serial,
        })
        console.log('进入提交问题反馈页面' + options.label_id)
    },
    textareaAInput:function(e){
        console.log('填写的内容' + e.detail.value)
        this.setData({
            textareaAValue: e.detail.value
        })
    },
    send:function(){
        var that = this;
        var sty = that.data.sty;
        var label_id = that.data.label_id;
        var label_serial = that.data.label_serial;
        var textareaAValue = that.data.textareaAValue;
        console.log(textareaAValue)
        textareaAValue = textareaAValue.replace(/\s+/g, '');
        if (textareaAValue == '') {
            box.showToast('请填写内容')
        } else{
            var data = {
                sty: sty,
                label_id: label_id,
                label_serial: label_serial,
                content: textareaAValue,
                user_serial: app.globalData.userInfo.id,
                type:'0', //0普通反馈
            }
            request.request_get('/pigManagement/insertFeedback.hn', data, function (res) {
                console.info('回调', res)
                if (res) {
                    if (res.success) {
                        that.setData({ textareaAValue: ''})
                        wx.showModal({
                            title: '',
                            content: '发送成功',
                            showCancel: false,
                            confirmText:'确定',
                            success: function (res) {
                                if (res.confirm) {
                                    wx.navigateBack({})
                                }
                            }
                        })                        
                    } else {
                        box.showToast(res.msg)
                    }
                }
            })
        }
    },
    //******语音**************************************** */
    use_voice: function () {
        box.showToast("您的权限不够")
    },
    //******照片**************************************** */
    use_photo: function () {
        box.showToast("您的权限不够")
    },
    //******视频**************************************** */
    use_video: function () {
        box.showToast("您的权限不够")
    },
    
})