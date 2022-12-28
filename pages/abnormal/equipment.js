const app = getApp();
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')

Page({
    data: {
        loading:false,
        isEnd:false,
        page:0,
        limit:10,
        DialogInput:'',
        selectAlarmId: '', // 选择的报警id
        piggery_alarm_list:[]
    },
    onLoad: function (){
        console.log('设备报警');
    },
    onShow:function(){
        var that = this;
        that.getAlarmInfo(that.data.page);
    },

    // 弹框
    showModal(e) {
        this.setData({
            modalName: e.currentTarget.dataset.target
        })
    },
    hideModal(e) {
        this.setData({
            modalName: null
        })
    },

    // 获取报警数据
    getAlarmInfo:function(page){
        var that = this;
        that.setData({loading:true});
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id
        }
        request.request_get('/equipmentManagement/getFarmEquipmentAlarmTotal.hn', data, function (res) {
            //console.info('回调', res)
            if (res) {
                if (res.success) {
                    that.setData({piggery_alarm_list: res.msg})
                } else {
                    box.showToast(res.msg)
                }
                that.setData({loading:false})
            }
        })
    },

    //上拉加载数据
    onReachBottom() {
        var that = this;
        if(!that.data.loading && !that.data.isEnd){
            var page = that.data.page + 1;
            that.getAlarmInfo(page);
        }
    },

    // 报警处理记录填写
    alarmProcessing:function(e){
        var that = this;
        var index = e.currentTarget.dataset.index;
        var selectAlarmId = that.data.alarm_info[index].id;
        that.setData({modalName:'DialogAlarmProcessing', selectAlarmId:selectAlarmId})
    },
    DialogInput:function(e){
        var value = e.detail.value
        this.setData({ DialogInput: value})
    },
    submit_processing_records:function(){
        var that = this;
        var DialogInput = that.data.DialogInput;
        DialogInput = DialogInput.replace(/\s+/g, '');
        if (DialogInput == '') {
            box.showToast('请填写处理记录');
        }else{
            var data = {
                alarm_id: that.data.selectAlarmId,
                user_serial:app.globalData.userInfo.id,
                problem_back:DialogInput,
            }
            request.request_get('/pigProjectApplet/submit_processing_records.hn', data, function (res) {
                console.info('回调', res)
                if (res) {
                    that.setData({modalName:null})
                    if (res.success) {
                        wx.showModal({
                            title: '成功',
                            content: '提交成功',
                            showCancel: false,
                            confirmText:'确定',
                            success: function (res) {
                                if (res.confirm) {
                                    that.setData({DialogInput:"",alarm_info: undefined,isEnd:false,loading:false,page:0});
                                    that.getAlarmInfo(0);
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

    // 处理完成的记录
    goRecords:function(){
        wx.navigateTo({
            url: '/pages/abnormal/equipment_records',
        })
    },
    toData:function(e){
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/abnormal/equipment_records?type=0&id='+id,
        })
    },
    toDataAll:function(e){
        var id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/abnormal/equipment_records?type=&id='+id,
        })
    },
})