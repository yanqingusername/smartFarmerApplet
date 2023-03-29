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

    workstation_name: '',
    workstation_id: '',
    workstationList: [],
    workstationIndex: 0,
    isShowWorkstation: 1,

    siteareaid: "",
    old_workstation_id: ''
  },
  onShow: function () {
    
  },
  onLoad: function (options) {
    this.setData({
      uid: options.id,
      role_name: options.name || '',
      role_id: options.aid || '',
      workstation_id: options.hostid || '',
      workstation_name: options.hostname || '',
      siteareaid: options.siteareaid || '',
      old_workstation_id: options.hostid || '',
    });
    wx.setNavigationBarTitle({
      title: "编辑饲养员"
    })

    if(this.data.role_id && this.data.role_name){
      this.setData({
        isShowRoleName: 2
      });
    }

    if(this.data.workstation_id && this.data.workstation_name){
      this.setData({
        isShowWorkstation: 2
      });
    }


    this.getEmployeesList();
    this.getWorkstationList();

  },
  // 获取工作站
  getWorkstationList: function () {
    var that = this;
    var data = {
      pig_farm_id: app.globalData.userInfo.pig_farm_id
    }
    request.request_get('/PigstyManagement/getHostList.hn', data, function (res) {

      if (res.success) {
        var workstationList = res.data;
        that.setData({
          workstationList: workstationList
        })
      } else {
        box.showToast(res.msg)
      }
    })
  },
  // 工作站
  bindPickerChangeWorkstation: function (e) {
    var workstationIndex = e.detail.value;
    this.setData({
      workstationIndex: workstationIndex,
      workstation_name: this.data.workstationList[workstationIndex].host_name,
      workstation_id: this.data.workstationList[workstationIndex].id,
      isShowWorkstation: 2
    });
    this.checkSubmitStatus();
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
    if (this.data.role_id != '' && this.data.role_name != '' && this.data.workstation_id != '' && this.data.workstation_name != '') {
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
    let role_id = this.data.role_id; //姓名
    let role_name = this.data.role_name; //姓名
    let workstation_id = this.data.workstation_id; //工作站id
    let workstation_name = this.data.workstation_name; //工作站名称

    if (!role_id && !role_name) {
      box.showToast("请选择饲养员");
      return;
    }

    if (!workstation_id && !workstation_name) {
      box.showToast("请选择工作站");
      return;
    }

    let params = {
      pig_farm_id: app.globalData.userInfo.pig_farm_id,
      userId: role_id, //姓名
      door: this.data.uid,
      HostId: workstation_id, //工作站id
      Sitearea: this.data.siteareaid, //场区id
      HostIdOld: this.data.old_workstation_id //原工作站id
    }

    request.request_get("/PigstyManagement/editadministrators.hn", params, function (res) {
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