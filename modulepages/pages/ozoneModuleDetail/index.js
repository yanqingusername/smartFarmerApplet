const app = getApp()
const utils = require('../../../utils/utils.js')
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    
    yearmouthday: "",
    timestamp: new Date().getTime(),
    startDate: "",
    endDate: "",

    page: 1,
    limit: 10,
    // iwadomListinfo: [],
    iwadomListinfo: [
      {
        "sn": "001",
        "address": "一消-男",
        "head_url": "",
        "real_name": "李思琪",
        "workType": "0",
        "create_time": "2023.01.04 08:30",
        "status": '1'
      },
      {
        "sn": "001",
        "address": "一消-男",
        "head_url": "",
        "real_name": "李思琪",
        "workType": "0",
        "create_time": "2023.01.04 08:30",
        "status": '3'
      }
    ],
    start_time: "", //开始时间，第二个接口用  默认当前
    end_time: "", //结束时间 同开始时间
    
  },
  onShow: function () {
  },
  onLoad: function (options) {
    let that = this;

    wx.setNavigationBarTitle({
      title: '监测信息记录'
    });

    this.currentTime();

   
  },
  getIwadomlistinfo: function () {
    var that = this;
    var data = {
      id: app.globalData.userInfo.id, //登录人的id
      start_time: this.data.startDate, //开始时间，第二个接口用  默认当前
      end_time: this.data.endDate, //结束时间 同开始时间
      status: this.data.status, //洗消状态 1成功 2失败 0沐浴中
      workType: this.data.workType, //上下班 0是上班 1是下班  ""全部
      staffids: this.data.homePersonalIds.length > 0 ? this.data.homePersonalIds.join(',') : "", //员工id以','分割
      page: this.data.page,
      limit: this.data.limit
    }

    console.log('---->:', data)

    request.request_get('/iwadom/getIwadomlistinfo.hn', data, function (res) {
      if (res) {
        if (res.success) {
          if (that.data.page == 1) {
            that.setData({
              iwadomListinfo: res.data,
              page: (res.data && res.data.length > 0) ? that.data.page + 1 : that.data.page
            });
          } else {
            that.setData({
              iwadomListinfo: that.data.iwadomListinfo.concat(res.data || []),
              page: (res.data && res.data.length > 0) ? that.data.page + 1 : that.data.page,
            });
          }
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
  onReachBottom: function () {
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

      this.getIwadomlistinfo();
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
  clickOzoneModuleApproval: function (e) {
    wx.navigateTo({
      url: '/modulepages/pages/ozoneModuleApproval/index',
  })
  },
})