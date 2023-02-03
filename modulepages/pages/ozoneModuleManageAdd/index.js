const app = getApp()
var request = require('../../../utils/request.js')
var box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title:"",
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

    concentration: '',
    time: "",
    managePersion: '',
    approvalPersion: ""
  },
  onShow: function () {
    this.getdevicelist();
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: "新增设备信息"
    })
  },
  //保存按钮禁用判断
  checkSubmitStatus: function (e) {
    if (this.data.title != '' && this.data.name != '' && this.data.position != '' && this.data.job_id != '' && this.data.job_name != '' && this.data.gender != '') {
      this.setData({
        submitState: false
      })
    } else {
      this.setData({
        submitState: true
      })
    }
  },
  bindTitle: function (e) {
    console.log(e.detail.value)
    var str = e.detail.value;
    // str = utils.checkInput_2(str);
    this.setData({
      title: str
    })

    this.checkSubmitStatus();
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
  bindTime: function (e) {
    console.log(e.detail.value)
    var str = e.detail.value;
    // str = utils.checkInput_2(str);
    this.setData({
      time: str
    })

    this.checkSubmitStatus();
  },
  bindConcentration: function (e) {
    console.log(e.detail.value)
    var str = e.detail.value;
    // str = utils.checkInput_2(str);
    this.setData({
      concentration: str
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
    let position = this.data.position;
    let job_id = this.data.job_id;
    let job_name = this.data.job_name;
    let gender = this.data.gender;

    if (!name) {
      box.showToast("请输入设备编号");
      return;
    }

    if (!position) {
      box.showToast("请输入设备位置");
      return;
    }

    if (!job_name) {
      box.showToast("请选择设备类型");
      return;
    }

    if (!gender) {
      box.showToast("请选择性别");
      return;
    }

    let params = {
      company_serial: app.globalData.userInfo.company_serial,
      sn: name, //设备编号
      address: position, //位置描述
      type:  job_id,//设备类型
      gender: gender == '男' ? '0' : '1' //男女
    }

    request.request_get('/equipmentManagement/adddeviceinfo.hn', params, function (res) {
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
      company_serial: app.globalData.userInfo.company_serial
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

  },
  bindDeleteClick(e) {
    let that = this;
    let id = this.data.uid;
    if (id) {
      if(id == app.globalData.userInfo.id){
        box.showToast("该员工信息无法删除");
      } else {
        wx.showModal({
          title: '确认删除该员工？',
          content: '删除后无法恢复',
          success: function (res) {
            if (res.confirm) {
              var data = {
                id: id,
              }
              request.request_get('/personnelManagement/deleteEmployee.hn', data, function (res) {
                if (res) {
                  if (res.success) {
                    box.showToast(res.msg);
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
    }
  },
})