import * as echarts from '../ec-canvas-new/echarts';
const app = getApp();
const request = require('../../../utils/request.js')
const time = require('../../../utils/time.js')
const box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({
    data: {
        source_label: '',
        label_id: '',
        farm_name: '',
        door: '',
        dorm: '',
        label_type: 3, // 耳环类型 0：育肥猪，1：母猪，2：仔猪，3：公猪
        Sitearea: "",
        label_serial: "",

        nowTime: time.getToday(new Date()),
        start_time: time.getToday(new Date()),
        end_time: time.getToday(new Date()),

        start_time_text: time.getTodayLine(new Date()),
        end_time_text: time.getTodayLine(new Date()),

        temp_date_type: 0, // 0-天  2-月

        ledallowOperation: true,
        ledTip: false,
        ledOpenMsg: "正在连接耳环....",

        ec_pig_temp: {
            lazyLoad: true // 将 lazyLoad 设为 true 后，需要手动初始化图表
        },
        ec_pig_act: {
            lazyLoad: true // 将 lazyLoad 设为 true 后，需要手动初始化图表
        },
        maxData: 7,
        // approvalList: ["死亡","淘汰","出栏"],
        approvalList: ["死亡","出栏"],
        approvalIndex: 0,
        isShowApproval: 1,
        approvalText: '',

        reasonList: [],
        reasonIndex: 0,
        isShowReason: 1,
        reason_id: '',
        reason_name: '',

        reasonList1: [
            {
                'id': '1',
                'text': '疾病'
            },
            {
                'id': '2',
                'text': '未知'
            }
        ],
        reasonList2: [
            {
                'id': '1',
                'text': '育种更新'
            },
            {
                'id': '2',
                'text': '疾病'
            },
            {
                'id': '3',
                'text': '其它'
            }
        ],
        reasonList3: [
            {
                'id': '1',
                'text': '出栏'
            },
            {
                'id': '2',
                'text': '未知'
            }
        ],
        operation: 1 //  1是在场  其余离场
    },
    /**
   * 获取审核失败的原因列表
   */
   getReviewfaillist: function () {
    this.setData({
        reasonList: this.data.approvalIndex == 1 ? this.data.reasonList2 : this.data.approvalIndex == 2 ? this.data.reasonList3 : this.data.reasonList1
    });
  },
    bindApprovalChange: function (e) {
        var approvalIndex = e.detail.value;
        this.setData({
          approvalIndex: approvalIndex,
          approvalText: this.data.approvalList[approvalIndex],
          isShowApproval: 2,
          isShowReason: 1
        });
        // this.getReviewfaillist();
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
    onLoad: function (options) {

        if (options && options.jsonItem) {
            let jsonItem = JSON.parse(options.jsonItem);
            console.log(jsonItem)
            this.setData({
                source_label: jsonItem.source_label,
                label_id: jsonItem.label_id,
                Sitearea: jsonItem.Sitearea,
                door: jsonItem.door,
                dorm: jsonItem.dorm,
                label_type: jsonItem.label_type,
                label_serial: jsonItem.serial,
                farm_name: jsonItem.farm_name,
                operation: jsonItem.operation
            });
        }


        this.pig_temp_component = this.selectComponent('#mychart-line_temp');
        this.pig_act_component = this.selectComponent('#mychart-line_act');

        // new 折线图
        this.getShowLabelSumfilebyid();

        // this.getReviewfaillist();

    },
    /**
     *  猪只个体信息 折线图
     */
     getShowLabelSumfilebyid: function () {
        var that = this;

        let params = {
            pig_farm_id: app.globalData.userInfo.pig_farm_id,
            serial: that.data.label_serial,
            start_time: this.data.start_time,
            end_time: this.data.end_time,
            type: this.data.temp_date_type == 2 ? 'month' : 'day' //(day,month)
        }

        // let params = {
        //     pig_farm_id: 'FARM016',
        //     serial: '4870',
        //     start_time: '2023-01-02',
        //     end_time: '2023-01-02',
        //     type: this.data.temp_date_type == 2 ? 'month' : 'day' 
        // }

        console.log(params)

        request.request_get('/pigManagement/showLabelSumfilebyid.hn', params, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var xdata = res.xdata
                    var ydata = []
                    var series = res.ydata || []
                    // var series =[{
                    //     "date": "2022-10",
                    //     "temp": [10, 20, 30, 10, 40, 60, 90, 80, 50, 60, 70, 25, 65, 80, 15, 35, 45, 20, 50, 75, 40, 20, 30, 60, 35, 55, 10, 45, 70, 25, 85],
                    //     "act": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    // }, {
                    //     "date": "2022-11",
                    //     "temp": [20, 30, 10, 40, 60, 90, 80, 50, 60, 70, 25, 65, 80, 15, 35, 45, 20, 50, 75, 40, 20, 30, 60, 35, 55, 10, 45, 70, 25, 85],
                    //     "act": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    // }, {
                    //     "date": "2022-12",
                    //     "temp": [30, 50, 70, 10, 40, 60, 30, 80, 50, 70, 70, 65, 65, 80, 55, 35, 45, 30, 50, 75, 70, 20, 30, 60, 40, 55, 50, 45, 70, 65, 85],
                    //     "act": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    // }, {
                    //     "date": "2023-01",
                    //     "temp": [30, 50, 70, 10, 40, 60, 30, 80, 50, 70, 70, 65, 65, 80, 55, 35, 45, 30, 50, 75, 70, 20, 30, 60, 40, 55, 50, 45, 70, 65, 85],
                    //     "act": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    // }, {
                    //     "date": "2023-02",
                    //     "temp": [50, 80, 20, 30, 40, 70, 30, 25, 65, 70, 35, 60, 55, 35, 50, 55, 40, 35, 45, 65, 75, 40, 35, 65, 45, 50, 65, 75, 55, 60, 80],
                    //     "act": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    // }, {
                    //     "date": "2023-03",
                    //     "temp": [50, 80, 20, 30, 40, 70, 30, 25, 65, 70, 35, 60, 55, 35, 50, 55, 40, 35, 45, 65, 75, 40, 35, 65, 45, 50, 65, 75, 55, 60, 80],
                    //     "act": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                    // }]

                    let seriesTemp = [];
                    let seriesAct = [];
                    if(that.data.temp_date_type == 2){
                        for(let i = 0; i < series.length; i++){
                            let name = series[i].date;
                            name = name.substring(5,7);
                            let objTemp = {
                                name: name+'月温度',
                                smooth: true,
                                type: "line",
                                data: series[i].temp
                            }
                            seriesTemp.push(objTemp)
    
                            let objAct = {
                                name: name+'月活动量',
                                smooth: true,
                                type: "line",
                                data: series[i].act
                            }
                            seriesAct.push(objAct)
                        }
                    }else{
                        for(let i = 0; i < series.length; i++){
                            let name = series[i].date;
                            let moth = name.substring(5,7);
                            let date = name.substring(8,10);
                            let objTemp = {
                                name: moth+"/"+date+'温度',
                                smooth: true,
                                type: "line",
                                data: series[i].temp
                            }
                            seriesTemp.push(objTemp)
    
                            let objAct = {
                                name: moth+"/"+date+'活动量',
                                smooth: true,
                                type: "line",
                                data: series[i].act
                            }
                            seriesAct.push(objAct)
                        }
                    }
                    var axisLabel = { //设置x轴的字
                        show: true,
                        interval: 2,
                        rotate: 40,
                        // fontSize: 24
                    }

                    if(that.data.temp_date_type == 2){

                    }else{
                        // xdata = ['01:00', '02:00', '03:00', '04:00', '05:00', '06:00',
                        //     '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
                        //     '13:00', '14:00', '15:00', '16:00', '17:00', '18:00',
                        //     '19:00', '20:00', '21:00', '22:00', '23:00', '24:00'
                        // ]
                        xdata = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
                            '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
                            '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
                            '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
                        ]
                    }

                    let canvasDpr = wx.getSystemInfoSync().pixelRatio;
                    that.chartInitTemp(xdata, ydata, axisLabel, seriesTemp, canvasDpr);

                    that.chartInitAct(xdata, ydata, axisLabel, seriesAct, canvasDpr)

                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    // 开始画图
    chartInitTemp: function (xdata, ydata, axisLabel, series, canvasDpr) {
        var that = this;
        that.pig_temp_component.init((canvas, width, height) => {
            const chart = echarts.init(canvas, null, {
                width: width,
                height: height,
                devicePixelRatio: canvasDpr, // 像素
            });
            that.setLineOptionTemp(chart, xdata, ydata, axisLabel, series);
            return chart; // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        });
    },
    setLineOptionTemp: function (chart, xdata, ydata, axisLabel, series) {
        var option = {
            // dataZoom: [{
            //     type: 'inside', //1平移 缩放
            //     throttle: '50', //设置触发视图刷新的频率。单位为毫秒（ms）。
            //     minValueSpan: 6, //用于限制窗口大小的最小值,在类目轴上可以设置为 5 表示 5 个类目
            //     start: 1, //数据窗口范围的起始百分比 范围是：0 ~ 100。表示 0% ~ 100%。
            //     end: 60, //数据窗口范围的结束百分比。范围是：0 ~ 100。
            //     zoomLock: true, //如果设置为 true 则锁定选择区域的大小，也就是说，只能平移，不能缩放。
            // }],
            title: {
                show: false
            },
            legend: {
                show: false
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
                name:'温度',
                x: 'center',
                type: 'value',
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                // axisLabel:{
                //     fontSize: 24
                // },
                minInterval: 1,
                // show: true
            },
            series: series
        };
        chart.setOption(option);
        return chart;
    },

    // 开始画图
    chartInitAct: function (xdata, ydata, axisLabel, series, canvasDpr) {
        var that = this;
        that.pig_act_component.init((canvas, width, height) => {
            const chartAct = echarts.init(canvas, null, {
                width: width,
                height: height,
                devicePixelRatio: canvasDpr, // 像素
            });
            that.setLineOptionAct(chartAct, xdata, ydata, axisLabel, series);
            return chartAct; // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        });
    },
    setLineOptionAct: function (chartAct, xdata, ydata, axisLabel, series) {
        var my_y_axisLabel = {
            show: true,
            formatter: function (value) {
                var info = ""
                if (value == 0) {
                    info = "0";
                } else if (value == 1) {
                    info = "低";
                } else if (value == 2) {
                    info = "中";
                } else if (value == 3) {
                    info = "高";
                } else {
                    info = "未知";
                }
                return info
                //return value.toFixed(0);
            }
        }

        var optionAct = {
            // dataZoom: [{
            //     type: 'inside', //1平移 缩放
            //     throttle: '50', //设置触发视图刷新的频率。单位为毫秒（ms）。
            //     minValueSpan: 6, //用于限制窗口大小的最小值,在类目轴上可以设置为 5 表示 5 个类目
            //     start: 1, //数据窗口范围的起始百分比 范围是：0 ~ 100。表示 0% ~ 100%。
            //     end: 60, //数据窗口范围的结束百分比。范围是：0 ~ 100。
            //     zoomLock: true, //如果设置为 true 则锁定选择区域的大小，也就是说，只能平移，不能缩放。
            // }],
            title: {
                show: false
            },
            legend: {
                show: false
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
                name:'活动量',
                x: 'center',
                type: 'value',
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                min: 0,
                max: 3,
                minInterval: 1,
                axisLabel: my_y_axisLabel
                // show: true
            },
            series: series
        };
        chartAct.setOption(optionAct);
        return chartAct;
    },
    /**
     * 转栏记录
     */
    clickPigAbnormalModuleInfoList(e) {
        let labelid = e.currentTarget.dataset.labelid;
        if (labelid) {
            wx.navigateTo({
                url: `/modulepages/pages/pigAbnormalModuleInfoList/index?label_id=${labelid}`,
            })
        }
    },
    // led等开关改变
    openLED: function () {
        var that = this;
        var ledallowOperation = that.data.ledallowOperation;
        if (ledallowOperation) {
            that.setData({
                ledallowOperation: false,
                ledTip: true
            })
            that.sendOpenLEDCmd();
        } else {
            box.showToast("LED正在打开...")
        }
    },
    // 发送打开耳环命令
    sendOpenLEDCmd: function () {
        var that = this;
        var data = {
            label_serial: that.data.label_serial,
            userId: app.globalData.userInfo.id,
            status: "on", // on 打开 off 关闭
            time: 600, // on 600s off 0
        };
        request.request_get('/pigManagement/openLED.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var id = res.id;
                    var startTime = new Date().valueOf();
                    that.checkLedOpenSuccess(id, startTime);
                } else {
                    that.setData({
                        ledIsOpen: false
                    })
                    box.showToast(res.msg)
                }
            }
        })
    },
    checkLedOpenSuccess: function (id, startTime) {
        var that = this;
        request.request_get('/pigManagement/getLEDResult.hn', {
            id: id
        }, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var open = res.open;
                    if (open) {
                        console.log("打开耳环成功")
                        that.setData({
                            ledallowOperation: true,
                            ledOpenMsg: "耳环LED灯已打开!"
                        }) // 已打开，可以继续打开
                    } else {
                        var endTime = new Date().valueOf();
                        var time = endTime - startTime;
                        if (time <= 60000) { //60s
                            setTimeout(function () {
                                that.checkLedOpenSuccess(id, startTime)
                            }, 2000);
                        } else {
                            console.log("打开耳环灯失败")
                            that.setData({
                                ledallowOperation: true,
                                ledOpenMsg: "耳环LED灯打开失败，请重试!"
                            }) // 打开失败，可以继续打开
                        }
                    }
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    //改变温度的选项
    temp_time_type: function (e) {
        var that = this;
        var temp_date_type = e.currentTarget.dataset.type;
        that.setData({
            temp_date_type: temp_date_type,
            maxData: 7
        });

        if(temp_date_type == 2){
            let month = time.get6MonthDay(new Date());
            that.setData({
                start_time: month[0],
                start_time_text: month[0],
            });

            this.getShowLabelSumfilebyid();
        }else{
            that.setData({
                nowTime: time.getToday(new Date()),
                start_time: time.getToday(new Date()),
                end_time: time.getToday(new Date()),
                start_time_text: time.getTodayLine(new Date()),
                end_time_text: time.getTodayLine(new Date()),
            });
            this.getShowLabelSumfilebyid();
        }
    },
    goBack: function (e) {
        
        if(this.data.maxData == 1){

        }else{
            var that = this;
            var date = this.data.start_time;
            var arr = date.split("-");
            var newDate = new Date(new Date(arr[0], (arr[1] - parseInt(1)), arr[2], '00', '00', '00').getTime() - 24 * 3600 * 1000);
            var newDateString = time.getToday(newDate);
            var newDateStringText = time.getTodayLine(newDate);
            let maxData = this.data.maxData;
            maxData = maxData - 1;
            that.setData({
                start_time: newDateString,
                maxData: maxData,
                start_time_text: newDateStringText,
            });

            this.getShowLabelSumfilebyid();
        }
    },
    goNext: function (e) {
        if(this.data.maxData == 7){

        }else{
            var that = this;
            var date = this.data.start_time;
            var arr = date.split("-");
            var newDate = new Date(new Date(arr[0], (arr[1] - parseInt(1)), arr[2], '00', '00', '00').getTime() + 24 * 3600 * 1000);
            var newDateString = time.getToday(newDate);
            var newDateStringText = time.getTodayLine(newDate);
            let maxData = this.data.maxData;
            maxData = maxData + 1;
            that.setData({
                start_time: newDateString,
                maxData: maxData,
                start_time_text: newDateStringText,
            });
            this.getShowLabelSumfilebyid();
        }
    },
    submitClick: function () {

        var that = this;
        if(!that.data.approvalText){
            box.showToast("请选择离场选项");
            return;
        }

        // if(!that.data.reason_name){
        //     box.showToast("请选择离场原因");
        //     return;
        // }
        
        var data = {
            serial: that.data.label_serial,
            operation: that.data.approvalText == '出栏' ? '2' : '3', //["死亡","淘汰","出栏"] 2出栏 3是死亡 5是淘汰
            // operation: that.data.approvalText == '淘汰' ? '5' : that.data.approvalText == '出栏' ? '2' : '3', //["死亡","淘汰","出栏"] 2出栏 3是死亡 5是淘汰
            // remarks: that.data.reason_name,
            remarks: that.data.approvalText,
            user_id: app.globalData.userInfo.id, //用户id
        };
        request.request_get('/pigManagement/pighandle.hn', data, function (res) {
            if (res) {
                if (res.success) {
                    box.showToast('离场处理成功');
                    that.setData({
                        operation: 0
                    });
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
})