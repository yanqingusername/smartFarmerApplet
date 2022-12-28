const app = getApp()
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')

Page({
    data:{  
        sty_url:''
    },

    onLoad: function (options){
        const x = "https://www.prohealth-wch.com/camera.html"+"?sty="+options.sty
        this.setData({
            sty_url: x
        })
    },

    onShow:function(){

    }
})