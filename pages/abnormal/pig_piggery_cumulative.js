import * as echarts from '../../ec-canvas/echarts.min';
const app = getApp();
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')
const time = require('../../utils/time.js')

Page({
    data: {
        type: '1', // 全部
        date_type:'0',
        now: time.nowDate(new Date()),
        ec_pig: {
            lazyLoad: true // 将 lazyLoad 设为 true 后，需要手动初始化图表
        },
        processing_statistics: {'all': 0, 'unfinished': 0}
    },
    onLoad: function (options){
        this.setData({
            piggery: options.piggery
        })
        console.log('猪只检测累计报警');
        this.pig_component = this.selectComponent('#mychart-line');
    },
    onShow:function(){
        var that = this;
        var type = that.data.type
        var date_type = that.data.date_type;
        that.getPiggeryName()
        that.getPigHistory(type, date_type);
        that.operationNum();
    },
    // 获取猪舍名称
    getPiggeryName:function(){
        var that = this;
        // 获取猪舍名称
        request.request_get('/pigManagement/getNamebyPiggeryId.hn', {id: that.data.piggery}, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var piggery_name = res.msg;
                    that.setData({ piggery_name: piggery_name})
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    // 获取猪舍的处理记录
    operationNum:function(){
        var that = this;
        var piggery = that.data.piggery;
        let ps = that.data.processing_statistics;
        ps.all = 0;
        ps.unfinished = 0;

        var data = {
            pig_farm:app.globalData.userInfo.pig_farm_id,
            piggery:piggery,
            processing_statistics:ps
        }
        request.request_get('/pigManagement/getAlarmInfoNowByPiggery.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var processing_statistics = that.data.processing_statistics;
                    for(var a in res.msg){
                        if(res.msg[a].status == 0){
                            processing_statistics.all = Number(processing_statistics.all) + Number(res.msg[a].num)
                            processing_statistics.unfinished = Number(processing_statistics.unfinished) + Number(res.msg[a].num)
                            // processing_statistics.all = Number(res.msg[a].num)
                            // processing_statistics.unfinished = Number(res.msg[a].num)
                        }else if(res.msg[a].status == 1){
                            processing_statistics.all = Number(processing_statistics.all) + Number(res.msg[a].num)
                            // processing_statistics.all = Number(res.msg[a].num)
                        }else if(res.msg[a].status == 2){
                            processing_statistics.all = Number(processing_statistics.all) + Number(res.msg[a].num)
                            // processing_statistics.all = Number(res.msg[a].num)
                        }
                    }
                    that.setData({processing_statistics:processing_statistics})
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    // 根据猪场获取历史记录
    getPigHistory:function(type, date_type){
        var that = this;
        var piggery = that.data.piggery;
        var data = {
            piggery:piggery,
            type:type,
            date_type:date_type
        }
        request.request_get('/pigManagement/getAlarmHistoryByPiggery.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    that.dealWithData(res.msg, date_type)
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    // 更改时间类型
    select_time_type:function(e){
        var that = this;
        var date_type = e.currentTarget.dataset.type;
        var type = that.data.type
        that.getPigHistory(type, date_type)
        that.setData({date_type: date_type})
    },
    // 处理横纵坐标数据
    dealWithData:function(data, type){
        var that = this
        var xdata = []
        var ydata = []
        var axisLabel = {}
        if(type == '0'){
            for(var i=0;i<7;i++){
                var timeResult = time.getNextDate(new Date(), i-6)
                xdata.push(timeResult)
            }
            console.log('获取的横坐标是')
            console.log(xdata)
            for (var a in xdata){
                var needTime = xdata[a]
                var flag = false
                for(var b in data){
                    if(data[b].time == needTime){
                        ydata.push(data[b].num )
                        flag = true;
                        break;
                    }
                }
                if(!flag){
                    ydata.push(0)
                }
                xdata[a] =  xdata[a].substring(5, 10)
            }
            axisLabel = { //设置x轴的字
                show:true,
                interval:0,
            }
        }else if(type == '1'){
            var myDate = new Date();
            var date = myDate.getDate();        //获取当前日(1-31)
            var monthNum = time.mGetDate();
            for(var i=0;i<monthNum;i++){
                var item = i + 1;
                if(item < 10){
                    item =  '0' + item
                }else {
                    item =  '' + item
                }
                xdata.push(item)
            }
            console.log('获取的横坐标是')
            console.log(xdata)
            for (var a in xdata){
                var needTime = xdata[a]
                var flag = false
                for(var b in data){
                    if(data[b].time.substring(8, 10) == needTime){
                        ydata.push(data[b].num )
                        flag = true;
                        break;
                    }
                }
                if(!flag){
                    if(date<needTime){
                        ydata.push(null)
                    }else{
                        ydata.push(0)
                    }
                }
            }
            axisLabel = { //设置x轴的字
                show:true,
                interval:2,
            }
        }else if(type == '2'){
            xdata = time.get6Month1(new Date());
            console.log('获取的横坐标是')
            console.log(xdata)
            for (var a in xdata){
                var needTime = xdata[a]
                var flag = false
                for(var b in data){
                    if(new Number(data[b].time.substring(5, 7)) == needTime){
                        // 默认平均值 一月31天
                        ydata.push(Math.ceil(data[b].num/31))
                        flag = true;
                        break;
                    }
                }
                if(!flag){
                    ydata.push(0)
                }
            }
            axisLabel = { //设置x轴的字
                show:true,
                interval:0,
            }
            for(var i in xdata){
                xdata[i] = xdata[i] + '月'
            }
        }
        console.log('获取的纵坐标是')
        console.log(ydata)
        that.chartInit(xdata,ydata,axisLabel)
    },
    
    // 开始画图
    chartInit:function(xdata,ydata,axisLabel){
        var that = this;
        that.pig_component.init((canvas, width, height) => {
            const chart = echarts.init(canvas, null, { width: width, height: height});
            that.setLineOption(chart, xdata, ydata,axisLabel);
            return chart;  // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        });    
    },
    
    setLineOption:function(chart, xdata, ydata,axisLabel){
        var option = {
            backgroundColor: "#ffffff",
            color: ["#E60012"],
            title: {
                show: false
            },
            legend: {
                show: false
            },
            grid: {
                containLabel: true,
                top: 20,
                bottom:0
            },
            tooltip: {
                show: true,
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data:xdata,
                axisLabel: axisLabel,
            },
            yAxis: {
                x: 'center',
                type: 'value',
                splitLine: {
                    lineStyle: {
                    type: 'dashed'
                    }
                },
                minInterval: 1,
                y:'dataMin'
            },
            series: [{
                name: '数量',
                type: 'line',
                smooth: true,
                data: ydata
            }]
        };
        chart.setOption(option);
        return chart;
    },
    go_history:function(){
        wx.navigateTo({
            url: '/pages/abnormal/pig_piggery_alarm_history?piggery=' + this.data.piggery,
        })
    }
})