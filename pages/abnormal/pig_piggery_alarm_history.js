const app = getApp();
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')

Page({
    data: {
        loading:false,
        isEnd:false,
        page:0,
        limit:10,
    },
    onLoad: function (options){
        this.setData({
            piggery: options.piggery
        })
        console.log('猪只检测，舍内处理报警猪只');
    },
    onShow:function(){
        var that = this;
        that.getPigAlarm(that.data.page);
        that.getPiggeryName();
    },
    // 获取猪舍名称
    getPiggeryName:function(){
        var that = this;
        // 获取猪舍名称
        request.request_get('/pigManagement/getNamebyPiggeryId.hn', {id: that.data.piggery}, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var piggery_name = res.msg;
                    that.setData({ piggery_name: piggery_name})
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    // 猪只报警
    getPigAlarm:function(page){
        var that = this;
        that.setData({loading:true})
        var data = {
            pig_farm:app.globalData.userInfo.pig_farm_id,
            piggery:that.data.piggery,
            page: page,
            limit:that.data.limit,
            type:"2", //0全部 1未处理 2处理的，其中未处理状态可能存在自动恢复需要标记出来
        }
        request.request_get('/pigManagement/getAlarmInfoByPiggery.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var pig_alarm = res.msg;
                    var pig_alarm_old = that.data.pig_alarm;
                    if(typeof(pig_alarm_old) != "undefined"){
                        if(pig_alarm.length == 0){
                            // 没有了
                            that.setData({isEnd:true})
                        }else{
                            if(page == that.data.page + 1){
                                pig_alarm_old.push.apply(pig_alarm_old,pig_alarm);
                                that.setData({page:page})
                            }else if(page == 0){
                                pig_alarm_old = pig_alarm;
                                that.setData({page:page})
                            }else{
                                // nodo
                            }
                        }
                    }else{
                        // 第一次进入
                        pig_alarm_old = pig_alarm;
                    }
                    that.setData({pig_alarm: pig_alarm_old})
                } else {
                    box.showToast(res.msg)
                }
                that.setData({loading:false})
            }
        })
    },
    //********上拉加载**************************************
    onReachBottom() {
        var that = this;
        if(!that.data.loading && !that.data.isEnd){
            var page = that.data.page + 1;
            that.getPigAlarm(page);
        }else{
            // nodo
        }
    },
})