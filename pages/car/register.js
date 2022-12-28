const app = getApp();
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')
const time = require('../../utils/time.js')

Page({
    data:{
        carArr: [
            {'name':'--请选择车辆--','value':''}
        ],
        carIndex: 0,
        cloud_id_id:'',
    },

    onLoad: function (){
        console.log('进入洗消代驾登记');
    },

    onShow:function(){
        var that = this;
        that.getCarList();
    },

    // 获取车辆列表
    getCarList:function(){
        var that = this;
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id
        }
        request.request_get('/carManagement/getCarList.hn', data, function (res) {
            console.info('回调', res)
            if(res.success){
                var carInfo = res.msg;
                var carArr = [{'name':'--请选择车辆--','value':''}];
                var carIndex = 0;
                var carValue = '';
                for(var a in carInfo){
                    var car_num = carInfo[a].car_num;
                    var type_name = carInfo[a].type_name;
                    var name = car_num + "("+type_name+")";
                    carArr.push({'name':name, 'value':car_num})
                }
                console.log(carArr)
                console.log(carIndex)
                that.setData({carArr:carArr, carIndex:carIndex,carValue:carValue});
            }else{
                box.showToast(res.msg)
            }
        })
    },
    
    // 选择车辆
    carChange(e) {
        var that = this;
        that.setData({
            carIndex: e.detail.value
        })
    },

    // 提交修改
    submit:function(e){
        var that = this;
        var info =  e.detail.value;
        var data = {};
        var carValue =  that.data.carArr[that.data.carIndex].value;
        var cloud_id = info.cloud_id;
        data = {
            pig_farm: app.globalData.userInfo.pig_farm_id,
            car_num: carValue,
            cloud_id:cloud_id,
        }
        console.log("上传的数据" + data);
        if(carValue == ""){
            box.showToast("请选择车辆");
            return;
        }
        if(cloud_id == ""){
            box.showToast("请填写云端的ID号");
            return;
        }
        
        box.showLoading('正在提交');
        request.request_get('/carManagement/carDecontaminationRegister.hn', data, function (res) {
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
    },

})