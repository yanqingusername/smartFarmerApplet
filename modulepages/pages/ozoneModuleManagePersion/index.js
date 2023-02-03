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

    searchText: '',
    isfocus: false,
    isSearch: false,
  },
  onLoad: function (options) {
    this.setData({
      title: options.title
    });

    wx.setNavigationBarTitle({
      title: '选择设备管理员'
    })

    this.setData({
      page: 1
    });
    this.getEmployeesList();
  },
  onShow: function () {
    
  },
  onReachBottom: function () {
    
  },
  getEmployeesList: function () {
    var that = this;
    var data = {
      page: that.data.page,
      limit: that.data.limit,
      company_serial: app.globalData.userInfo.company_serial || 'TJhc'
    }
    request.request_get1('/personnelManagement/getEmployeesList.hn', data, function (res) {
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
  //利用js进行模糊查询
  searchChangeHandle: function (e) {
    this.setData({
      searchText: e.detail.value,
      page: 1
    });

    
      if(e.detail.value){
        this.getEmployeesList();
      }else{
        this.setData({
          searchText: '',
          page: 1,
          employeesList: [],
          isSearch: false
        });
      }
  },
  // 输入框有文字时，点击X清除
  clearSearchHandle() {
      this.setData({
        searchText: '',
        page: 1,
        isSearch: false,
        employeesList: []
      });
  },
});