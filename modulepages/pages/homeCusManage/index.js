const app = getApp();
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({
  data: {
    page: 1,
    limit: 10,
    employeesList: [],
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
    this.getEmployeesList();
  },
  onReachBottom: function () {
    this.getEmployeesList();
  },
  getEmployeesList: function () {
    var that = this;
    var data = {
      page: that.data.page,
      limit: that.data.limit,
      company_serial: app.globalData.userInfo.company_serial
    }
    request.request_get('/personnelManagement/getEmployeesList.hn', data, function (res) {
      if (res) {
        if (res.success) {
          if (that.data.page == 1) {
            that.setData({
              employeesList: res.info,
              page: (res.info && res.info.length > 0) ? that.data.page + 1 : that.data.page
            });
          } else {
            that.setData({
              employeesList: that.data.employeesList.concat(res.info || []),
              page: (res.info && res.info.length > 0) ? that.data.page + 1 : that.data.page,
            });
          }
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
  bindAddCus(){
    wx.navigateTo({
      url:`/modulepages/pages/homeCusAdd/index`
    });
  },
  bindEditCus(e){
    let uid = e.currentTarget.dataset.uid;
    if(uid){
      wx.navigateTo({
        url:`/modulepages/pages/homeCusAdd/index?isEditCus=2&uid=${uid}`
      });
    }
  },
});