const app = getApp();
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')

Page({
  data: {
    page: 1,
    limit: 5,
    deviceinfoList: [],
    pigNumber: '0'
  },
  onLoad: function (options) {
    var that = this;
    that.getAbnormalLabelInfo();
  },
  onShow: function () {
    
  },
  onReachBottom: function () {
    this.getAbnormalLabelInfo();
  },
  getAbnormalLabelInfo: function () {
    var that = this;
    var data = {
      pig_farm_id: app.globalData.userInfo.pig_farm_id,
      page: that.data.page,
      limit: that.data.limit,
    }
    request.request_get('/pigManagement/getAbnormalLabelInfo.hn', data, function (res) {
      if (res) {
        if (res.success) {
            if (that.data.page == 1) {
              that.setData({
                pigNumber: res.count,
                deviceinfoList: res.data,
                page: (res.data && res.data.length > 0) ? that.data.page + 1 : that.data.page
              });
            } else {
              that.setData({
                // pigNumber: res.count,
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
  clickPigAbnormalModuleInfo(e) {
    let item = e.currentTarget.dataset.item;
    if(item){
      let jsonItem = JSON.stringify(item);
      wx.navigateTo({
        url: `/modulepages/pages/pigAbnormalModuleInfo/index?jsonItem=${jsonItem}`,
      })
    }
  },
});