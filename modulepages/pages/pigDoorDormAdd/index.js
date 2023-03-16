const app = getApp()
var request = require('../../../utils/request.js')
var box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

/**
 * Detail类 构造函数 
 * @param {string} dorm_content 栏位名称
 * @param {string} dorm_start 栏号
 * @param {string} dorm_end 栏号
 */
function Detail(dorm_content, dorm_start, dorm_end) {
  this.dorm_content = dorm_content;
  this.dorm_start = dorm_start;
  this.dorm_end = dorm_end;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isDoor: 1, //1-新增猪舍  2-新增栋舍
    siteareaid: "",
    name: '',
    doorname: '',
    dormname: '',
    dormnumberstart: '',
    dormnumberend: '',

    info: {
      details: [{
        dorm_content: '',
        dorm_start: '',
        dorm_end: ''
      }]
    },

    role_name: '',
    role_id: '',
    roleNameList: [],
    roleNameIndex: 0,
    isShowRoleName: 1,
    submitState: true,

    isShowName: false,

    workstation_name: '',
    workstation_id: '',
    workstationList: [],
    workstationIndex: 0,
    isShowWorkstation: 1,
  },
  onShow: function () {

  },
  onLoad: function (options) {

    this.setData({
      isDoor: options.isDoor || 1,
      siteareaid: options.siteareaid,
      name: options.name
    });

    if (this.data.name) {
      this.setData({
        isShowName: true
      });
    }

    wx.setNavigationBarTitle({
      title: this.data.isDoor == 1 ? "新增猪舍信息" : "新增栋舍信息"
    })

    this.getEmployeesList();
    this.getWorkstationList();
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
  //保存按钮禁用判断
  checkSubmitStatus: function (e) {
    if (this.data.name != '' && this.data.doorname != '' && this.data.role_name != '' && this.data.role_id != '' && this.data.workstation_name != '' && this.data.workstation_id != '') {
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
  bindName: function (e) {
    var str = e.detail.value;
    // str = utils.checkInput_2(str);
    this.setData({
      name: str
    })

    this.checkSubmitStatus();
  },
  bindDoorName: function (e) {
    var str = e.detail.value;
    // str = utils.checkInput(str);
    this.setData({
      doorname: str
    })

    this.checkSubmitStatus();
  },

  submitBuffer() {
    let that = this;

    let name = this.data.name; //场区名称
    let doorname = this.data.doorname; //栋舍名称

    let role_name = this.data.role_name; //饲养员
    let role_id = this.data.role_id; //饲养员id

    let workstation_name = this.data.workstation_name; //工作站
    let workstation_id = this.data.workstation_id; //工作站id

    let doorDormList = this.data.info.details

    if (!name) {
      box.showToast("请输入场区名称");
      return;
    }

    if (!doorname) {
      box.showToast("请输入栋舍名称");
      return;
    }

    if (doorDormList.length == 1 && doorDormList[0].dorm_content == "" && doorDormList[0].dorm_start == "" && doorDormList[0].dorm_end == "") {
      box.showToast("请填写栏位信息");
      return;
    }

    for (let i = 0; i < doorDormList.length; i++) { //删除双空白项
      if (doorDormList[i].dorm_content == '' && doorDormList[i].dorm_start == '') {
        doorDormList.splice(i, 1);
        i--;
      }
    }

    for (let i in doorDormList) {
      if (doorDormList[i].dorm_content == '' && doorDormList[i].dorm_start != '' || doorDormList[i].dorm_content != '' && doorDormList[i].dorm_start == '') {
        box.showToast("请填写栏位信息");
        return;
      }
      if (doorDormList[i].dorm_end == '') {
        box.showToast("请填写栏位信息");
        return;
      }
    }

    let dormList = []
    for (let i in doorDormList) {
      let number1 = parseInt(doorDormList[i].dorm_start);
      let number2 = parseInt(doorDormList[i].dorm_end);

      if (number1 > 0 && number2 > 0 && number1 <= number2  ) {
        for (let j = number1; j <= number2; j++) {
          dormList.push(doorDormList[i].dorm_content + j + '')
        }
      } else {
        box.showToast("栏号填写错误,请重新填写!");
        return;
      }
    }

    if (!role_name || !role_id) {
      box.showToast("请选择饲养员");
      return;
    }

    if (!workstation_name || !workstation_id) {
      box.showToast("请选择工作站");
      return;
    }

    let dormList1 = [...new Set(dormList)]

    let params = {
      pig_farm_id: app.globalData.userInfo.pig_farm_id,
      door: doorname,
      userId: role_id,
      dorm: dormList1.join(','),
      hostid: workstation_id
    }

    if (this.data.isDoor == 2) {
      params.type = '2';
      params.Sitearea = this.data.siteareaid;
    } else {
      params.type = '1';
      params.Sitearea = this.data.name;
    }

    console.log(params)
    // return

    request.request_get("/PigstyManagement/addSitearea.hn", params, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          box.showToast(res.msg);

          setTimeout(() => {
            wx.navigateBack({
              delta: 1,
            });
          }, 1500);

          // wx.showModal({
          //   title: '成功',
          //   content: res.msg,
          //   confirmText: '继续新增',
          //   cancelText: '返回上一级',
          //   success: function (res) {
          //       if (res.confirm) {
          //         wx.navigateBack({
          //           delta: 1,
          //         });
          //       } else if (res.cancel) {
          //         wx.navigateBack({
          //           delta: 1,
          //         });
          //       }
          //   }
          // });

        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })

  },
  addDorm: function (e) {
    let info = this.data.info;
    info.details.push(new Detail('', '', ''));
    this.setData({
      info: info
    });
    console.log(info.details)
  },
  setDorm: function (e) {
    let index = parseInt(e.currentTarget.id.replace("dormtitle-", ""));
    let dorm_content = e.detail.value;
    let info = this.data.info;
    info.details[index].dorm_content = dorm_content;
    this.setData({
      info: info
    });
  },
  setDormStart: function (e) {
    let index = parseInt(e.currentTarget.id.replace("dormstart-", ""));
    let dorm_start = e.detail.value;
    let info = this.data.info;
    info.details[index].dorm_start = dorm_start;
    this.setData({
      info: info
    });
  },
  setDormEnd(e) {
    let index = parseInt(e.currentTarget.id.replace("dormend-", ""));
    let dorm_end = e.detail.value;
    let info = this.data.info;
    info.details[index].dorm_end = dorm_end;
    this.setData({
      info: info
    });
  },
  delFood(e) {
    let closeIndex = e.currentTarget.dataset.index;

    let that = this;
    let info = that.data.info;
    if (info && info.details && info.details.length == 1) {
      info.details[0].dorm_content = '';
      info.details[0].dorm_start = '';
      info.details[0].dorm_end = '';
      that.setData({
        info: info
      });
    } else {
      if (closeIndex != -1) {
        let index = closeIndex;
        let info = that.data.info;
        info.details.splice(index, 1);
        that.setData({
          info: info
        });
      }
    }
  },
})