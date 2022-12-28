const app = getApp();
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
const box = require('../../utils/box.js')
const time = require('../../utils/time.js')
const face = require('../../utils/face.js')

Page({
    data: {
        selectedType: 0,
        imgFlag:false, // true为更换图片 不进行onShow
        categoryArr: [
            {'name':'--请选择类别--','value':''},
            {'name':'员工', 'value': '1'},
            {'name':'访客', 'value': '2'}
        ],
        categoryIndex: 0,
        roleArr: [
            {'name':'--请选择职务--','value':''}
        ],
        roleIndex: 0,
        // 时间选择器 来访-----------------
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
        frontPhoto:[], //头像
        name:'',
        job_number:'',
        phone:'',        
        reason:''
    },
    onLoad: function (){
        console.log('进入人员权限设置');
    },

    onShow:function(){
        var that = this;
        var type = that.data.selectedType;
        if(that.data.imgFlag){ // 图片选择及预览会刷新此函数
            that.setData({imgFlag:false})
        }else{
            if(type=='0'){
                that.getEmployeesList();                
            }else if(type == '1'){
                that.getVisitorList();
            }else if(type == '2'){
                that.entryAddOperation();
            }
        }
    },

    // 类型切换
    selectFunc:function(e){
        var that = this;
        var initType = that.data.selectedType;
        var type = e.currentTarget.dataset.type;
        if(type != initType){
            if(type=='0'){
                that.getEmployeesList();                
            }else if(type == '1'){
                that.getVisitorList();
            }else if(type == '2'){
                that.entryAddOperation();
            }
            that.setData({selectedType: type})
        }
    },

    // 获取员工列表
    getEmployeesList:function(){
        var that = this;
        that.setData({employeesList:null})
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id
        }
        request.request_get('/personnelManagement/getEmployeesList.hn', data, function (res) {
            console.info('回调', res)
            if(res.success){
                var employeesList = res.msg;
                that.setData({employeesList:employeesList})
            }else{
                box.showToast(res.msg)
            }
        })
    },

    // 获取访客列表
    getVisitorList:function(){
        var that = this;
        that.setData({visitorList:null})
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id
        }
        request.request_get('/personnelManagement/getVisitorList.hn', data, function (res) {
            console.info('回调', res)
            if(res.success){
                var visitorList = res.msg;
                that.setData({visitorList:visitorList})
            }else{
                box.showToast(res.msg)
            }
        })
    },

    // 打电话
    call_phone:function(e){
        var phone = e.currentTarget.dataset.phone;
        wx.makePhoneCall({
            phoneNumber: phone,
            success: function () {
                console.log("拨打电话成功！")
            },
            fail: function () {
                console.log("拨打电话失败！")
            }
        })
    },

    // 新增
    entryAddOperation:function(e){
        var that = this;
        box.showLoading("信息获取中...");
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id
        }
        request.request_get('/personnelManagement/getPermissionsList.hn', data, function (res) {
            console.info('回调', res)
            if(res.success){
                var roleInfo = res.msg;
                var roleArr = [ {'name':'--请选择职务--','value':''},]
                for(var a in roleInfo){
                    var role_name = roleInfo[a].role_name;
                    var role_id = roleInfo[a].role_id;
                    roleArr.push({'name':role_name, 'value':role_id})
                }
                that.resetData(); // 数据重置
                that.setData({roleArr:roleArr})
            }else{
                box.showToast(res.msg)
            }
            box.hideLoading();
        })
    },

    // 类别改变
    categoryChange:function(e) {
        var categoryIndex = e.detail.value;
        this.setData({
            categoryIndex: categoryIndex
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

    // 头像上传
    ChooseImage:function(){
        var that = this;
        that.setData({imgFlag:true})
        wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res) {
                var frontPhoto = res.tempFilePaths
                that.setData({frontPhoto:frontPhoto})
            }
        })
    },
    //预览图片，放大预览
    preview:function(e) {
        var that = this;
        that.setData({imgFlag:true})
        let currentUrl = e.currentTarget.dataset.url
        wx.previewImage({
            current: currentUrl, // 当前显示图片的http链接
            urls: [currentUrl] // 需要预览的图片http链接列表
        })
    },
    delview:function(){
        this.setData({frontPhoto:[]})
    },

    // 新增信息提交
    submitAdd:function(e){
        var that = this;
        var info =  e.detail.value;
        var data = {};
        var name = info.name;
        var job_number = info.job_number;
        var phone = info.phone;
        var frontPhoto = that.data.frontPhoto;
        var roleValue =  that.data.roleArr[that.data.roleIndex].value;
        var categoryValue =  that.data.categoryArr[that.data.categoryIndex].value;
        var startTime = that.data.startTime;
        var endTime = that.data.endTime;
        var reason = info.reason;
        data = {
            pig_farm: app.globalData.userInfo.pig_farm_id,
            name:name,
            job_number:job_number,
            phone:phone,
            role:roleValue,
            category:categoryValue,
            startTime:startTime,
            endTime:endTime,
            reason:reason
        }
        console.log("上传信息，除头像" + data);
        if(categoryValue == ""){ // 1 员工 2访客
            box.showToast("请选择类别");
            return;
        }
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
        if(categoryValue == "2"){
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
        }
        if (frontPhoto.length == 0) {
            box.showToast("请完善正面照");
            return;
        } 
        box.showLoading('正在上传');
        face.face_judgment(frontPhoto[0], that.faceResult, data);
    },

    // 信息重置
    resetData:function(){
        var that = this;
        var startTime = time.format_hour(new Date(new Date().getTime() + 12 * 3600 * 1000));
        var endTime = time.format_hour(new Date(new Date().getTime() + 12 * 3600 * 1000));
        that.setData({name:'',job_number:'',phone:'',roleIndex: 0,categoryIndex:0,frontPhoto:[],reason:'',startTime:startTime,endTime:endTime})
    },

    // face++返回结果
    faceResult:function(result, need_data){
        var that = this;
        console.log("face++ 返回结果" + result);
        if(result.success){
            var src = result.msg;
            request.upload_file('/personnelManagement/createPersonnel.hn', src, 'headImg', need_data, function (res) {
                console.info('回调', res)
                box.hideLoading()
                if(res.success){
                    wx.showModal({
                        title: '成功',
                        content: '创建成功',
                        showCancel: false,
                        success: function (res) {
                            if (res.confirm) {
                                that.resetData();
                            }
                        }
                    })
                }else{
                    box.showToast(res.msg)
                }
            })
        }else{
            box.showToast(result.msg);
            box.hideLoading()
        }
    },

    // 进入详情
    enter_details:function(e){
        var id = e.currentTarget.dataset.id;
        var type = e.currentTarget.dataset.type;
        console.log("进入详情0员工1访客：" + type);
        console.log("人员id:" + id);
        wx.navigateTo({
            url: '/pages/personal/details?id=' + id + '&type=' + type,
        })
    },
})