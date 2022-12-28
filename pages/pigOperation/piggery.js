const app = getApp()
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')
const bluetooth = require('../../utils/bluetooth.js')

Page({
    data: {
        sty_list:[],
        loading:false,
        search_label_id:'',
        lastTapTime: 0,
        isDisabled: true,
        focus: false,
        pig_house_name: '未知',
        isDisabled2: [],
        focus2: [],
    },

    onLoad: function (options){
        this.setData({
            piggery: options.piggery
        })
        console.log("进入猪舍页面" + options.piggery);
    },

    onShow:function(){
        this.get_sty()
    },
    doubleClick: function (e) {
        var that = this;
        var lastTime = that.data.lastTapTime;
        var curTime = e.timeStamp
        if (curTime - lastTime > 0) {
            if (curTime - lastTime < 300) { //是双击事件
                that.setData({
                    isDisabled: false,
                    focus: true
                })
            }
        }
        that.setData({
            lastTapTime: curTime
        })
    },
    doubleClick2: function (e) {
        var that = this;
        var lastTime = that.data.lastTapTime;
        var curTime = e.timeStamp;
        var bindex = e.currentTarget.dataset.bindex;
        if (curTime - lastTime > 0) {
            if (curTime - lastTime < 300) { //是双击事件
                that.data.isDisabled2[bindex] = false;
                that.data.focus2[bindex] = true;
                that.setData({
                    isDisabled2: that.data.isDisabled2,
                    focus2: that.data.focus2
                })
            }
        }
        that.setData({
            lastTapTime: curTime
        })
    },
    saveData: function (e) {
        var that = this;
        var values = e.detail.value;
        that.setData({
            isDisabled: true
        })
        //保存数据
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id,
            type: 2,
            name: values
        }
        request.request_get('/pigManagement/updatePigHouseAlias.hn', data, function (res) {
            //console.info('回调', res)
            if (res) {
                if (!res.success) {
                    box.showToast(res.msg)
                }
            }
        })
    },
    saveData2: function (e) {
        var that = this;
        var id = e.currentTarget.dataset.id;
        var bindex = e.currentTarget.dataset.bindex;
        var disabled = e;
        var values = e.detail.value;
        console.log(e.currentTarget);
        console.log(id);
        console.log(disabled);
        that.data.isDisabled2[bindex] = true;
        that.setData({
            isDisabled2: that.data.isDisabled2
        })
        //保存数据
        var data = {
            id: id,
            new_name: values
        }
        request.request_get('/pigManagement/updatePigStyName.hn', data, function (res) {
            //console.info('回调', res)
            if (res) {
                if (!res.success) {
                    box.showToast(res.msg)
                }
            }
        })
    },
    //获取猪栏**************************
    get_sty:function(){
        var that = this;
        var piggery_number = that.data.piggery
        that.setData({loading:true})
        var data = {
            piggery_number: piggery_number
        }
        request.request_get('/pigManagement/getStyAndSketch.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var sty_list = res.msg;
                    var isDisabled2 = [];
                    var focus2 = [];
                    for (let index = 0; index < sty_list.length; index++) {
                        isDisabled2.push(true);
                        focus2.push(false);
                    }
                    console.log(isDisabled2);
                    that.setData({
                        sty_list: sty_list,
                        isDisabled2: isDisabled2,
                        focus2: focus2
                    });
                } else {
                    box.showToast(res.msg)
                }
            }
            that.setData({loading:false})
        })

        var data_pig_house_name = {
            pig_farm: app.globalData.userInfo.pig_farm_id,
            type: 2
        }
        request.request_get('/pigManagement/getPigHouseAlias.hn', data_pig_house_name, function (res) {
            //console.info('回调', res)
            if (res) {
                if (res.success) {
                    var pig_house_name = res.msg;
                    that.setData({
                        pig_house_name: pig_house_name
                    });
                }
            }
        })
    },

    // 进入猪栏*****************************
    enter_sty:function(e){
        var sty_number = e.currentTarget.dataset.sty_number;
        wx.navigateTo({
            url: '/pages/pigOperation/sty?sty=' + sty_number,
        })
    },

    //*******搜索耳环号 */
    searchInput:function(e){
        var that = this;
        console.log('输入的耳环号' + e.detail.value)
        that.setData({
            search_label_id: e.detail.value,
        })
    },
    search:function(){
        var that = this;
        var search_label_id = that.data.search_label_id;
        search_label_id = search_label_id.replace(/\s+/g, '');
        console.log('查找的耳环号' + search_label_id);
        if(search_label_id == ''){
            box.showToast('请输入耳环编号')
        }else{
            var data = {
                pig_farm:app.globalData.userInfo.pig_farm_id,
                label_id: search_label_id,
            }
            request.request_get('/pigManagement/getPositionInfoById.hn', data, function (res) {
                console.info('回调', res)
                if (res) {
                    if (res.success) {
                        var name = res.name;
                        var sty_number = res.sty_number;
                        wx.showModal({
                            title: '提示',
                            content: '耳环:'+search_label_id+'\n'+ name,
                            cancelText:'取消',
                            confirmText:'进入猪栏',
                            success: function (res) {
                                if (res.confirm) {
                                    wx.navigateTo({
                                        url: '/pages/pigOperation/sty?sty=' + sty_number + '&label_id=' + search_label_id,
                                    })
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

    inputFocus:function() {
        // 输入框聚焦，判断是否开启蓝牙输入功能
        console.log("输入框聚焦");
        var bluetoothStatus = app.globalData.bluetoothStatus;
        var bluetoothInfo = app.globalData.bluetoothInfo;
        if(bluetoothStatus){
            bluetooth.get_device_value(bluetoothInfo,this.bluetoothRollback)
        } 
    },

    bluetoothRollback:function (text) {
        console.log("蓝牙设备的返回值" + text);
        this.setData({search_label_id:text});
    }
})