const app = getApp();
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({
    data:{
		
    },

    onLoad:function(){
        
    },

    onShow:function(){
       
    },
    bindClickHandler(e){
        let title = e.currentTarget.dataset.title;
        let typestring = e.currentTarget.dataset.number;
        wx.navigateTo({
            url: `/modulepages/pages/mainH5/index?typestring=${typestring}&title=${title}`
        })
    }
})