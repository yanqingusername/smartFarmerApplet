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
    isShowdata: false
  },
  onLoad: function (options) {
    this.setData({
      title: options.title
    });

    wx.setNavigationBarTitle({
      title: options.title
    });
    this.getEmployeesList();
  },
  onShow: function () {
    if(this.data.isShowdata){
      this.setData({
        page: 1
      });
      this.getEmployeesList();
    }
    
  },
  onReachBottom: function () {
    this.getEmployeesList();
  },
  /**
   * 获取员工信息列表
   */
  getEmployeesList: function () {
    var that = this;
    var data = {
      page: that.data.page,
      limit: that.data.limit,
      pig_farm_id: app.globalData.userInfo.pig_farm_id
      // company_serial: app.globalData.userInfo.company_serial
    }
    request.request_get('/personnelManagement/getEmployeesLists.hn', data, function (res) {
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
    this.setData({
      isShowdata: false
    });
    wx.navigateTo({
      url:`/modulepages/pages/homeCusAdd/index`
    });
  },
  bindEditCus(e){
    let uid = e.currentTarget.dataset.uid;
    if(uid){
      this.setData({
        isShowdata: false
      });
      wx.navigateTo({
        url:`/modulepages/pages/homeCusAdd/index?isEditCus=2&uid=${uid}`
      });
    }
  },
});