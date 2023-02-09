import * as echarts from '../../../ec-canvas/echarts.min';
const app = getApp();
const request = require('../../../utils/request.js')
const time = require('../../../utils/time.js')
const box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({
    data: {
        temp_date: time.getDate(new Date()),
        act_date: time.getDate(new Date()),
        today: time.getDate(new Date()),
        ledallowOperation: true,
        ledTip: false,
        ledOpenMsg: "正在连接耳环....",
        lairage_date: "",
        temp_date_type: "0",
        act_date_type: "0",
        LabelSumData: {},
        ec_pig_temp: {
            lazyLoad: true // 将 lazyLoad 设为 true 后，需要手动初始化图表
        },
        ec_pig_act: {
            lazyLoad: true // 将 lazyLoad 设为 true 后，需要手动初始化图表
        },
    },
    onLoad: function (options) {

        // sty=132&label_id=88665306&label_serial=2547&lairage_date=2021-05-19&host_serial=coyote_yizhuang_210517001&sty_num_custom=无&source_label=无

        this.setData({
            label_id: options.label_id || '88665306',
            lairage_date: options.lairage_date || '2021-05-19',
            label_serial: options.label_serial || '2547',
            host_serial: options.host_serial || 'coyote_yizhuang_210517001',
            sty_num_custom: options.sty_num_custom,
            source_label: options.source_label
        })
        // console.log('进入详情页' + options.label_id)
        this.pig_temp_component = this.selectComponent('#mychart-line_temp');
        this.pig_act_component = this.selectComponent('#mychart-line_act');
    },
    onShow: function () {
        this.getLabelSumData();
    },
    getLabelSumData: function () {
        var that = this;
        var label_id = that.data.label_id;
        var host_serial = that.data.host_serial;
        request.request_get('/pigManagement/showLabelSumfile.hn', {
            label_id: label_id,
            host_serial: host_serial
        }, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var LabelSumData = res.msg;
                    that.setData({
                        LabelSumData: LabelSumData
                    })
                    that.dealWithData(that.data.temp_date_type, "temp")
                    that.dealWithData(that.data.act_date_type, "act")
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
            temp_date_type: temp_date_type
        })
        that.dealWithData(temp_date_type, "temp")
    },
    //改变活跃度的选项
    act_time_type: function (e) {
        var that = this;
        var act_date_type = e.currentTarget.dataset.type;
        that.setData({
            act_date_type: act_date_type
        })
        that.dealWithData(act_date_type, "act")
    },

    // 处理数据
    dealWithData: function (timeType, lineType) {
        var that = this
        var LabelSumData = that.data.LabelSumData;
        var date = null;
        // 获取日期
        if (lineType == "temp") {
            date = that.data.temp_date;
        } else if (lineType == "act") {
            date = that.data.act_date;
        }

        // 设置横纵坐标
        var xdata = [];
        var ydata = [];
        if (timeType == '0') { // 天
            xdata = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
                '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
                '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
                '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
            ]
            if (typeof (LabelSumData[date]) == "undefined") { // 说明今天没有数据
                ydata = [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
            } else {
                var dayVals = LabelSumData[date][lineType];
                for (var a in xdata) {
                    var val = dayVals[xdata[a] + ":00"];
                    if (typeof (val) == "undefined") {
                        ydata.push(null)
                    } else {
                        ydata.push(val)
                    }
                }
            }

            xdata.push("24:00"); // 为第二天的数据
            var arr = date.split("/");
            var newDate = new Date(new Date(arr[0], (arr[1] - parseInt(1)), arr[2], '00', '00', '00').getTime() + 24 * 3600 * 1000);
            var tomorrow = time.getDate(newDate);
            // console.log(LabelSumData[tomorrow])
            if (typeof (LabelSumData[tomorrow]) == "undefined") {
                ydata.push(null)
            } else {
                if (typeof (LabelSumData[tomorrow][lineType]["00:00:00"]) == "undefined") {
                    ydata.push(null)
                } else {
                    ydata.push(LabelSumData[tomorrow][lineType]["00:00:00"])
                }
            }
        } else if (timeType == '1') { // 周近七天
            var days = time.getBefore7Date(new Date()); // 2020/07/10
            // console.log(days)
            for (var a in days) {
                var x_show_day = days[a].split("/")[1] + "/" + days[a].split("/")[2]
                if (typeof (LabelSumData[days[a]]) == "undefined") {
                    xdata.push(x_show_day)
                    ydata.push(null)
                } else {
                    xdata.push(x_show_day)
                    var dayVals = LabelSumData[days[a]][lineType];
                    var sum = 0;
                    var num = 0;
                    for (var a in dayVals) { // 必须存在一个，所以分母不会为0
                        num += 1;
                        sum += dayVals[a]
                    }
                    ydata.push(sum / num);
                }
            }
        } else if (timeType == '2') { // 6个月
            var months = time.get6Month(new Date());
            xdata = months;
            var months_dic = {};
            for (var a in months) {
                months_dic[months[a]] = [];
            }
            // 获取数据
            for (var a in LabelSumData) {
                var month = a.split("/")[0] + "/" + a.split("/")[1];
                if (utils.isInArray(month, months)) {
                    for (var b in LabelSumData[a][lineType]) {
                        months_dic[month].push(LabelSumData[a][lineType][b])
                    }
                } else {
                    continue;
                }
            }
            // 处理数据
            for (var a in months_dic) {
                if (months_dic[a].length == 0) {
                    ydata.push(null)
                } else {
                    var sum = 0;
                    for (var i = 0; i < months_dic[a].length; i++) {
                        sum += months_dic[a][i];
                    }
                    ydata.push(sum / months_dic[a].length)
                }
            }
        }

        // console.log(lineType + ":横坐标、纵坐标")
        // console.log(xdata)
        // console.log(ydata)

        var ydata_1 = that.processing_breakpoint_data(ydata, lineType);
        // console.log("断点处理后的数据")
        // console.log(ydata_1)

        if (lineType == "temp") {
            that.chartInit_temp(xdata, ydata_1, lineType, timeType)
        } else if (lineType == "act") {
            that.chartInit_act(xdata, ydata_1, lineType, timeType)
        }
    },
    chartInit_temp: function (xdata, ydata, lineType, timeType) {
        var that = this;
        that.pig_temp_component.init((canvas, width, height) => {
            const chartTemp = echarts.init(canvas, null, {
                width: width,
                height: height
            });
            chartTemp.showLoading();
            that.setLineOption(chartTemp, xdata, ydata, lineType, timeType);
            return chartTemp; // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        });
    },
    chartInit_act: function (xdata, ydata, lineType, timeType) {
        var that = this;
        that.pig_act_component.init((canvas, width, height) => {
            const chartAct = echarts.init(canvas, null, {
                width: width,
                height: height
            });
            chartAct.showLoading();
            that.setLineOption(chartAct, xdata, ydata, lineType, timeType);
            return chartAct; // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        });
    },
    setLineOption: function (chart, xdata, ydata, lineType, timeType) {
        var my_x_axisLabel = {}
        var my_y_axisLabel = {}
        var my_series = []
        var mycolor = [];
        var myminInterval = 1;
        var my_legend = {};
        var max = 'dataMax';
        var min = 'dataMin';
        if (lineType == 'temp') {
            mycolor = ["#FEA416", "#F8D055"]
            myminInterval = 0.5
            my_series = [{
                    name: '温度',
                    type: 'line',
                    smooth: true,
                    data: ydata
                }],
                my_y_axisLabel = {
                    show: true,
                    formatter: function (value) {
                        return value.toFixed(1);
                    }
                },
                my_legend = {
                    show: false
                }
        } else if (lineType == 'act') {
            max = 3; // 0-无活跃,1-低活跃,2-中等活跃,3-高活跃）
            min = 0; // 0-无活跃,1-低活跃,2-中等活跃,3-高活跃）
            mycolor = ["#455CE2"]
            myminInterval = 1
            my_series = [{
                    name: '活动量',
                    type: 'line',
                    smooth: true,
                    data: ydata
                }],
                my_y_axisLabel = {
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
                },
                my_legend = {
                    show: false
                }
        }
        //*************************** */
        if (timeType == '0') {
            my_x_axisLabel = {
                show: true,
                interval: 2
            }
        } else if (timeType == '1') {
            my_x_axisLabel = {
                show: true,
                interval: 0
            }
        }
        if (timeType == '2') {
            my_x_axisLabel = {
                show: true,
                interval: 0
            }
        }
        // **************************
        var option = {
            backgroundColor: "#ffffff",
            color: mycolor,
            title: {
                show: false
            },
            legend: my_legend,
            grid: {
                containLabel: true,
                top: 20,
                bottom: 0
            },
            tooltip: {
                show: true,
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: xdata,
                axisLabel: my_x_axisLabel,
            },
            yAxis: {
                x: 'center',
                type: 'value',
                splitLine: {
                    lineStyle: {
                        type: 'dashed'
                    }
                },
                min: min,
                max: max,
                minInterval: myminInterval,
                axisLabel: my_y_axisLabel

            },
            series: my_series
        };
        chart.setOption(option);
        chart.hideLoading();
        return chart;
    },

    goBack: function (e) {
        var that = this;
        var type = e.currentTarget.dataset.type;
        var date = null;
        if (type == 'act') {
            date = that.data.act_date;
        } else if (type == 'temp') {
            date = that.data.temp_date;
        } else {
            box.showToast("类型错误，请联系客服！");
            return;
        }
        if (date == that.data.lairage_date) {
            box.showToast("没有更多数据!")
        } else {
            var arr = date.split("/");
            var newDate = new Date(new Date(arr[0], (arr[1] - parseInt(1)), arr[2], '00', '00', '00').getTime() - 24 * 3600 * 1000);
            var newDateString = time.getDate(newDate);
            console.log(newDateString)
            let key = type + '_date'
            that.setData({
                [key]: newDateString
            })
            that.dealWithData("0", type)
        }
    },
    goNext: function (e) {
        var that = this;
        var type = e.currentTarget.dataset.type;
        var date = null;
        if (type == 'act') {
            date = that.data.act_date;
        } else if (type == 'temp') {
            date = that.data.temp_date;
        } else {
            box.showToast("类型错误，请联系客服！");
            return;
        }
        if (date == that.data.today) {
            box.showToast("没有更多数据!")
        } else {
            var arr = date.split("/");
            var newDate = new Date(new Date(arr[0], (arr[1] - parseInt(1)), arr[2], '00', '00', '00').getTime() + 24 * 3600 * 1000);
            var newDateString = time.getDate(newDate);
            console.log(newDateString)
            let key = type + '_date'
            that.setData({
                [key]: newDateString
            })
            that.dealWithData("0", type)
        }
    },
    processing_breakpoint_data: function (ydata, lineType) {
        var beforeVal = null; // 前一个值
        var afterVal = null; // 后一个值
        var needVal = []; //需要补充的值
        // console.log(lineType)
        // console.log(ydata)

        for (var i = 0; i < ydata.length; i++) {
            var val = ydata[i];
            if (val == null) { // 点为空
                // if (beforeVal != null) { // 点为空，且前一个值不为空
                //     needVal.push(i); // 将空点保存
                //     console.log(needVal)
                // } else {
                //     // 空点不处理
                // }
                needVal.push(i); // 将空点保存
                console.log(needVal)
            } else {
                console.log("非空点" + val)
                if (needVal.length == 0) { // 不存在空数据，记录最新点
                    beforeVal = val;
                } else { // 存在空数据
                    afterVal = val;
                    // 处理空点数据
                    if (lineType == 'temp') {
                        //RG 202203161345
                        //var average = (afterVal + beforeVal) / 2;
                        var average = afterVal;
                        for (var a in needVal) {
                            var index = needVal[a];
                            ydata[index] = average;
                        }
                    } else if (lineType == 'act') {
                        for (var a in needVal) {
                            var index = needVal[a];
                            ydata[index] = 0; // 无活跃度
                        }
                    }
                    needVal = [];
                }
            }
        }
        return ydata
    },
    clickPigAbnormalModuleInfoList(e) {
        // let sn = e.currentTarget.dataset.sn;
        // if(sn){
          wx.navigateTo({
            url: `/modulepages/pages/pigAbnormalModuleInfoList/index`,
          })
        // }
      },
})