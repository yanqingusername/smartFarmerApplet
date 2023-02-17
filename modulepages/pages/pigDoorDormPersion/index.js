const app = getApp()
var request = require('../../../utils/request.js')
var box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    submitState: true,
    uid: '',

    role_name: '',
    role_id: '',
    roleNameList: [],
    roleNameIndex: 0,
    isShowRoleName: 1,
  },
  onShow: function () {
    
  },
  onLoad: function (options) {
    this.setData({
      uid: options.id,
      role_name: options.name,
      role_id: options.role_id
    });
    wx.setNavigationBarTitle({
      title: "编辑饲养员"
    })

    if(this.data.role_name){
      this.setData({
        isShowRoleName: 2
      });
    }

    this.getEmployeesList();

  },
  // 获取员工列表
  getEmployeesList: function () {
    var that = this;
    var data = {
      pig_farm: app.globalData.userInfo.pig_farm_id
    }
    request.request_get('/personnelManagement/getEmployeesList.hn', data, function (res) {
      console.info('回调', res)
      if (res.success) {
        var roleNameList = res.msg;
        that.setData({
          roleNameList: roleNameList
        })
      } else {
        box.showToast(res.msg)
      }
    })
  },
  // 饲养员
  bindPickerChangeRoleName: function (e) {
    var roleNameIndex = e.detail.value;
    this.setData({
      roleNameIndex: roleNameIndex,
      role_name: this.data.roleNameList[roleNameIndex].real_name,
      role_id: this.data.roleNameList[roleNameIndex].id,
      isShowRoleName: 2
    });
    this.checkSubmitStatus();
  },
  //保存按钮禁用判断
  checkSubmitStatus: function (e) {
    if (this.data.role_name != '') {
      this.setData({
        submitState: false
      })
    } else {
      this.setData({
        submitState: true
      })
    }
  },
  submitBuffer() {
    let that = this;
    let role_name = this.data.role_name; //姓名

    if (!role_name) {
      box.showToast("请输入姓名");
      return;
    }

    

    let params = {
      pig_farm_id: app.globalData.userInfo.pig_farm_id,
      role_name: role_name, //姓名
      id: this.data.uid
    }

    console.log('---->:',params)

    request.request_get("/personnelManagement/edituserinfo.hn", params, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          box.showToast(res.msg);

          setTimeout(()=>{
            wx.navigateBack({
              delta: 1,
            });
          },1500);
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })

  },
})