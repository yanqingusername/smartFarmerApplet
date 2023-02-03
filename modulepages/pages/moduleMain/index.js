const app = getApp();
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({
    data:{
		selectedType: 0,
        offlinesumLY: "", //离线 洗消一体
        runningsumLY: "", //运行 洗消一体
        offlinesumXZH: "", //离线 熏蒸
        runningsumXZH: "", //运行 熏蒸
    },

    onLoad:function(){
        this.getdeviceIndex();
        this.getdeviceIndex2();
    },

    onShow:function(){
        
    },
    // 获取首页设备统计运行和离线数量详情
    getdeviceIndex:function(){
        var that = this;
        var data = {
            type: 1, //  1--洗消一体 2--熏蒸
            pig_farm_id: app.globalData.userInfo.pig_farm_id
        }
        request.request_get('/equipmentManagement/getdeviceIndex.hn', data, function (res) {
            console.info('回调', res)
            if(res.success){
                that.setData({
                    offlinesumLY: res.offlinesum, //离线 洗消一体
                    runningsumLY: res.runningsum, //运行 洗消一体
                });
            }else{
                box.showToast(res.msg)
            }
        })
    },
    // 获取首页设备统计运行和离线数量详情
    getdeviceIndex2:function(){
        var that = this;
        var data = {
            type: 2, //  1--洗消一体 2--熏蒸
            pig_farm_id: app.globalData.userInfo.pig_farm_id
        }
        request.request_get('/equipmentManagement/getdeviceIndex.hn', data, function (res) {
            console.info('回调', res)
            if(res.success){
                that.setData({
                    offlinesumXZH: res.offlinesum, //离线 洗消一体
                    runningsumXZH: res.runningsum, //运行 洗消一体
                });
            }else{
                box.showToast(res.msg)
            }
        })
    },
    // 类型切换
    selectFunc:function(e){
        var that = this;
        var initType = that.data.selectedType;
        var type = e.currentTarget.dataset.type;
        if(type != initType){
            
            that.setData({selectedType: type})
        }
    },
    //淋浴一体机模块
    bindClickHandler(){
        wx.navigateTo({
            url: '/modulepages/pages/homeIndex/index',
        })
    },
    //臭氧模块
    ozoneBindClickHandler(){
        wx.navigateTo({
            url: '/modulepages/pages/ozoneModuleList/index?eid=1',
        })
    },
    //淋浴一体机设备管理
    catchHandler:function(e){
        let pathstring = e.currentTarget.dataset.pathstring;
        let title = e.currentTarget.dataset.title;
        if(pathstring && title){
            wx.navigateTo({
                url: pathstring + "?title=" + title,
            });
        }
    },
})