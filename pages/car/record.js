const app = getApp()
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')
const alarmImage = require('../../utils/alarmImage.js')

Page({
    data: {
        loading:false, //加载中
        isEnd:false, // 是否结束
        page:0,
        limit:10,
        car_num:'',
        date:'',
        swiperRestart:true, // 重置时将此参数设置为 false--》true
    },

    onLoad: function (){
        var that = this;
        console.log('进入车辆记录页面' );
        that.getCarList();
    },
    onShow:function(){
        var that = this;
        that.getCarList();
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

    // 获取车辆列表
    getCarList:function(){
        var that = this;
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id
        }
        request.request_get('/carManagement/getCarList.hn', data, function (res) {
            console.info('回调', res)
            if(res.success){
                var carInfo = res.msg;
                var carArr = [];
                var carIndex = 0;
                var carValue = '';
                for(var a in carInfo){
                    var car_num = carInfo[a].car_num;
                    var type_name = carInfo[a].type_name;
                    var name = car_num + "("+type_name+")";
                    carArr.push({'name':name, 'value':car_num})
                }
                console.log(carArr)
                console.log(carIndex)
                that.setData({carArr:carArr, carIndex:carIndex,carValue:carValue});
                if(carArr.length!=0){
                    that.getCarRecords(0);
                }
            }else{
                box.showToast(res.msg)
            }
        })
    },

    // 获取车辆记录记录
    getCarRecords:function(page){
        var that = this;
        if(that.data.carArr.length==0){
            return;
        }
        that.setData({loading:true});
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id, 
            page: page,
            limit:that.data.limit,
            car_num: that.data.carArr[that.data.carIndex].value,
            time:that.data.date,
        }
        request.request_get('/carManagement/getCarRecords.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var data_list = res.msg;
                    var data_list_all = that.data.data_list;
                    if(typeof(data_list_all) != "undefined"){
                        if(data_list.length==0){
                            that.setData({isEnd:true}); // 没有了
                        }else{
                            if(page == that.data.page + 1){
                                data_list_all.push.apply(data_list_all,data_list);
                                that.setData({page:page});
                            }else if(page == 0){
                                data_list_all = data_list;
                                that.setData({page:page});
                            }
                        } 
                    }else{ // 第一次进入
                        data_list_all = data_list;
                    }
                    that.setData({data_list: data_list_all})
                } else {
                    box.showToast(res.msg)
                }
            }
            that.setData({loading: false})
        })
    },

    // 数据重置
    reSetData:function(){
        var that = this;
        that.setData({data_list: undefined,isEnd:false,loading:false,page:0,})
    },

    // 选择车辆
    carChange(e) {
        var that = this;
        that.setData({
            carIndex: e.detail.value
        })
        that.reSetData();
        that.getCarRecords(0);
    },

    // 日期改变
    DateChange(e) {
        var that = this;
        that.setData({
            date: e.detail.value
        })
        that.reSetData();
        that.getCarRecords(0);
    },

    //-------------上拉加载*---------------
    onReachBottom() {
        var that = this;
        if(!that.data.loading && !that.data.isEnd){
            var page = that.data.page + 1;
            that.getCarRecords(page);
        }
    },

    // 查看图片
    showImage:function(e){
        var that = this;
        var url = e.currentTarget.dataset.url;
        alarmImage.showImage(url, that);
    }
})