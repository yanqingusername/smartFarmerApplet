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
    approval_text: '',
    
    id: ''
    
  },
  onShow: function () {
    
  },
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '消毒记录详情'
    })

    this.setData({
      id: options.id
    });

    this.getOzoneHistorybyid();
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
   getOzoneHistorybyid: function () {
    var that = this;
    var data = {
      recordid: that.data.id,
    }

    request.request_get('/equipmentManagement/getOzoneHistorybyid.hn', data, function (res) {
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
              approval_text: (ozoneInfo.status == 5 || ozoneInfo.status == 6) ? '已审批' : '无',
            });
          }
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
})