const app = getApp();
const request = require('../../utils/request.js')
const time = require('../../utils/time.js')
const box = require('../../utils/box.js')

Page({
    data:{
        // 开始时间参数设置
        pickerConfig: {
            endDate: false,
            column: "minute",
            dateLimit: true,
            initStartTime: time.format_hour(new Date(new Date().getTime())),
            limitStartTime: time.format_hour(new Date(new Date().getTime())),
            limitEndTime: time.format_hour(new Date(new Date().getTime() + 8760 * 3600 * 1000))
        },
        // 开始时间参数设置
        startIsPickerRender: false,
        startIsPickerShow: false,
        startTime:time.format_hour(new Date(new Date().getTime())),
        startChartHide:false,
        // 结束时间参数设置
        endIsPickerRender: false,
        endIsPickerShow: false,
        endTime:time.format_hour(new Date(new Date().getTime())),
        endChartHide:false,
    },

    onLoad: function (options){
        console.log('进入员工隔离');
        this.setData({
            id: options.id
        })
    },

    // 时间选择器
    start_time_show:function(){
        this.setData({
            startIsPickerShow: true,
            startIsPickerRender: true,
            startChartHide: true
        })
    },
    start_time_hide:function(){
        this.setData({
            startIsPickerShow: false,
            startChartHide: false
        })
    },
    set_start_time: function(val) {
        this.setData({
            startTime: val.detail.startTime
        });
    },
    end_time_show:function(){
        this.setData({
            endIsPickerShow: true,
            endIsPickerRender: true,
            endChartHide: true
        })
    },
    end_time_hide:function(){
        this.setData({
            endIsPickerShow: false,
            endChartHide: false
        })
    },
    set_end_time: function(val) {
        this.setData({
            endTime: val.detail.startTime
        });
    },

    // 提交修改
    submit:function(e){
        var that = this;
        var info =  e.detail.value;
        var data = {};
        var reason = info.reason;
        var startTime = that.data.startTime;
        var endTime = that.data.endTime;
        var id = that.data.id;
        data = {
            startTime:startTime,
            endTime:endTime,
            reason:reason,
            id:id
        }
        console.log("提交的数据：" + data);
        var time_start = new Date(startTime); 
        var time_end = new Date(endTime); 
        if(time_start >= time_end){
            box.showToast("结束时间必须晚于开始时间");
            return;
        }
        if(reason == ""){
            box.showToast("请填写隔离原因");
            return;
        }

        box.showLoading('正在提交');
        request.request_get('/personnelManagement/submitIsolation.hn', data, function (res) {
            console.info('回调', res)
            box.hideLoading()
            if(res.success){
                wx.showModal({
                    title: '成功',
                    content: '提交成功',
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                            wx.navigateBack({delta: 0})
                        }
                    }
                })
            }else{
                box.showToast(res.msg)
            }
        })
    }
   

    
})