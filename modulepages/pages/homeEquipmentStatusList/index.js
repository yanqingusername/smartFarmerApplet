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
        this.setData({
          id: options.eid
        });
    },
    onShow:function(){
        var that = this;
        that.getdeviceinfo();
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
});