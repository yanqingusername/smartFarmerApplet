const app = getApp();
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({
    data:{
		selectedType: 0,
    },

    onLoad:function(){
        
    },

    onShow:function(){
        
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