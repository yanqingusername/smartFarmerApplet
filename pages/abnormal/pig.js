const app = getApp();
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')

Page({
    data:{
        openPiggery_dic:{},
        sty_Dic:{},
    },
    onLoad: function (){
        console.log('猪只监测');
    },
    onShow:function(){
        this.get_piggery_alarm_list()
    },
    get_piggery_alarm_list:function(){
        var that = this;
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id
        }
        request.request_get('/pigManagement/getPigAlarmGroupPiggery.hn', data, function (res) {
            console.info('回调', res)
            if(res){
                var piggery_alarm_list = res.msg;
                that.setData({ piggery_alarm_list:piggery_alarm_list})
            }else{
                box.showToast(res.msg)
            }
        })
    },
    toPiggery:function(e){
        var piggery = e.currentTarget.dataset.piggery;
        wx.navigateTo({
            url: '/pages/abnormal/pig_piggery_alarm?piggery=' + piggery,
        })
    },
    to_piggery_cumulative:function(e){
        var piggery = e.currentTarget.dataset.piggery;
        wx.navigateTo({
            url: '/pages/abnormal/pig_piggery_cumulative?piggery=' + piggery,
        })
    }
    
})