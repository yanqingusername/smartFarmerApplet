const app = getApp();
const request = require('../../utils/request.js')
const time = require('../../utils/time.js')
const box = require('../../utils/box.js')
const utils = require('../../utils/utils.js')

Page({
    data:{
        roleArr: [
            {'name':'--请选择职务--','value':''}
        ],
        personnelInfo:{},
        roleIndex: 0,
        // 来访时间
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
        console.log('进入继续来访');
        this.setData({
            id: options.id
        })
    },

    onShow:function(){
        var that = this;
        that.getPersonalInfo();
    },

    // 获取人员信息
    getPersonalInfo:function(){
        var that = this;
        var data = {
            id: that.data.id,
            type: "1", //0 员工 1访客
        }
        request.request_get('/personnelManagement/getPersonalInfo.hn',data, function (res) {
            console.info('回调', res)
            if(res.success){
                var personnelInfo = res.msg;
                that.getPermissionsList(personnelInfo.roleId);
                that.setData({personnelInfo:personnelInfo});
            }else{
                box.showToast(res.msg)
            }
        })
    },

    // 获取权限信息列表
    getPermissionsList:function(roleId){
        var that = this;
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id
        }
        request.request_get('/personnelManagement/getPermissionsList.hn', data, function (res) {
            console.info('回调', res)
            if(res.success){
                var roleInfo = res.msg;
                var roleArr = [ {'name':'--请选择职务--','value':''},];
                var roleIndex = 0;
                for(var a in roleInfo){
                    var role_name = roleInfo[a].role_name;
                    var role_id = roleInfo[a].role_id;
                    if(role_id == roleId){
                        roleIndex =  Number(a) + 1;
                    }
                    roleArr.push({'name':role_name, 'value':role_id})
                }
                console.log(roleArr)
                console.log(roleIndex)
                that.setData({roleArr:roleArr, roleIndex:roleIndex})
            }else{
                box.showToast(res.msg)
            }
            box.hideLoading();
        })
    },
    
    // 职务改变
    roleChange(e) {
        console.log(e);
        this.setData({
            roleIndex: e.detail.value
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
        var name = info.name;
        var job_number = info.job_number;
        var phone = info.phone;
        var roleValue =  that.data.roleArr[that.data.roleIndex].value;
        var startTime = that.data.startTime;
        var endTime = that.data.endTime;
        var reason = info.reason;
        var head_url = that.data.personnelInfo.head_url;
        
        data = {
            name:name,
            job_number:job_number,
            phone:phone,
            role:roleValue,
            startTime:startTime,
            endTime:endTime,
            reason:reason,
            head_url:head_url,
            pig_farm: app.globalData.userInfo.pig_farm_id,
        }
        console.log("提交的数据：" + data);
        if(name == ""){
            box.showToast("请填写姓名");
            return;
        }
        if(job_number == ""){
            box.showToast("请填写工号");
            return;
        }
        if(phone == ""){
            box.showToast("请填写手机号");
            return;
        }
        if (!utils.checkPhone(phone)) {
            box.showToast("手机号有误");
            return;
        }
        if(roleValue == ""){
            box.showToast("请选择职务");
            return;
        }
        var time_start = new Date(startTime); 
        var time_end = new Date(endTime); 
        if(time_start >= time_end){
            box.showToast("离开时间必须晚于来访时间");
            return;
        }
        if(reason == ""){
            box.showToast("请填写来访事由");
            return;
        }
        box.showLoading('正在提交');
        request.request_get('/personnelManagement/continueVisit.hn', data, function (res) {
            console.info('回调', res)
            box.hideLoading()
            if(res.success){
                wx.showModal({
                    title: '成功',
                    content: '提交成功',
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                            wx.redirectTo({
                                url: "./management",
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