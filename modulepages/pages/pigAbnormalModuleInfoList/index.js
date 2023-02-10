const app = getApp();
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')

Page({
  data: {
    page: 1,
    limit: 10,
    deviceinfoList: [],
    label_id: '',
    isEmpty: false
  },
  onLoad: function (options) {
    this.setData({
      label_id: options.label_id
    });

    this.getColumntransferrecord();
  },
  onShow: function () {
    
  },
  onReachBottom: function () {
    this.getColumntransferrecord();
  },
  getColumntransferrecord: function () {
    var that = this;
    var data = {
      label_id: that.data.label_id,
      pig_farm_id: app.globalData.userInfo.pig_farm_id,
      page: that.data.page,
      limit: that.data.limit,
    }
    request.request_get('/pigManagement/getColumntransferrecord.hn', data, function (res) {
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

            if(that.data.deviceinfoList.length == 0){
              that.setData({
                isEmpty: true
              });
            }
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
});