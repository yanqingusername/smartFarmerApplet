const app = getApp();
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')

Page({
	data:{
        page: 1,
        limit: 10,
        deviceinfoList: [],
        id: ""
	},
    onLoad:function(options) {
      var that = this;
        this.setData({
          id: options.eid
        });
        
        that.getdeviceinfo();
    },
    onShow:function(){
        
    },
    onReachBottom: function () {
        this.getdeviceinfo();
      },
    getdeviceinfo:function(){
        var that = this;
        var data = {
            page: that.data.page,
            limit: that.data.limit,
            id: that.data.id
        }
        request.request_get('/iwadom/getspecificIwadominfo.hn', data, function (res) {
            if (res) {
                if (res.success) {
                  if (that.data.page == 1) {
                    that.setData({
                        deviceinfoList: res.data,
                      page: (res.data && res.data.length > 0) ? that.data.page + 1 : that.data.page
                    });
                  } else {
                    that.setData({
                        deviceinfoList: that.data.deviceinfoList.concat(res.data || []),
                      page: (res.data && res.data.length > 0) ? that.data.page + 1 : that.data.page,
                    });
                  }
                } else {
                  box.showToast(res.msg);
                }
              }
        })
    },
    //预览图片，放大预览
  preview: function (e) {
    let currentUrl = e.currentTarget.dataset.url
    if(currentUrl){
      wx.previewImage({
        current: currentUrl, // 当前显示图片的http链接
        urls: [currentUrl] // 需要预览的图片http链接列表
      })
    }
  },
});