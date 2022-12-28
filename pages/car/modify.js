const app = getApp();
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')

Page({
    data:{
        typeArr: [
            {'name':'--请选择车辆类型--','value':''}
        ],
        typeIndex: 0,
    },

    onLoad: function (options){
        console.log('进入车辆修改');
        this.setData({
            id: options.id
        })
    },

    onShow:function(){
        var that = this;
        that.getCarInfo();
    },

    // 获取车辆信息
    getCarInfo:function(){
        var that = this;
        var data = {
            id: that.data.id
        }
        request.request_get('/carManagement/getCarInfo.hn',data, function (res) {
            console.info('回调', res)
            if(res.success){
                var carInfo = res.msg;
                that.setData({carInfo:carInfo});
            }else{
                box.showToast(res.msg)
            }
        })
    },

    getCarInfo:function(){
        var that = this;
        var data = {
            id: that.data.id,
            type: that.data.type
        }
        request.request_get('/carManagement/getCarInfo.hn',data, function (res) {
            console.info('回调', res)
            if(res.success){
                var carInfo = res.msg;
                that.getCarTypeList(carInfo.type_id);
                that.setData({carInfo:carInfo});
            }else{
                box.showToast(res.msg)
            }
        })
    },

    // 获取车辆类型列表
    getCarTypeList:function(typeId){
        var that = this;
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id
        }
        request.request_get('/carManagement/getCarTypeList.hn', data, function (res) {
            console.info('回调', res)
            if(res.success){
                var typeInfo = res.msg;
                var typeArr = [{'name':'--请选择车辆类型--','value':''}]
                var typeIndex = 0;
                for(var a in typeInfo){
                    var type_name = typeInfo[a].type_name;
                    var type_id = typeInfo[a].type_id;
                    if(type_id == typeId){
                        typeIndex =  Number(a) + 1;
                    }
                    typeArr.push({'name':type_name, 'value':type_id})
                }
                that.setData({typeArr:typeArr,typeIndex:typeIndex})
            }else{
                box.showToast(res.msg)
            }
            box.hideLoading();
        })
    },
    
    // 车辆类型改变
    typeChange(e) {
        console.log(e);
        this.setData({
            typeIndex: e.detail.value
        })
    },

    // 提交修改
    submitModify:function(e){
        var that = this;
        var info =  e.detail.value;
        var data = {};
        var car_num = info.car_num;
        var purpose = info.purpose;
        var typeValue =  that.data.typeArr[that.data.typeIndex].value;
        var id = that.data.id;
        data = {
            id: id,
            car_num:car_num,
            purpose:purpose,
            type:typeValue
        }
        console.log("修改的数据" + data);
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
        box.showLoading('正在提交');
        request.request_get('/carManagement/modifyCarInfo.hn', data, function (res) {
            console.info('回调', res)
            box.hideLoading()
            if(res.success){
                wx.showModal({
                    title: '成功',
                    content: '修改成功',
                    showCancel: false,
                    success: function (res) {
                        if (res.confirm) {
                            that.onShow();
                        }
                    }
                })
            }else{
                box.showToast(res.msg)
            }
        })
    }
   

    
})