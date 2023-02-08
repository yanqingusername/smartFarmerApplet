const app = getApp();
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')

Page({
  data: {
    page: 1,
    limit: 10,
    deviceinfoList: [],

    reasonList: [
      {
        "id": '1',
        "text": "亦庄"
      },
      {
        "id": '2',
        "text": "丰台"
      },
      {
        "id": '3',
        "text": "海淀"
      }
    ],
    reasonIndex: 0,
    isShowReason: 1,
    reason_id: '',
    reason_name: '',


    statusList: [
      {
        "id": '1',
        "text": "正常"
      },
      {
        "id": '2',
        "text": "离线"
      },
      {
        "id": '3',
        "text": "发热"
      },
      {
        "id": '4',
        "text": "出栏"
      },
      {
        "id": '5',
        "text": "死亡"
      }
    ],
    statusIndex: 0,
    isShowStatus: 1,
    status_id: '',
    status_name: '',

    yearmouthday: "",
    timestamp: new Date().getTime(),
    startDate: "",
    endDate: "",
    start_time: "", //开始时间，第二个接口用  默认当前
    end_time: "", //结束时间 同开始时间
  },
  onLoad: function (options) {

    this.currentTime();

  },
  onShow: function () {
    var that = this;
    that.getzonedevicelist();
  },
  onReachBottom: function () {

  },
  getzonedevicelist: function () {
    var that = this;
    var data = {
      pig_farm_id: app.globalData.userInfo.pig_farm_id,
      page: that.data.page,
      limit: that.data.limit,
    }
    request.request_get('/equipmentManagement/getzonedevicelist.hn', data, function (res) {
      if (res) {
        if (res.success) {
            if (that.data.page == 1) {
              that.setData({
                deviceinfoList: res.data,
                page: (res.data && res.data.length > 0) ? that.data.page + 1 : that.data.page
              });
            } else {
              that.setData({
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
  clickPigAbnormalModuleInfo(e) {
    let sn = e.currentTarget.dataset.sn;
    if(sn){
      wx.navigateTo({
        url: `/modulepages/pages/pigAbnormalModuleInfo/index?sn=${sn}`,
      })
    }
  },
  bindReasonChange: function (e) {
    var reasonIndex = e.detail.value;
    this.setData({
      reasonIndex: reasonIndex,
      reason_id: this.data.reasonList[reasonIndex].id,
      reason_name: this.data.reasonList[reasonIndex].text,
      isShowReason: 2
    });
  },
  bindStatusChange: function (e) {
    var statusIndex = e.detail.value;
    this.setData({
      statusIndex: statusIndex,
      status_id: this.data.statusList[statusIndex].id,
      status_name: this.data.statusList[statusIndex].text,
      isShowStatus: 2
    });
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

      this.getOzoneHistory();
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