const app = getApp()
var request = require('../../../utils/request.js')
var box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    frontPhoto: "",
    name_text: "50mg/m3",
    time_text: "2时30分",
    endtime_text: "2023-02-05 14:30",
    approvalList: ["通过","未通过"],
    approvalIndex: 0,
    isShowApproval: 1,
    approvalText: '',
    submitState: true,

    reasonList: [
      {
        id:'1',
        name: "时长太短"
      },
      {
        id:'2',
        name: "浓度未达标"
      },
      {
        id:'3',
        name: "污染严重"
      }
    ],
    reasonIndex: 0,
    isShowReason: 1,
    reason_id: '',
    reason_name: ''
    
  },
  onShow: function () {
    
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '臭氧监测结果审批'
    })

  },
  // bindName: function (e) {
  //   var str = e.detail.value;
  //   // str = utils.checkInput_2(str);
  //   this.setData({
  //     name: str
  //   })

  //   this.checkSubmitStatus();
  // },
  bindReasonChange: function (e) {
    var reasonIndex = e.detail.value;
    this.setData({
      reasonIndex: reasonIndex,
      reason_id: this.data.reasonList[reasonIndex].id,
      reason_name: this.data.reasonList[reasonIndex].name,
      isShowReason: 2
    });
    this.checkSubmitStatus();
  },
  //保存按钮禁用判断
  checkSubmitStatus: function (e) {
    if (this.data.approvalText != '' || (this.data.approvalText == '未通过' && this.data.reason_id != '' && this.data.reason_name != '')) {
      this.setData({
        submitState: false
      })
    } else {
      this.setData({
        submitState: true
      })
    }
  },
  bindApprovalChange: function (e) {
    var approvalIndex = e.detail.value;
    this.setData({
      approvalIndex: approvalIndex,
      approvalText: this.data.approvalList[approvalIndex],
      isShowApproval: 2
    });
    this.checkSubmitStatus();
  },
  //预览图片，放大预览
  preview: function (e) {
    var that = this;
    that.setData({
      imgFlag: true
    })
    let currentUrl = e.currentTarget.dataset.url
    wx.previewImage({
      current: currentUrl, // 当前显示图片的http链接
      urls: [currentUrl] // 需要预览的图片http链接列表
    })
  },
  submitBuffer() {
    let that = this;
    let approvalText = this.data.approvalText;

    if (!approvalText) {
      box.showToast("请选择审批意见");
      return;
    }

    if(approvalText == '通过'){
      let params = {
        // company_serial: app.globalData.userInfo.company_serial,
        approvalText: approvalText, //审批意见
      }
  
      request.request_get('/equipmentManagement/adddeviceinfo.hn', params, function (res) {
        console.info('回调', res)
        if (res) {
          if (res.success) {
            
          } else {
            box.showToast(res.msg);
          }
        } else {
          box.showToast("网络不稳定，请重试");
        }
      })
    }else{
      let reason_id = this.data.reason_id;
      let reason_name = this.data.reason_name;
      let params = {
        // company_serial: app.globalData.userInfo.company_serial,
        approvalText: approvalText, //审批意见
        reason_id: reason_id,
        reason_name: reason_name
      }
      console.log(params)
      return
  
      request.request_get('/equipmentManagement/adddeviceinfo.hn', params, function (res) {
        console.info('回调', res)
        if (res) {
          if (res.success) {
            
          } else {
            box.showToast(res.msg);
          }
        } else {
          box.showToast("网络不稳定，请重试");
        }
      })
    }
  },
})