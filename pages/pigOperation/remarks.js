const app = getApp()
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')
const bluetooth = require('../../utils/bluetooth.js')

Page({
    data: {
        loading:false,
        isEnd:false,
        page:0,
        limit:10,
        search_label_id:'',
        label_id:''
    },

    onLoad: function (){
        console.log('进入问题反馈记录页面' );
    },
    onShow:function(){
        var that = this;
        that.getRemarksInfo(that.data.page);
    },

    // 获取问题反馈记录
    getRemarksInfo:function(page){
        var that = this;
        that.setData({loading:true})
        var label_id = that.data.label_id;
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id, 
            page: page,
            limit:that.data.limit,
            label_id:label_id

        }
        request.request_get('/pigManagement/getProblemFeedback.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var remarks_list = res.msg;
                    var remarks_list_old = that.data.remarks_list;
                    if(typeof(remarks_list_old) != "undefined"){
                        if(remarks_list.length==0){
                            // 没有了
                            that.setData({isEnd:true})
                        }else{
                            if(page == that.data.page + 1){
                                remarks_list_old.push.apply(remarks_list_old,remarks_list);
                                that.setData({page:page})
                            }else if(page == 0){
                                remarks_list_old = remarks_list;
                                that.setData({page:page})
                            }else{
                                // nodo
                            }
                        }   
                    }else{
                        // 第一次进入
                        remarks_list_old = remarks_list;
                    }
                    that.setData({remarks_list: remarks_list_old})
                } else {
                    box.showToast(res.msg)
                }
            }
            that.setData({loading: false})
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
        
        // 重置页数信息
        that.setData({label_id:search_label_id,remarks_list: null,isEnd:false,loading:false,page:0,})
        // 置顶
        if (wx.pageScrollTo) {
            wx.pageScrollTo({
                scrollTop: 0
            })
        } else {
            console.log('当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。')
        }
        that.getRemarksInfo(that.data.page);
    },
    //********上拉加载**************************************
    onReachBottom() {
        var that = this;
        if(!that.data.loading && !that.data.isEnd){
            var page = that.data.page + 1;
            that.getRemarksInfo(page);
        }else{
            // nodo
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