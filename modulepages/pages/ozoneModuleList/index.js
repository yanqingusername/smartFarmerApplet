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
    that.getzonedevicelist();
  },
  onReachBottom: function () {

  },
  getzonedevicelist: function () {
    var that = this;
    var data = {
      pig_farm_id: app.globalData.userInfo.pig_farm_id
    }
    request.request_get('/equipmentManagement/getzonedevicelist.hn', data, function (res) {
      if (res) {
        if (res.success) {
            that.setData({
              deviceinfoList: res.data,
            });
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
  clickOzoneModuleDetail(e) {
    let sn = e.currentTarget.dataset.sn;
    if(sn){
      wx.navigateTo({
        url: `/modulepages/pages/ozoneModuleDetail/index?sn=${sn}`,
      })
    }
  },
  clickOzoneModuleApproval: function (e) {
    let id = e.currentTarget.dataset.id;
    if(id){
      wx.navigateTo({
        url: `/modulepages/pages/ozoneModuleApproval/index?id=${id}`,
      })
    }
  },
});