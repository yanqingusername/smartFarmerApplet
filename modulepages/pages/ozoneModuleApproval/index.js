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
    frontPhotoList:[],
    name_text: "",
    time_text: "",
    endtime_text: "",
    approvalList: ["通过","未通过"],
    approvalIndex: 0,
    isShowApproval: 1,
    approvalText: '',
    submitState: true,

    reasonList: [],
    reasonIndex: 0,
    isShowReason: 1,
    reason_id: '',
    reason_name: '',

    id: ''
    
  },
  onShow: function () {
    
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '臭氧监测结果审批'
    })

    this.setData({
      id: options.id
    });

    this.getOzoneInfobyid();
    this.getReviewfaillist();
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
      reason_name: this.data.reasonList[reasonIndex].text,
      isShowReason: 2
    });
    this.checkSubmitStatus();
  },
  //保存按钮禁用判断
  checkSubmitStatus: function (e) {
    if ((this.data.approvalText != '' && this.data.approvalText == '通过') || (this.data.approvalText == '未通过' && this.data.reason_id != '' && this.data.reason_name != '')) {
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
    if(e.currentTarget.dataset.url){
      var that = this;
      that.setData({
        imgFlag: true
      })
      let currentUrl = e.currentTarget.dataset.url
      wx.previewImage({
        current: currentUrl, // 当前显示图片的http链接
        urls: this.data.frontPhotoList // 需要预览的图片http链接列表
      })
    }
  },
  /**
   * 根据id获取待审核的臭氧熏蒸记录
   */
   getOzoneInfobyid: function () {
    var that = this;
    var data = {
      recordid: that.data.id,
    }

    request.request_get('/equipmentManagement/getOzoneInfobyid.hn', data, function (res) {
      if (res) {
        if (res.success) {
          if(res.data && res.data.length > 0){
            let ozoneInfo = res.data[0];
            let frontPhoto = '';
            if(ozoneInfo && ozoneInfo.img.length > 0){
              frontPhoto = ozoneInfo.img[0]
            }
            that.setData({
              frontPhoto: frontPhoto,
              frontPhotoList: ozoneInfo.img,
              name_text: ozoneInfo.concentration+"mg/m3",
              time_text: ozoneInfo.worktime,
              endtime_text: ozoneInfo.end_time,
            });
          }
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
  /**
   * 获取审核失败的原因列表
   */
   getReviewfaillist: function () {
    var that = this;
    var data = {
      pig_farm_id: app.globalData.userInfo.pig_farm_id,
    }

    request.request_get('/equipmentManagement/getReviewfaillist.hn', data, function (res) {
      if (res) {
        if (res.success) {
          that.setData({
            reasonList: res.data
          });
        } else {
          box.showToast(res.msg);
        }
      }
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
        pig_farm_id: app.globalData.userInfo.pig_farm_id,
        recordid: that.data.id, //记录id
        userid: app.globalData.userInfo.id, //用户id
        status: "0" //（0通过 1不通过）
      }
  
      request.request_get('/equipmentManagement/ReviewOzonefumigation.hn', params, function (res) {
        console.info('回调', res)
        if (res) {
          if (res.success) {
            wx.navigateBack({
              delta: 1
            });
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

      if (!reason_id || !reason_name) {
        box.showToast("请选择拒绝原因");
        return;
      }
      
      let params = {
        pig_farm_id: app.globalData.userInfo.pig_farm_id,
        recordid: that.data.id,
        userid: app.globalData.userInfo.id,
        status: "1",
        remark: reason_name, //remark  不通过原因（不通过时必填）

        // reason_id: reason_id,
        // reason_name: reason_name
      }
      console.log(params)
  
      request.request_get('/equipmentManagement/ReviewOzonefumigation.hn', params, function (res) {
        console.info('回调', res)
        if (res) {
          if (res.success) {
            wx.navigateBack({
              delta: 1
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
})