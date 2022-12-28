const app = getApp();
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')
const time = require('../../utils/time.js')

Page({
    data:{
        typeArr: [
            {'name':'--请选择物品类型--','value':''}
        ],
        typeIndex: 0,
        material_content:"",
        virusDetection:'0',
        sample_id:'',
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

    onLoad: function (){
        console.log('进入物品登记');
    },

    onShow:function(){
        var that = this;
        that.getGoodsTypeList();
    },

    // 获取物品类型列表
    getGoodsTypeList:function(){
        var that = this;
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id
        }
        request.request_get('/goodsManagement/getGoodsTypeList.hn', data, function (res) {
            console.info('回调', res)
            if(res.success){
                var typeInfo = res.msg;
                var typeArr = [{'name':'--请选择物品类型--','value':''}]
                for(var a in typeInfo){
                    var type_name = typeInfo[a].type_name;
                    var type_id = typeInfo[a].type_id;
                    typeArr.push({'name':type_name, 'value':type_id})
                }
                that.setData({typeArr:typeArr})
            }else{
                box.showToast(res.msg)
            }
            box.hideLoading();
        })
    },
    
    // 物品类型改变
    typeChange(e) {
        console.log(e);
        this.setData({
            typeIndex: e.detail.value
        })
    },

    // 物品内容
    contentInput(e) {
        this.setData({
            material_content: e.detail.value
        })
    },

     //病毒检测状态改变
     virusDetectionChange:function(e){
        this.setData({virusDetection:e.detail.value})
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

    // 提交修改
    submit:function(e){
        var that = this;
        var info =  e.detail.value;
        var data = {};
        var typeValue =  that.data.typeArr[that.data.typeIndex].value;
        var material_content = that.data.material_content;
        var virusDetection = that.data.virusDetection;
        var sample_id = info.sample_id;
        var sampling_time = that.data.sampling_time;
        data = {
            pig_farm: app.globalData.userInfo.pig_farm_id,
            type: typeValue,
            virusDetection: virusDetection,
            material_content:material_content,
            sample_id:sample_id,
            sampling_time:sampling_time
        }
        console.log("上传的数据" + data);
        if(typeValue == ""){
            box.showToast("请选择物品类型");
            return;
        }
        if(material_content == ""){
            box.showToast("请填写物品内容");
            return;
        }
        if(virusDetection == "1"){
            if(sample_id == ""){
                box.showToast("请填写样本号");
                return;
            }
        }
        box.showLoading('正在提交');
        request.request_get('/goodsManagement/goodsRegister.hn', data, function (res) {
            console.info('回调', res)
            box.hideLoading()
            if(res.success){
                wx.showModal({
                    title: '成功',
                    content: '物品ID:' + res.msg,
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
        that.setData({virusDetection:'0',material_content:'',typeIndex: 0,sample_id:'',sampling_time:time.format_hour(new Date(new Date().getTime()))})
    },
    
})