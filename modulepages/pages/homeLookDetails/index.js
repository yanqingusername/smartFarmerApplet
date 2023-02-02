import * as echarts from '../ec-canvas-new/echarts';
const app = getApp()
const utils = require('../../../utils/utils.js')
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ec_pig: {
      lazyLoad: true // 将 lazyLoad 设为 true 后，需要手动初始化图表
    },
    yearmouthday: "",
    timestamp: new Date().getTime(),
    startDate: "",
    endDate: "",

    isShowName: false,
    isShowResult: false,
    isShowWork: false,
    showOrHide: false,

    page: 1,
    limit: 10,
    iwadomListinfo: [],
    // iwadomListinfo: [
    //   {
    //     "sn": "001",
    //     "address": "一消-男",
    //     "head_url": "",
    //     "real_name": "李思琪",
    //     "workType": "0",
    //     "create_time": "2023.01.04 08:30",
    //     "status": '1'
    //   }
    // ],
    start_time: "", //开始时间，第二个接口用  默认当前
    end_time: "", //结束时间 同开始时间
    status: '', //洗消状态 1成功 2失败 0沐浴中
    workType: "", //上下班 0是上班 1是下班  ""全部
    staffids: '', //员工id以','分割
    // resultList: ['全部', '淋浴中', '淋浴成功', '淋浴失败'],
    // resultListId: ["", "0", "1", "2"],
    resultList: ['全部', '淋浴成功', '淋浴失败'],
    resultListId: ["", "1", "2"],
    resultIndex: 0,

    workList: ['全部', '上班', '下班'],
    workListId: ["", "0", "1"],
    workIndex: 0,

    isShow: false,

    homePersonal: [],
    homePersonalOld: [],
    homePersonalIds: [],
    homePersonalOldIds: [],

    colorList: []
  },
  clickName(e) {
    this.setData({
      isShow: true
    });
  },
  hideModal(e) {
    this.setData({
      isShow: false
    });
    if(this.data.homePersonalIds.length > 0){
      if(this.data.homePersonalOldIds.length > 0){

        let homePersonal = this.data.homePersonalOld;
        for(let i = 0; i< homePersonal.length; i++){
          homePersonal[i].selected = false;

          for(let j = 0; j < this.data.homePersonalOldIds.length; j++){
            if(this.data.homePersonalOldIds[j] == homePersonal[i].id){
              homePersonal[i].selected = true;
              break;
            }else{
              homePersonal[i].selected = false;
            }
          }
        }

        this.setData({
          homePersonalIds: this.data.homePersonalOldIds,
          homePersonal: homePersonal
        });
      } else {
        let homePersonal = this.data.homePersonalOld;
        for(let i = 0; i< homePersonal.length; i++){
          homePersonal[i].selected = false;
        }
        this.setData({
          homePersonalIds: [],
          homePersonalOldIds: [],
          homePersonal: homePersonal
        });
      }
    } else {
      if(this.data.homePersonalOldIds.length > 0){

        let homePersonal = this.data.homePersonalOld;
        for(let i = 0; i< homePersonal.length; i++){
          homePersonal[i].selected = false;

          for(let j = 0; j < this.data.homePersonalOldIds.length; j++){
            if(this.data.homePersonalOldIds[j] == homePersonal[i].id){
              homePersonal[i].selected = true;
              break;
            }else{
              homePersonal[i].selected = false;
            }
          }
        }

        this.setData({
          homePersonalIds: this.data.homePersonalOldIds,
          homePersonal: homePersonal
        });
      } else {
        let homePersonal = this.data.homePersonalOld;
          for(let i = 0; i< homePersonal.length; i++){
            homePersonal[i].selected = false;
          }
        this.setData({
          homePersonalIds: [],
          homePersonalOldIds: [],
          homePersonal: homePersonal
        });
      }
    }
  },
  onConfirm(e) {
    this.setData({
      isShow: false,
      page: 1
    });
    if(this.data.homePersonalIds.length > 0){
      this.setData({
        homePersonalOldIds: [].concat(this.data.homePersonalIds||[]),
      });
    } else {
      this.setData({
        homePersonalIds: [],
        // homePersonal: this.data.homePersonalOld
      });
    }

    this.getIwadomlistinfo();
    this.getIwadomchartinfo();
  },
  checkboxChange(e) {
    let string = "homePersonal[" + e.target.dataset.index + "].selected"
    this.setData({
      [string]: !this.data.homePersonal[e.target.dataset.index].selected
    })
    let detailValue = this.data.homePersonal.filter(it => it.selected).map(it => it.id)
    this.setData({
      homePersonalIds: detailValue
    });
  },
  bindPickerChangeResult(e) {
    console.log(e.detail.value)
    var that = this;
    this.setData({
      resultIndex: e.detail.value,
      status: this.data.resultListId[e.detail.value],
      page: 1
    });

    this.getIwadomlistinfo();
    this.getIwadomchartinfo();
  },
  bindPickerChangeWork(e) {
    console.log(e.detail.value)
    var that = this;
    this.setData({
      workIndex: e.detail.value,
      workType: this.data.workListId[e.detail.value],
      page: 1
    });

    this.getIwadomlistinfo();
    this.getIwadomchartinfo();
  },
  onShow: function () {
    this.getEmployees();
  },
  onLoad: function (options) {
    let that = this;

    wx.setNavigationBarTitle({
      title: '淋浴信息记录'
    });

    this.currentTime();

    this.getIwadomlistinfo();
    this.getIwadomchartinfo();

    this.pig_component = this.selectComponent('#mychart-line');
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
    this.getIwadomlistinfo();
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
      this.getIwadomchartinfo();
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
  bingNameHandler(e) {
    this.setData({
      showOrHide: !this.data.showOrHide,
      isShowName: true
    });
  },
  bingResultHandler(e) {
    this.setData({
      showOrHide: !this.data.showOrHide,
      isShowResult: true
    });
  },
  bingWorkHandler(e) {
    this.setData({
      showOrHide: !this.data.showOrHide,
      isShowWork: true
    });
  },
  closeMask(e) {
    this.setData({
      showOrHide: false,
      isShowName: false,
      isShowResult: false,
      isShowWork: false,
    });
  },
  // 开始画图
  chartInit: function (xdata, ydata, axisLabel, series) {
    var that = this;
    that.pig_component.init((canvas, width, height) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      that.setLineOption(chart, xdata, ydata, axisLabel, series);
      return chart; // 注意这里一定要返回 chart 实例，否则会影响事件处理等
    });
  },

  setLineOption: function (chart, xdata, ydata, axisLabel, series) {
    var option = {
      dataZoom: [{
        type: 'inside', //1平移 缩放
        throttle: '50', //设置触发视图刷新的频率。单位为毫秒（ms）。
        minValueSpan: 6, //用于限制窗口大小的最小值,在类目轴上可以设置为 5 表示 5 个类目
        start: 1, //数据窗口范围的起始百分比 范围是：0 ~ 100。表示 0% ~ 100%。
        end: 50, //数据窗口范围的结束百分比。范围是：0 ~ 100。
        zoomLock: true, //如果设置为 true 则锁定选择区域的大小，也就是说，只能平移，不能缩放。
      }],
      // backgroundColor: "#ffffff",
      // color: ["#E60012"],
      title: {
        show: false
      },
      legend: {
        show: false
        // data: ['A', 'B', 'C','D'],
        // top: 0,
        // left: 'center',
        // backgroundColor: 'red',
        // z: 100
      },
      grid: {
        containLabel: true,
        top: 50,
        bottom: 20
      },
      tooltip: {
        show: true,
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: xdata,
        axisLabel: axisLabel,
        alignWithLabel: true
      },
      yAxis: {
        x: 'center',
        type: 'value',
        splitLine: {
          lineStyle: {
            type: 'dashed'
          }
        },
        minInterval: 1
        // show: false
      },
      // yAxis: {
      //     x: 'center',
      //     type: 'value',
      //     splitLine: {
      //         lineStyle: {
      //         type: 'dashed'
      //         }
      //     },
      //     y:'dataMin'
      // },
      series: series
    };
    chart.setOption(option);
    return chart;
  },
  // 获取所有人员 
  getEmployees: function () {
    var that = this;
    var data = {
      id: app.globalData.userInfo.id
    }
    request.request_get('/personnelManagement/getEmployees.hn', data, function (res) {
      if (res) {
        if (res.success) {
          let list = res.data;
          for(let i = 0; i< list.length; i++){
            list[i].selected = false;
          }
          
          that.setData({
            homePersonal: list,
            homePersonalOld: res.data
          });
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
  getIwadomchartinfo: function () {
    var that = this;
    var data = {
      company_serial: app.globalData.userInfo.company_serial, //
      start_time: this.data.startDate, //开始时间，第二个接口用  默认当前
      end_time: this.data.endDate, //结束时间 同开始时间
      status: this.data.status, //洗消状态 1成功 2失败 0沐浴中
      workType: this.data.workType, //上下班 0是上班 1是下班  ""全部
      staffids: this.data.homePersonalIds.length > 0 ? this.data.homePersonalIds.join(',') : "", //员工id以','分割
    }

    console.log('---->:', data)

    request.request_get('/iwadom/getIwadomchartinfo.hn', data, function (res) {
      if (res) {
        if (res.success) {
          var xdata = res.xdata
          // var xdata = ['张三','张三一发发发','张三二','张三撒','张三福','张三发','张三丰','张无丰','张的丰','张啊丰','张到丰','张卡丰',]
          var ydata = []
          var series = res.ydata

          that.setData({
            colorList: series
          });
          // var series = [{
          //   "name": "上班成功",
          //   "type": "line",
          //   "smooth": true,
          //   "data": [20, 30,40,50,60,35,40,10,25,55,65,35]
          // }, {
          //   "name": "下班成功",
          //   "type": "line",
          //   "smooth": true,
          //   "data": [10, 60,70,45,20,30,50,40,25,35,65,55]
          // }, {
          //   "name": "上班失败",
          //   "type": "line",
          //   "smooth": true,
          //   "data": [15, 25,40,55,40,60,80,30,70,45,20,65]
          // }, {
          //   "name": "下班失败",
          //   "type": "line",
          //   "smooth": true,
          //   "data": [30, 40,50,30,50,50,60,20,10,55,75,45]
          // }]
          var axisLabel = { //设置x轴的字
            show: true,
            interval: 0,
            rotate: 40
          }
          that.chartInit(xdata, ydata, axisLabel, series)

        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
})