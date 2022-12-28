const app = getApp()
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')
const bluetooth = require('../../utils/bluetooth.js')

Page({
    data: {
        operationSelect:1,
        loading:false,
        isEnd:false,
        page:0,
        limit:10,
        search_label_id:'',
        label_id:''
    },

    onLoad: function (){
        console.log('进入操作记录页面' );
    },
    onShow:function(){
        var that = this;
        that.getOperationInfo(that.data.page);
    },

    // 操作类型切换
    operationFunc:function(e){
        var that = this;
        var initType = that.data.type;
        var type = e.currentTarget.dataset.type;
        if(type == initType){
            //
        }else{
            // 重置页数信息
            that.setData({operationSelect: type, pig_operation_list: null,isEnd:false,loading:false,page:0,})
            // 置顶
            if (wx.pageScrollTo) {
                wx.pageScrollTo({
                    scrollTop: 0
                })
            } else {
                console.log('当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。')
            }
            that.getOperationInfo(that.data.page);
        }
    },
    // 根据操作获取相应的类型
    getOperationInfo:function(page){
        var that = this;
        that.setData({loading:true})
        var operation = that.data.operationSelect
        var label_id = that.data.label_id;
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id, 
            operation: operation,
            page: page,
            limit:that.data.limit,
            label_id:label_id

        }
        request.request_get('/pigManagement/getPigOperationLog.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var pig_operation_list = res.msg;
                    var pig_operation_list_old = that.data.pig_operation_list;
                    if(typeof(pig_operation_list_old) != "undefined"){
                        if(pig_operation_list.length==0){
                            // 没有了
                            that.setData({isEnd:true})
                        }else{
                            if(page == that.data.page + 1){
                                pig_operation_list_old.push.apply(pig_operation_list_old,pig_operation_list);
                                that.setData({page:page})
                            }else if(page == 0){
                                pig_operation_list_old = pig_operation_list;
                                that.setData({page:page})
                            }else{
                                // nodo
                            }
                        }   
                    }else{
                        // 第一次进入
                        pig_operation_list_old = pig_operation_list;
                    }
                    that.setData({pig_operation_list: pig_operation_list_old})
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
        that.setData({label_id:search_label_id,pig_operation_list: null,isEnd:false,loading:false,page:0,})
        // 置顶
        if (wx.pageScrollTo) {
            wx.pageScrollTo({
                scrollTop: 0
            })
        } else {
            console.log('当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。')
        }
        that.getOperationInfo(that.data.page);
    },
    //********上拉加载**************************************
    onReachBottom() {
        var that = this;
        if(!that.data.loading && !that.data.isEnd){
            var page = that.data.page + 1;
            that.getOperationInfo(page);
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