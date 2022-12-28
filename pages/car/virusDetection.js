const app = getApp();
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')
const time = require('../../utils/time.js')

Page({
    data:{
        // 时间参数设置
        pickerConfig: {
            endDate: false,
            column: "minute",
            dateLimit: true,
            initStartTime: time.format_hour(new Date(new Date().getTime())),
            limitStartTime: time.format_hour(new Date(new Date().getTime() - 8760 * 3600 * 1000)),
            limitEndTime: time.format_hour(new Date(new Date().getTime() + 8760 * 3600 * 1000))
        },
        pickerRender: false,
        pickerShow: false,
        sampling_time:time.format_hour(new Date(new Date().getTime())),
        chartHide:false,
    },

    onLoad: function (options){
        console.log('进入病毒检测');
        this.setData({
            car_num: options.car_num
        })
    },

    // 时间选择器
    sampling_time_show:function(){
        this.setData({
            pickerShow: true,
            pickerRender: true,
            cChartHide: true
        })
    },
    time_hide:function(){
        this.setData({
            pickerShow: false,
            chartHide: false
        })
    },
    set_sampling_time: function(val) {
        this.setData({
            sampling_time: val.detail.startTime
        });
    },

    // 提交病毒检测
    submit:function(e){
        var that = this;
        var info =  e.detail.value;
        var data = {};
        var sample_id = info.sample_id;
        var car_num = that.data.car_num;
        var sampling_time = that.data.sampling_time;
        data = {
            sample_id: sample_id,
            car_num:car_num,
            sampling_time:sampling_time
        }
        console.log("上传的数据" + data);
        if(sample_id == ""){
            box.showToast("请填写样本号");
            return;
        }
        box.showLoading('正在提交');
        request.request_get('/carManagement/addViruDetection.hn', data, function (res) {
            console.info('回调', res)
            box.hideLoading()
            if(res.success){
                wx.showModal({
                    title: '成功',
                    content: '提交成功',
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                            wx.navigateBack({
                              delta: 0,
                            })
                        }
                    }
                })
            }else{
                box.showToast(res.msg)
            }
        })
    }
   

    
})