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
    isPosition: false,

    positionList: [],
    positionIndex: 0,
    isShowPosition: 1,
    position_id: '',
    position_name: '',

    serviceList: [{
      id: '1',
      title: '单门门禁'
    },{
      id: '2',
      title: '双门门禁'
    }],
    serviceIndex: 0,
    isShowService: 2,
    service_id: '1',
    service_name: '单门门禁',

    doorType1Index: 0,
    isShowDoorType1: 1,
    doorType1_id: '',
    doorType1_name: '',
    doorType2Index: 0,
    isShowDoorType2: 1,
    doorType2_id: '',
    doorType2_name: '',

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
      this.getPositionList(2);
    } else {
      this.getPositionList(1);
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
              position_name: deviceInfo.address,
              position_id: deviceInfo.layout_id,
              time: deviceInfo.duration,
              concentration: deviceInfo.concentration,

              isShowService: 2,
              service_id: deviceInfo.doortype,
              service_name: deviceInfo.doortype == 1 ? '单门门禁' : '双门门禁',

            });
          
            let doorType1_id = "";
            let doorType1_name = "";
            let doorType2_id = "";
            let doorType2_name = "";
            let accesslayoutId = deviceInfo.Accesslayout_id || deviceInfo.layout_id;
            if(accesslayoutId){
              let accesslayoutIdList = accesslayoutId.split(',');
              
              if(accesslayoutIdList.length > 0){
                if (that.data.positionList.length > 0) {
                  doorType1_id = accesslayoutIdList[0];
                  if(doorType1_id){
                    for (let i = 0; i < that.data.positionList.length; i++) {
                      if (doorType1_id == that.data.positionList[i].id) {
                        doorType1_name = that.data.positionList[i].location_descr
                        break;
                      } else {}
                    }
                  }

                  doorType2_id = accesslayoutIdList[1];
                  if(doorType2_id){
                    for (let i = 0; i < that.data.positionList.length; i++) {
                      if (doorType2_id == that.data.positionList[i].id) {
                        doorType2_name = that.data.positionList[i].location_descr
                        break;
                      } else {}
                    }
                  }
                }
              }
            }
            that.setData({
              doorType1_id: doorType1_id,
              doorType1_name: doorType1_name,
              doorType2_id: doorType2_id,
              doorType2_name: doorType2_name,
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
    if (this.data.name != '' && this.data.position_name != '' && this.data.concentration != '' && this.data.time != '' && this.data.managePersion != '' && this.data.approvalPersion != '') {
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
      position_name: str
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
  bindServiceChange: function (e) {
    var serviceIndex = e.detail.value;
    this.setData({
      serviceIndex: serviceIndex,
      service_id: this.data.serviceList[serviceIndex].id,
      service_name: this.data.serviceList[serviceIndex].title,
      isShowService: 2,
      doorType2Index: 0,
      isShowDoorType2: 1,
      doorType2_id: '',
      doorType2_name: '',
    });
  },
  bindDoorType1Change: function (e) {
    var doorType1Index = e.detail.value;
    this.setData({
      doorType1Index: doorType1Index,
      doorType1_id: this.data.positionList[doorType1Index].id,
      doorType1_name: this.data.positionList[doorType1Index].location_descr,
      isShowDoorType1: 2
    });
  },
  bindDoorType2Change: function (e) {
    var doorType2Index = e.detail.value;
    this.setData({
      doorType2Index: doorType2Index,
      doorType2_id: this.data.positionList[doorType2Index].id,
      doorType2_name: this.data.positionList[doorType2Index].location_descr,
      isShowDoorType2: 2
    });
  },
  submitBuffer() {
    let that = this;
    let name = this.data.name;
    let position_name = this.data.position_name;
    let position_id = this.data.position_id;
    let time = this.data.time;
    let concentration = this.data.concentration;
    let managePersion = this.data.managePersion;
    let approvalPersion = this.data.approvalPersion;

    let managePersionIds = this.data.managePersionIds;
    let approvalPersionIds = this.data.approvalPersionIds;

    let service_id = this.data.service_id;
    let service_name = this.data.service_name;

    let doorType1_id = this.data.doorType1_id;
    let doorType1_name = this.data.doorType1_name;

    let doorType2_id = this.data.doorType2_id;
    let doorType2_name = this.data.doorType2_name;

    if (!name) {
      box.showToast("请输入设备编号");
      return;
    }

    if (!position_name) {
      box.showToast("请选择设备位置");
      return;
    }

    if (!service_id && !service_name) {
      box.showToast("请选择门禁类型");
      return;
    }

    if (!doorType1_id && doorType1_name) {
      box.showToast("请选择门禁位置");
      return;
    }

    if(service_id == 2){
      if (!doorType2_id && doorType2_name) {
        box.showToast("请选择门禁位置");
        return;
      }
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
        address: position_name, //位置描述
        reviewer: approvalPersionIds, //(审核者)
        duration: time, //（（时长）
        concentration: concentration, //（浓度）
        layout_id: position_id //位置id
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
      let Accesslayout_id = doorType1_id;
      if(service_id == 2){
        Accesslayout_id = Accesslayout_id + "," + doorType2_id;
      }
      let params = {
        pig_farm_id: app.globalData.userInfo.pig_farm_id,
        type: '2',
        sn: name, //设备编号
        address: position_name, //位置描述
        controller: managePersionIds, //（管理者）
        reviewer: approvalPersionIds, //(审核者)
        duration: time, //（（时长）
        concentration: concentration, //（浓度）
        layout_id: position_id, //位置id
        doortype: service_id,
        Accesslayout_id: Accesslayout_id
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
  getPositionList(number) {
    let that = this;
    let params = {
      pig_farm_id: app.globalData.userInfo.pig_farm_id
    }

    request.request_get('/AccessManagement/getAccesslayout.hn', params, function (res) {
      if (res) {
        if (res.success) {
          that.setData({
            positionList: res.data
          });
          if(number == 2){
            that.getdeviceinfobyid();
          }
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    });
  },
  bindPositionChange: function (e) {
    var positionIndex = e.detail.value;
    this.setData({
      positionIndex: positionIndex,
      position_id: this.data.positionList[positionIndex].id,
      position_name: this.data.positionList[positionIndex].location_descr,
      isShowPosition: 2
    });
    this.checkSubmitStatus();
  },
})