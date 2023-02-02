const app = getApp();
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({
    data:{
        real_name: "",
        company: "",
		timestamp:new Date().getTime(),
        yearmouthday:"",
        freesum: '0',
        runningsum: '0',
        manRuningsum: '0',
        womanRuningsum: '0',
        manfreesum: '0',
        womanfreesum: '0',
        page: 1,
        limit: 10,
        iwadomListinfo: [],
        count: 0
    },

    onLoad:function(){
        // this.setData({
        //     real_name: app.globalData.userInfo.real_name,
        //     company: app.globalData.userInfo.company,
        // });
        // this.currentTime()
    },
    onShow:function(){
        this.setData({
            page: 1,
            real_name: app.globalData.userInfo.real_name,
            company: app.globalData.userInfo.company,
        });
        this.currentTime();
        this.getdeviceRun();
        this.getIwadomlistinfo();
    },
    /**
     * 当前日期
     */
     currentTime() {
        let tempTime = new Date(this.data.timestamp);
        let month=tempTime.getMonth() + 1;
        let day=tempTime.getDate();
        if(month<10){
            month="0"+month
        }
        if(day<10){
            day="0"+day
        }
        let curtime = tempTime.getFullYear() + "年" + (month) + "月" + day + "日";
        console.log('currentTime' + curtime);
        this.setData({
            yearmouthday: curtime
        })
    },
    getdeviceRun:function(){
        var that = this;
        var data = {
            company_serial: app.globalData.userInfo.company_serial
        }
        request.request_get('/equipmentManagement/getdeviceRun.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    that.setData({
                        freesum: res.freesum, //空闲总数
                        runningsum: res.runningsum, //运行总数
                        manRuningsum: res.manRuningsum, //男运行数
                        womanRuningsum: res.womanRuningsum, //女运行数
                        manfreesum: res.manfreesum, //男空闲数
                        womanfreesum: res.womanfreesum //女空闲数
                    });
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    bindHandlerClick(e){
        let urlstring = e.currentTarget.dataset.urlstring;
        if(urlstring){
            wx.navigateTo({
                url: urlstring
            });
        }
    },
    onReachBottom: function () {
        this.getIwadomlistinfo();
      },
    getIwadomlistinfo:function(){
        var that = this;
        var data = {
            id: app.globalData.userInfo.id,  //登录人的id
            start_time: "", //开始时间，第二个接口用  默认当前
            end_time: "", //结束时间 同开始时间
            status: '2', //洗消状态 1成功 2失败 0沐浴中
            workType:"", //上下班 0是上班 1是下班  ""全部
            staffids: '', //员工id以','分割
            page: this.data.page,
            limit: this.data.limit
        }
        request.request_get('/iwadom/getIwadomlistinfo.hn', data, function (res) {
            if (res) {
                if (res.success) {
                  if (that.data.page == 1) {
                    that.setData({
                        count: res.count,
                        iwadomListinfo: res.data,
                      page: (res.data && res.data.length > 0) ? that.data.page + 1 : that.data.page
                    });
                  } else {
                    that.setData({
                        count: res.count,
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
})