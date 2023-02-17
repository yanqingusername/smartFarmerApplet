const app = getApp();
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')

Page({
  data: {
    page: 1,
    limit: 5,
    deviceinfoList: [],
  },
  onLoad: function (options) {
    
  },
  onShow: function () {
    var that = this;
    that.getAbnormalLabelInfo();
  },
  onReachBottom: function () {
  },
  getAbnormalLabelInfo: function () {
    var that = this;
    var data = {
      pig_farm_id: app.globalData.userInfo.pig_farm_id,
    }

    request.request_get('/PigstyManagement/getPigstyManagementList.hn', data, function (res) {
      if (res) {
        if (res.success) {
          that.setData({
            deviceinfoList: res.data
          });
          // if (that.data.page == 1) {
          //   that.setData({
          //     deviceinfoList: res.data,
          //     page: (res.data && res.data.length > 0) ? that.data.page + 1 : that.data.page
          //   });
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
  bindPigDoorDormAdd(e) {
    wx.navigateTo({
      url: `/modulepages/pages/pigDoorDormAdd/index`,
    });
  },
  updatePigDoorDormAdd(e) {
    let id = e.currentTarget.dataset.id;
    let name = e.currentTarget.dataset.name;
    if (id) {
      wx.navigateTo({
        url: `/modulepages/pages/pigDoorDormAdd/index?isDoor=2&siteareaid=${id}&name=${name}`,
      });
    }
  },
  updatePigDoorDormPersion(e) {
    let id = e.currentTarget.dataset.id;
    let name = e.currentTarget.dataset.name;
    if (id) {
      wx.navigateTo({
        url: `/modulepages/pages/pigDoorDormPersion/index?id=${id}&name=${name}`,
      });
    }
  },
  deletePigDoorDorm(e) {
    let id = e.currentTarget.dataset.id;
    if (id) {
      wx.showModal({
        title: '确认删除该栋舍？',
        content: '删除后无法恢复',
        success: function (res) {
          if (res.confirm) {
            var data = {
              id: id,
            }
            request.request_get('/personnelManagement/deleteEmployee.hn', data, function (res) {
              if (res) {
                if (res.success) {
                  box.showToast(res.msg);
                  //   setTimeout(()=>{
                  //     wx.navigateBack({
                  //       delta: 1,
                  //     });
                  //   },1500);
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
});