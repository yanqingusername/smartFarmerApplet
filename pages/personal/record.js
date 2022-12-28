const app = getApp();
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')
const time = require('../../utils/time.js')
const alarmImage = require('../../utils/alarmImage.js')

Page({
    data: {
        selectedType: 1,
        personnelArr: [],
        personnelIndex: 0,
        personnelValue:'',// 只作用于初始化
        date:time.today(new Date()),
        today:time.today(new Date()),
        swiperRestart:true, // 重置时将此参数设置为 false--》true
    },
    onLoad: function (){
        console.log('进入人员记录');
    },

    onShow:function(){
        var that = this;
        that.getPersonnelList();
    },

    // 弹框
    showModal(e) {
        this.setData({
            modalName: e.currentTarget.dataset.target
        })
    },
    hideModal(e) {
        this.setData({
            modalName: null
        })
    },
    
    // 类型切换
    selectFunc:function(e){
        var that = this;
        var initType = that.data.selectedType;
        var type = e.currentTarget.dataset.type;
        if(type != initType){
            that.setData({selectedType: type});
            that.getPersonnelList();
        }
    },

    // 获取人员列表
    getPersonnelList:function(){
        var that = this;
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id,
            source:that.data.selectedType,
        }
        request.request_get('/personnelManagement/getPersonnelList.hn', data, function (res) {
            console.info('回调', res)
            if(res.success){
                var personnelInfo = res.msg;
                var personnelArr = [];
                var personnelIndex = 0;
                var personnelValue = '';
                for(var a in personnelInfo){
                    var name = personnelInfo[a].name;
                    var job_number = personnelInfo[a].job_number;
                    if("1" == that.data.selectedType){
                        name = name + "(工号"+job_number+")";
                    }
                    if("2" == that.data.selectedType){
                        var admission_time = personnelInfo[a].admission_time;
                        name = name + "("+admission_time+"来访)";
                    }
                    var id = personnelInfo[a].id;
                    personnelArr.push({'name':name, 'job_number':job_number, 'id':id})
                }
                console.log(personnelArr)
                console.log(personnelIndex)
                that.setData({personnelArr:personnelArr, personnelIndex:personnelIndex,personnelValue:personnelValue});

                // 获取人员记录
                that.getPersonnelRecords();
            }else{
                box.showToast(res.msg)
            }
            box.hideLoading();
        })
    },
    
    // 人员改变
    personnelChange(e) {
        var that = this;
        that.setData({
            personnelIndex: e.detail.value
        })
        // 获取人员记录
        that.getPersonnelRecords();
    },

    // 日期改变
    DateChange(e) {
        var that = this;
        that.setData({
            date: e.detail.value
        })
        // 获取人员记录
        that.getPersonnelRecords();
    },

    // 获取人员记录
    getPersonnelRecords:function(){
        var that = this;
        that.setData({personnelRecords:null})
        if(that.data.personnelArr.length==0){
            that.setData({personnelRecords:[]})
            return;
        }
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id,
            source:that.data.selectedType,
            job_number: that.data.personnelArr[that.data.personnelIndex].job_number,
            source_id: that.data.personnelArr[that.data.personnelIndex].id,
            time:that.data.date
        }
        request.request_get('/personnelManagement/getPersonnelRecords.hn', data, function (res) {
            console.info('回调', res)
            if(res.success){
                var personnelRecords = res.msg;
                that.setData({personnelRecords:personnelRecords})
            }else{
                box.showToast(res.msg)
            }
            box.hideLoading();
        })

    },

    // 查看图片
    showImage:function(e){
        var that = this;
        var url = e.currentTarget.dataset.url;
        alarmImage.showImage(url, that);
    }
})