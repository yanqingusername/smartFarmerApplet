import * as echarts from '../../ec-canvas/echarts.min';
const app = getApp();
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')
const utils = require('../../utils/utils.js')

Page({
    data:{
		ratio: app.globalData.ratio,
		ec_pig: {
            lazyLoad: true // 将 lazyLoad 设为 true 后，需要手动初始化图表
        },
        showMainDeviceInfoList: [],
        showMainAlarmInfoList: []
    },

    onLoad:function(){
        console.log("进入首页");
        var applet_permissions_list = app.globalData.userInfo.applet_permissions_list;
        console.log("权限信息:" + applet_permissions_list);
        this.setData({applet_permissions_list:applet_permissions_list});
    },

    onShow:function(){
        var that = this;
        var applet_permissions_list = that.data.applet_permissions_list;
        if(utils.list1_inexistence_list2(['1','2','3','4','5','6'],applet_permissions_list)){
            that.getUntreatedAlarmNum();
        }
        if(utils.isInArray('7', applet_permissions_list)){
            // that.pigFarmPie();
        }

        this.getShowMainDeviceInfo();
        this.getShowMainAlarmInfo();
    },

    //*******获取未处理异常预警数*********
    getUntreatedAlarmNum:function(){
        var that = this;
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id
        }
        request.request_get('/pigProjectApplet/getUntreatedAlarmNum.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var alarmNum = res.msg;
                    that.setData({alarmNum:alarmNum});
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },

    //******猪场存栏******************
    pigFarmPie:function(){
        var that = this;
        that.pig_pie = that.selectComponent('#pig-pie'); // 饼状图
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id
        }
        request.request_get('/pigManagement/getPigNumByType.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var data = res.msg;
                    var pig_pie_data = [
                        { name: '母猪', value: data.sowNum },
                        { name: '公猪', value: data.boarNum },
                        { name: '仔猪', value: data.pigletsNum },
                        { name: '肥猪', value: data.pigNum }
                    ]
                    that.pigChartInit(pig_pie_data);
                } else {
                    box.showToast(res.msg);
                }
            }
        })
    },
    
    // ---------------------饼状图设置--------------------------
    pigChartInit: function (data) {
        var that = this;
        that.pig_pie.init((canvas, width, height) => {
            const chart = echarts.init(canvas, null, { width: width, height: height });
            var pig_num_sum = 0;
            for (let i in data) {
                pig_num_sum += data[i].value
            }
            that.setPigPieOption(chart, data, pig_num_sum);
            that.pig_chart = chart; // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
            return chart;  // 注意这里一定要返回 chart 实例，否则会影响事件处理等
        });    
    },
    setPigPieOption: function (chart, data, sum){
        var that = this;
        var ratio = that.data.ratio;
        console.log("px和rpx比例：" + ratio)
        var font_val = 28;
        var font_num = 20;
        // 标签的参数
        var legend = [
            {
                left: 30*ratio,top: 38*ratio,itemHeight: 24*ratio,itemWidth: 6*ratio,data: [data[0].name],
                formatter: function () {return ["{value|"+data[0].value+"}","{name|"+data[0].name+"}"].join('\n');},
                textStyle: {rich: {
                    value: {fontSize: font_val,fontFamily:'SHSCN_Regular',color: '#327ff6',padding: [0, 0, 10*ratio, 10*ratio]},
                    name: {fontSize: font_num,fontFamily:'SHSCN_Regular',color: '#999999',padding: [0, 0, 0, 10*ratio]}
                }},
                selectedMode:false,//取消图例上的点击事件
            },{
                right: 45*ratio,top: 38*ratio,itemHeight: 24*ratio,itemWidth: 6*ratio,data: [data[1].name],
                formatter: function () {return ["{value|"+data[1].value+"}","{name|"+data[1].name+"}"].join('\n');},
                textStyle: {rich: {
                    value: {fontSize: font_val,fontFamily:'SHSCN_Regular',color: '#327ff6',padding: [0, 0, 10*ratio, 10*ratio]},
                    name: {fontSize: font_num,fontFamily:'SHSCN_Regular',color: '#999999',padding: [0, 0, 0, 10*ratio]}
                }},
                selectedMode:false,//取消图例上的点击事件
            },{
                left: 30*ratio,bottom: 40*ratio,itemHeight: 24*ratio,itemWidth: 6*ratio,data: [data[2].name],
                formatter:function () {return ["{value|"+data[2].value+"}","{name|"+data[2].name+"}"].join('\n');},
                textStyle: {rich: {
                    value: {fontSize: font_val,fontFamily:'SHSCN_Regular',color: '#327ff6',padding: [0, 0, 10*ratio, 10*ratio]},
                    name: {fontSize: font_num,fontFamily:'SHSCN_Regular',color: '#999999',padding: [0, 0, 0, 10*ratio]}    
                }},
                selectedMode:false,//取消图例上的点击事件
            },{
                right: 45*ratio,bottom: 38*ratio,itemHeight: 24*ratio,itemWidth: 6*ratio,data: [data[3].name],
                formatter:function () {return ["{value|"+data[3].value+"}","{name|"+data[3].name+"}"].join('\n');},
                textStyle: {rich: {
                    value: {fontSize: font_val,fontFamily:'SHSCN_Regular',color: '#327ff6',padding: [0, 0, 10*ratio, 10*ratio]},
                    name: {fontSize: font_num,fontFamily:'SHSCN_Regular',color: '#999999',padding: [0, 0, 0, 10*ratio]}    
                }},
                selectedMode:false,//取消图例上的点击事件
            }]
        // 标题的参数
        var title = [{
            show: true, 
            x: 'center', 
            y: 'center', 
            backgroundColor: '#984455',
            text: ["{num|" + sum + "}","{title|猪场存栏}"].join('\n'),
            textStyle: {
                rich: {
                    num: {fontSize: 48*ratio, fontFamily:'SHSCN_Regular', color: "#333333", padding: 14*ratio},
                    title: {fontSize: 24*ratio, fontFamily:'SHSCN_Regular', color: "#333333"}
                }
            }
        }]
        var option = {
            backgroundColor: "#ffffff",
            color: ["#327ff6", "#c8004c", "#FFA024","#00FF00"],
            title: title,
            legend: legend,
            //饼状图的数据*********
            series: [{
                label: {normal: { show: false }},
                type: 'pie',
                center: ['50%', '50%'],
                radius: [89*ratio, 119*ratio],
                data: data,
            }]
        };
        chart.setOption(option);
    },

    // 进入异常报警中的猪只
    enter_alarm_pig:function(){
        // wx.navigateTo({
        //     url: '/pages/abnormal/pig',
        // })

        //异常猪只报表
         wx.navigateTo({
            url: '/modulepages/pages/pigAbnormalModuleList/index',
        })
    },
    // 进入异常报警中人员
    enter_alarm_personnel:function(){
        // wx.navigateTo({
        //     url: '/pages/abnormal/personnel',
        // })

        //淋浴一体机模块
        wx.navigateTo({
            url: '/modulepages/pages/homeIndex/index',
        })
    },
    // 进入异常报警中车辆
    enter_alarm_car:function(){
        wx.navigateTo({
            url: '/pages/abnormal/car',
        })
    },
    // 进入异常报警中的异物
    enter_alarm_illegal:function(){
        // wx.navigateTo({
        //     url: '/pages/abnormal/illegal',
        // })

        //异物
        wx.navigateTo({
            url: '/modulepages/pages/foreignMatterModuleList/index',
        })
    },
    // 进入异常报警中的物品
    enter_alarm_goods:function(){
        // wx.navigateTo({
        //     url: '/pages/abnormal/goods',
        // })

        //臭氧模块
        wx.navigateTo({
            url: '/modulepages/pages/ozoneModuleList/index?eid=1',
        })
    },
    // 进入异常报警中的设备
    enter_alarm_equipment:function(){
        wx.navigateTo({
            url: '/pages/abnormal/equipment',
        })
    },
    // 进入异常报警中的门禁
    enter_alarm_access:function(){
        wx.navigateTo({
            url: '/pages/abnormal/access',
        })
    },

    // 疫苗接种页面
    enter_vaccine:function(){
        wx.navigateTo({
            url: '/pages/pigOperation/vaccine',
        })
    },
    //进入病原检测页面
    enter_pathogen:function(){
        wx.navigateTo({
            url: '/pages/pigOperation/pathogen',
        })
    },
    /**
     * 2023-02-02 新增进入模块设备列表与管理
     */
    bindClickHandler(){
        wx.navigateTo({
            url: '/modulepages/pages/moduleMain/index',
        })
    },
    bindClickInstructionsModule(){
        wx.navigateTo({
            url: '/modulepages/pages/instructionsModule/index',
        })
    },
    /**
     * 获取首页数据
     */
    getShowMainDeviceInfo:function(){
        var that = this;
        var data = {
            pig_farm_id: app.globalData.userInfo.pig_farm_id
        }
        request.request_get('/equipmentManagement/getShowMainDeviceInfo.hn', data, function (res) {
            if (res) {
                if (res.success) {
                    that.setData({
                        showMainDeviceInfoList: res.data
                    });
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    //报警
    getShowMainAlarmInfo:function(){
        var that = this;
        var data = {
            pig_farm_id: app.globalData.userInfo.pig_farm_id
        }
        request.request_get('/equipmentManagement/getShowMainAlarmInfo.hn', data, function (res) {
            if (res) {
                if (res.success) {
                    that.setData({
                        showMainAlarmInfoList: res.data
                    });
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    bindClickMoudleHandler(e){
        let pathstring = e.currentTarget.dataset.pathurl;
        if(pathstring){
            wx.navigateTo({
                url: pathstring,
            });
        }
    },
})