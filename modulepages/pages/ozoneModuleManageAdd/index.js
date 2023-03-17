const app = getApp()
var request = require('../../../utils/request.js')
var box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // title:"",
    name: "",
    position: "",
    submitState: true,
    

    concentration: '',
    time: "",
    managePersionIds:"",
    managePersion: '',
    selectPersionList: [],

    approvalPersionIds: "",
    approvalPersion: "",
    approvalPersionList: [],

    isEditCus: 1,  //  1-新增   2-编辑
    uid: '',

    isName: false,
    isPosition: false

  },
  onShow: function () {

    this.checkSubmitStatus();
  },
  onLoad: function (options) {
    this.setData({
      isEditCus: options.isEditCus || 1,
      uid: options.uid
    });
    wx.setNavigationBarTitle({
      title: this.data.isEditCus == 1 ? "新增设备信息" : "编辑设备信息"
    })

    if(this.data.uid && this.data.isEditCus == 2){
      this.getdeviceinfobyid();
    }

  },
  getdeviceinfobyid(){
    let that = this
    let params = {
      pig_farm_id: app.globalData.userInfo.pig_farm_id,
      id: this.data.uid,
    }

    request.request_get('/equipmentManagement/getdeviceinfobyid.hn', params, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          if(res.data && res.data.length > 0){
            let deviceInfo = res.data[0]
            that.setData({
              isName: true,
              isPosition: true,
              name: deviceInfo.sn,
              position: deviceInfo.address,
              time: deviceInfo.duration,
              concentration: deviceInfo.concentration,
            });
          }

          if(res.resforcontroller && res.resforcontroller.length > 0){
            
            let resforcontroller = res.resforcontroller
            let managePersionIds = [];
            let managePersion = [];
            for(let j = 0; j < resforcontroller.length; j++) {
              managePersion.push(resforcontroller[j].name);
              managePersionIds.push(resforcontroller[j].id);
            }

            that.setData({
              managePersionIds:managePersionIds.join(','),
              managePersion: managePersion.join(','),
              selectPersionList: resforcontroller,
            });

          }

          if(res.resforreviewer && res.resforreviewer.length > 0){
            let resforreviewer = res.resforreviewer
            let approvalPersionIds = [];
            let approvalPersion = [];
            for(let j = 0; j < resforreviewer.length; j++) {
              approvalPersion.push(resforreviewer[j].name);
              approvalPersionIds.push(resforreviewer[j].id);
            }

            that.setData({
              approvalPersionIds:approvalPersionIds.join(','),
              approvalPersion: approvalPersion.join(','),
              approvalPersionList: resforreviewer,
            });
          }

          that.checkSubmitStatus();
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  //保存按钮禁用判断
  checkSubmitStatus: function (e) {
    if (this.data.name != '' && this.data.position != '' && this.data.concentration != '' && this.data.time != '' && this.data.managePersion != '' && this.data.approvalPersion != '') {
      this.setData({
        submitState: false
      })
    } else {
      this.setData({
        submitState: true
      })
    }
  },
  inputTap(e){
    var that = this
    wx.hideKeyboard()
    setTimeout(function(){
      that.setData({
        focusId: e.currentTarget.id
      })
    },200)
  },
  bindTitle: function (e) {
    var str = e.detail.value;
    // str = utils.checkInput_2(str);
    this.setData({
      title: str
    })

    this.checkSubmitStatus();
  },
  bindName: function (e) {
    var str = e.detail.value;
    // str = utils.checkInput_2(str);
    this.setData({
      name: str
    })

    this.checkSubmitStatus();
  },
  bindPosition: function (e) {
    var str = e.detail.value;
    this.setData({
      position: str
    })

    this.checkSubmitStatus();
  },
  bindTime: function (e) {
    var str = e.detail.value;
    // str = utils.checkInput_2(str);
    this.setData({
      time: str
    })

    this.checkSubmitStatus();
  },
  bindConcentration: function (e) {
    var str = e.detail.value;
    // str = utils.checkInput_2(str);
    this.setData({
      concentration: str
    })

    this.checkSubmitStatus();
  },
  submitBuffer() {
    let that = this;
    let name = this.data.name;
    let position = this.data.position;
    let time = this.data.time;
    let concentration = this.data.concentration;
    let managePersion = this.data.managePersion;
    let approvalPersion = this.data.approvalPersion;

    let managePersionIds = this.data.managePersionIds;
    let approvalPersionIds = this.data.approvalPersionIds;

    if (!name) {
      box.showToast("请输入设备编号");
      return;
    }

    if (!position) {
      box.showToast("请输入设备位置");
      return;
    }

    if (!time) {
      box.showToast("请输入臭氧有效时长(分钟)");
      return;
    }

    if (!concentration) {
      box.showToast("请输入臭氧有效浓度(mg/m3)");
      return;
    }

    if (!managePersion && !managePersionIds) {
      box.showToast("请选择设备管理员");
      return;
    }

    if (!approvalPersion && !approvalPersionIds) {
      box.showToast("请选择审批人");
      return;
    }

    
    // return

    if(this.data.isEditCus == 2){
      let params1 = {
        id: this.data.uid,
        sn: name, //设备编号
        controller: managePersionIds, //（管理者）
        address: position, //位置描述
        reviewer: approvalPersionIds, //(审核者)
        duration: time, //（（时长）
        concentration: concentration, //（浓度）
      }

      console.log('---->:',params1)
      request.request_get('/equipmentManagement/editdeviceinfo.hn', params1, function (res) {
        console.info('回调', res)
        if (res) {
          if (res.success) {
            wx.navigateBack({
              delta: 1,
            });
          } else {
            box.showToast(res.msg);
          }
        } else {
          box.showToast("网络不稳定，请重试");
        }
      })
    }else{
      let params = {
        pig_farm_id: app.globalData.userInfo.pig_farm_id,
        type: '2',
        sn: name, //设备编号
        address: position, //位置描述
        controller: managePersionIds, //（管理者）
        reviewer: approvalPersionIds, //(审核者)
        duration: time, //（（时长）
        concentration: concentration, //（浓度）
      }
  
      console.log('---->:',params)
      request.request_get('/equipmentManagement/addozonedeviceinfo.hn', params, function (res) {
        console.info('回调', res)
        if (res) {
          if (res.success) {
            wx.navigateBack({
              delta: 1,
            });
          } else {
            box.showToast(res.msg);
          }
        } else {
          box.showToast("网络不稳定，请重试");
        }
      })
    }
  },
  bindDeleteClick(e) {
    let that = this;
    let id = this.data.uid;
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
                  wx.navigateBack({
                    delta: 1,
                  });
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
  clickOzoneModuleManagePersion(){
    wx.navigateTo({
      url:`/modulepages/pages/ozoneModuleManagePersion/index?idlist=${this.data.managePersionIds}`
    });
  },
  clickOzoneModuleApprovalPersion(){
    wx.navigateTo({
      url:`/modulepages/pages/ozoneModuleApprovalPersion/index?idlist=${this.data.approvalPersionIds}`
    });
  },
})