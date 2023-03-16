const app = getApp()
var request = require('../../../utils/request.js')
var box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: "",
    position: "",
    submitState: true,
    jobNameList: [],
    categoryIndex: 0,
    isShowRegion: 1,
    job_id: '',
    job_name: '',

    positionList: [],
    positionIndex: 0,
    isShowPosition: 1,
    position_id: '',
    position_name: ''
  },
  onShow: function () {
    // this.getPersonnelList();
    this.getPositionList();
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "新增门禁位点信息"
    })
  },
  //保存按钮禁用判断
  checkSubmitStatus: function (e) {
    // && this.data.job_id != '' && this.data.job_name != ''
    if (this.data.name != '' && this.data.position_id != '' && this.data.position_name != '') {
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
    console.log(e.detail.value)
    var str = e.detail.value;
    // str = utils.checkInput_2(str);
    this.setData({
      name: str
    })

    this.checkSubmitStatus();
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
  // bindPosition: function (e) {
  //   var str = e.detail.value;
  //   this.setData({
  //     position: str
  //   })

  //   this.checkSubmitStatus();
  // },
  bindJobNameChange: function (e) {
    var categoryIndex = e.detail.value;
    this.setData({
      categoryIndex: categoryIndex,
      job_id: this.data.jobNameList[categoryIndex].id,
      job_name: this.data.jobNameList[categoryIndex].name,
      isShowRegion: 2
    });
    this.checkSubmitStatus();
  },
  submitBuffer() {
    let that = this;
    let name = this.data.name;
    let position_id = this.data.position_id;
    let position_name = this.data.position_name;
    // let job_id = this.data.job_id;
    // let job_name = this.data.job_name;

    if (!name) {
      box.showToast("请输入设备编号");
      return;
    }

    if (!position_id && !position_name) {
      box.showToast("请选择设备位置");
      return;
    }

    // if (!job_id && !job_name) {
    //   box.showToast("请选择设备管理员");
    //   return;
    // }

    let params = {
      pig_farm: app.globalData.userInfo.pig_farm_id ,
      sn: name, //设备编号
      address_id: position_id, //设备位置
      // user_id:  job_id,//设备管理员id
    }

    request.request_get('/AccessManagement/addEntranceGuard.hn', params, function (res) {
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

  },
  getPersonnelList() {
    let that = this;
    let params = {
      source: "1",
      pig_farm: app.globalData.userInfo.pig_farm_id
    }

    request.request_get('/personnelManagement/getPersonnelList.hn', params, function (res) {
      if (res) {
        if (res.success) {
          that.setData({
            jobNameList: res.msg
          });
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  getPositionList() {
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
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    });
  }
})