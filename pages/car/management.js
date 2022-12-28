const app = getApp();
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')

Page({
    data: {
        selectedType: 0,
        typeArr: [
            {'name':'--请选择车辆类型--','value':''}
        ],
        typeIndex: 0,
        car_num:'',
        purpose:'',
    },
    onLoad: function (){
        console.log('进入车辆权限设置');
    },

    onShow:function(){
        var that = this;
        var type = that.data.selectedType;
        if(type=='0'){
            that.getCarList();                
        }else if(type == '1'){
            that.entryAddOperation();
        }
    },

    // 类型切换
    selectFunc:function(e){
        var that = this;
        var initType = that.data.selectedType;
        var type = e.currentTarget.dataset.type;
        if(type != initType){
            if(type=='0'){
                that.getCarList();                
            }else if(type == '1'){
                that.entryAddOperation();
            }
            that.setData({selectedType: type})
        }
    },

    // 获取车辆列表
    getCarList:function(){
        var that = this;
        that.setData({carList:null})
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id
        }
        request.request_get('/carManagement/getCarList.hn', data, function (res) {
            console.info('回调', res)
            if(res.success){
                var carList = res.msg;
                that.setData({carList:carList})
            }else{
                box.showToast(res.msg)
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
        request.request_get('/carManagement/getCarTypeList.hn', data, function (res) {
            console.info('回调', res)
            if(res.success){
                var typeInfo = res.msg;
                var typeArr = [{'name':'--请选择车辆类型--','value':''}]
                for(var a in typeInfo){
                    var type_name = typeInfo[a].type_name;
                    var type_id = typeInfo[a].type_id;
                    typeArr.push({'name':type_name, 'value':type_id})
                }
                that.resetData(); // 数据重置
                that.setData({typeArr:typeArr})
            }else{
                box.showToast(res.msg)
            }
            box.hideLoading();
        })
    },

    // 类型改变
    typeChange(e) {
        console.log(e);
        this.setData({
            typeIndex: e.detail.value
        })
    },

    // 新增信息提交
    submitAdd:function(e){
        var that = this;
        var info =  e.detail.value;
        var data = {};
        var car_num = info.car_num;
        var purpose = info.purpose;
        var typeValue =  that.data.typeArr[that.data.typeIndex].value;
        data = {
            pig_farm: app.globalData.userInfo.pig_farm_id,
            car_num:car_num,
            purpose:purpose,
            type:typeValue
        }
        console.log("上传信息" + data);
        if(typeValue == ""){
            box.showToast("请选择车辆类型");
            return;
        }
        if(car_num == ""){
            box.showToast("请填写车牌");
            return;
        }
        if(purpose == ""){
            box.showToast("请填写用途");
            return;
        }
        box.showLoading('正在上传');
        request.request_get('/carManagement/carInformationEntry.hn', data, function (res) {
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
    },

    // 信息重置
    resetData:function(){
        var that = this;
        that.setData({car_num:'',purpose:'',typeIndex: 0})
    },

    // 进入详情
    enter_details:function(e){
        var id = e.currentTarget.dataset.id;
        console.log("车辆id:" + id);
        wx.navigateTo({
            url: '/pages/car/details?id=' + id,
        })
    },
})