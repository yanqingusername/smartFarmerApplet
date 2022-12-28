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
    },
    onLoad: function (){
        console.log('物品报警');
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
            pig_farm: app.globalData.userInfo.pig_farm_id,
            page: page,
            limit:that.data.limit,
        }
        request.request_get('/AccessManagement/getFarmAccessAlarm.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var alarm_info = res.msg;
                    var alarm_info_all = that.data.alarm_info;
                    if(typeof(alarm_info_all) != "undefined"){
                        if(alarm_info.length == 0){// 没有了
                            that.setData({isEnd:true})
                        }else{
                            if(page == that.data.page + 1){
                                alarm_info_all.push.apply(alarm_info_all,alarm_info);
                                that.setData({page:page})
                            }else if(page == 0){
                                alarm_info_all = alarm_info;
                                that.setData({page:page})
                            }
                        }
                    }else{ // 第一次进入
                        alarm_info_all = alarm_info;
                    }
                    that.setData({alarm_info: alarm_info_all})
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

    //门禁的记录
    goRecords:function(){
        wx.navigateTo({
            url: '/pages/abnormal/access_records',
        })
    },
    openImage:function(e){
        var that = this;
        var img = e.currentTarget.dataset.img;
        var imageList = []
        imageList.push(img)
        wx.previewImage({
            //所有图片
            urls: imageList
        })
    },
})