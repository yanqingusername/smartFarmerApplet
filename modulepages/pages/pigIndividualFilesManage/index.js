const app = getApp();
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')

Page({
  data: {
    page: 1,
    limit: 10,
    deviceinfoList: [],
  },
  onLoad: function (options) {
    
  },
  onShow: function () {
    var that = this;
    that.setData({
      page: 1
    });
    that.getAbnormalLabelInfo();
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
    request.request_get('/pigManagement/getpiglist.hn', data, function (res) {
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
  bindPigIndividualFilesAdd(e) {
    
      wx.navigateTo({
        url: `/modulepages/pages/pigIndividualFilesAdd/index`,
      })
  },
  editPigIndividualFilesAdd(e) {
    let id = e.currentTarget.dataset.id;
    if(id){
        wx.navigateTo({
            url: `/modulepages/pages/pigIndividualFilesAdd/index?isEdit=2&id=${id}`,
        });
    }
  },
});