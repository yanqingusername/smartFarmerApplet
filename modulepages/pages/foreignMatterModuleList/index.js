const app = getApp();
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')

Page({
  data: {
    page: 1,
    limit: 10,
    deviceinfoList: [],
    count: '0',
    positionList: [],
    positionIndex: 0,
    isShowPosition: 1,
    position_id: '',
    position_name: '',

    yearmouthday: "",
    timestamp: new Date().getTime(),
    startDate: "",
    endDate: "",
    start_time: "", //开始时间，第二个接口用  默认当前
    end_time: "", //结束时间 同开始时间
  },
  onLoad: function (options) {
    this.currentTime();

    var that = this;
    that.getForeignMatterList();
  },
  onShow: function () {
    this.getPositionList();
  },
  onReachBottom: function () {
    this.getForeignMatterList();
  },
  getForeignMatterList: function () {
    var that = this;
    var data = {
      pig_farm_id: app.globalData.userInfo.pig_farm_id,
      page: that.data.page,
      limit: that.data.limit,
      start_time: this.data.startDate, //开始时间，第二个接口用  默认当前
      end_time: this.data.endDate, //结束时间 同开始时间
      position: this.data.position_name  //设备位置
    }
    request.request_get('/equipmentManagement/getForeignMatterList.hn', data, function (res) {
      if (res) {
        if (res.success) {
            if (that.data.page == 1) {
              that.setData({
                count: res.count,
                deviceinfoList: res.data,
                page: (res.data && res.data.length > 0) ? that.data.page + 1 : that.data.page
              });
            } else {
              that.setData({
                count: res.count,
                deviceinfoList: that.data.deviceinfoList.concat(res.data || []),
                page: (res.data && res.data.length > 0) ? that.data.page + 1 : that.data.page,
              });
            }
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
  bindPositionChange: function (e) {
    var positionIndex = e.detail.value;
    this.setData({
      positionIndex: positionIndex,
      position_id: this.data.positionList[positionIndex].id,
      position_name: this.data.positionList[positionIndex].location_descr,
      isShowPosition: 2,
      page: 1
    });
  },
  getPositionList() {
    let that = this;
    let params = {
      pig_farm_id: app.globalData.userInfo.pig_farm_id
    }

    request.request_get('/AccessManagement/getAccesslayout.hn', params, function (res) {
      if (res) {
        if (res.success) {
          var reasonList = res.data;
          let reagentHead = {
            "id": "",
            "location_descr": "全部",
          }
          reasonList.unshift(reagentHead);
          that.setData({
            positionList: reasonList
          });
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    });
  },
  //预览图片，放大预览
  preview: function (e) {
    let currentUrl = e.currentTarget.dataset.url
    wx.previewImage({
      current: currentUrl, // 当前显示图片的http链接
      urls: [currentUrl] // 需要预览的图片http链接列表
    })
  },
  /**
   * 当前日期
   */
   currentTime() {
    let tempTime = new Date(this.data.timestamp);
    let month = tempTime.getMonth() + 1;
    let day = tempTime.getDate();
    if (month < 10) {
      month = "0" + month
    }
    if (day < 10) {
      day = "0" + day
    }
    let curtime = tempTime.getFullYear() + "年" + (month) + "月" + day + "日";
    let curDate = tempTime.getFullYear() + "-" + (month) + "-" + day;
    console.log('currentTime' + curtime);
    this.setData({
      yearmouthday: curDate,
      start_time: curtime,
      end_time: curtime,
      startDate: curDate,
      endDate: curDate
    })
  },
  formatYear(datestring, typestring, datetypestring) {
    if (datestring) {
      let dateList = datestring.split('-');
      let start_time = dateList[0] + "年" + dateList[1] + "月" + dateList[2] + "日";
      this.setData({
        [typestring]: start_time,
        [datetypestring]: datestring,
        page: 1
      })

      this.getForeignMatterList();
    }
  },
  bindStartTimeChange: function (e) {
    let datestring = e.detail.value;
    if (datestring) {
      this.formatYear(datestring, 'start_time', 'startDate');
    }
  },
  bindEndTimeChange: function (e) {
    let datestring = e.detail.value;
    if (datestring) {
      this.formatYear(datestring, 'end_time', 'endDate');
    }
  },
});