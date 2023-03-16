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
    });
  },
  onShow: function () {
    this.setData({
      page: 1
    });
    this.getForeignMatterManageList();
  },
  onReachBottom: function () {
    this.getForeignMatterManageList();
  },
  getForeignMatterManageList: function () {
    var that = this;
    var data = {
      page: that.data.page,
      limit: that.data.limit,
      pig_farm: app.globalData.userInfo.pig_farm_id
    }
    request.request_get('/equipmentManagement/getForeignMatterManageList.hn', data, function (res) {
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
  bindDeleteClick(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    if (id) {
      wx.showModal({
        title: '是否删除设备?',
        content: '删除设备后无法恢复',
        success: function (res) {
          if (res.confirm) {
            var data = {
              id: id,
              status: '1'
            }
            request.request_get('/equipmentManagement/deletedeviceinfo.hn', data, function (res) {
              if (res) {
                if (res.success) {
                  that.setData({
                    page: 1
                  });
                  that.getForeignMatterManageList();
                } else {
                  box.showToast(res.msg);
                }
              }
            })
          }
        }
      })
    }
  },
  bindAddEntranceGuardManage() {
    wx.navigateTo({
      url: `/modulepages/pages/foreignMatterManageAdd/index`
    });
  },
});