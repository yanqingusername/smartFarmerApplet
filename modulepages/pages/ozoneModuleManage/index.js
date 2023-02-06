const app = getApp();
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')

Page({
  data: {
    page: 1,
    limit: 10,
    deviceinfoList: [],
    title: "",
  },
  onLoad: function (options) {
    this.setData({
      title: options.title
    });

    wx.setNavigationBarTitle({
      title: options.title
    })
  },
  onShow: function () {
    this.setData({
      page: 1
    });
    this.getdeviceinfo();
  },
  onReachBottom: function () {
    // this.getdeviceinfo();
  },
  getdeviceinfo: function () {
    var that = this;
    var data = {
      // page: that.data.page,
      // limit: that.data.limit,
      pig_farm_id: app.globalData.userInfo.pig_farm_id,
      type: "2"
    }
    request.request_get('/equipmentManagement/getzonedevicelistinfo.hn', data, function (res) {
      if (res) {
        if (res.success) {
          // if (that.data.page == 1) {
            that.setData({
              deviceinfoList: res.data,
              // page: (res.data && res.data.length > 0) ? that.data.page + 1 : that.data.page
            });
          // } else {
          //   that.setData({
          //     deviceinfoList: that.data.deviceinfoList.concat(res.data || []),
          //     page: (res.data && res.data.length > 0) ? that.data.page + 1 : that.data.page,
          //   });
          // }
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
  bindAddEquipment() {
    wx.navigateTo({
      url: `/modulepages/pages/ozoneModuleManageAdd/index`
    });
  },
  bindEditCus(e){
    let uid = e.currentTarget.dataset.uid;
    if(uid){
      wx.navigateTo({
        url:`/modulepages/pages/ozoneModuleManageAdd/index?isEditCus=2&uid=${uid}`
      });
    }
  },
});