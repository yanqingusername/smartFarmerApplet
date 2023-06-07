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
    genderList: ['男', '女'],
    genderIndex: 0,
    gender: '',
    isShowGender: 1,
    job_id: '',
    job_name: '',

    positionList: [],
    positionIndex: 0,
    isShowPosition: 1,
    position_id: '',
    position_name: '',
  },
  onShow: function () {
    // this.getdevicelist();
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "新增设备信息"
    })

    this.getPositionList();
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
  //保存按钮禁用判断
  checkSubmitStatus: function (e) {
    // && this.data.job_id != '' && this.data.job_name != ''
    if (this.data.name != '' && this.data.position_name != '' && this.data.gender != '') {
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
  bindPosition: function (e) {
    var str = e.detail.value;
    this.setData({
      position: str
    })

    this.checkSubmitStatus();
  },
  // 类别改变
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
  bindPickerChangeGender: function (e) {
    var that = this;
    this.setData({
      genderIndex: e.detail.value,
      gender: that.data.genderList[e.detail.value],
      isShowGender: 2
    });
    this.checkSubmitStatus();
  },
  submitBuffer() {
    let that = this;
    let name = this.data.name;
    // let position = this.data.position;
    let position_name = this.data.position_name;
    let position_id = this.data.position_id;
    // let job_id = this.data.job_id;
    // let job_name = this.data.job_name;
    let gender = this.data.gender;

    if (!name) {
      box.showToast("请输入设备编号");
      return;
    }

    if (!position_name) {
      box.showToast("请选择设备位置");
      return;
    }

    // if (!job_name) {
    //   box.showToast("请选择设备类型");
    //   return;
    // }

    if (!gender) {
      box.showToast("请选择性别");
      return;
    }

    let params = {
      // company_serial: app.globalData.userInfo.company_serial,
      pig_farm_id: app.globalData.userInfo.pig_farm_id,
      sn: name, //设备编号
      address: position_name, //位置描述
      type:  '1',//设备类型 job_id
      gender: gender == '男' ? '0' : '1', //男女
      layout_id: position_id //位置id
    }

    request.request_get('/equipmentManagement/NewaddDecontaminationdeviceinfo.hn', params, function (res) {
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

  },
  getdevicelist() {
    let that = this;
    let params = {
      pig_farm_id: app.globalData.userInfo.pig_farm_id
    }

    request.request_get('/equipmentManagement/getdevicelist.hn', params, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          that.setData({
            jobNameList: res.type
          });
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })

  }
})