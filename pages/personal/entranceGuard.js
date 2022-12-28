const app = getApp();
const request = require('../../utils/request.js')
const time = require('../../utils/time.js')
const box = require('../../utils/box.js')


Page({
    data: {
        loading:false,
        isEnd:false,
        page:0,
        limit:10,
        // 日期
        date:time.today(new Date()),
        today:time.today(new Date()),
        // 门禁
        doorArr:[
            {'name':'--请选择门禁--','value':'-1','index':0}
        ],
        doorIndex: 0,
        // 卡号
        cardNoArr:[
            {'name':'--请选择卡号--','value':'-1','index':0}
        ],
        cardNoIndex: 0,
    },
    onLoad: function (){
        console.log('异物监测');
    },
    onShow:function(){
        var that = this;
        that.getDoorIdS();
        that.getCardNos();
        that.getEntranceGuardRecord(that.data.page);
    },
    
    //*****************************弹框start*******************************************
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
    //****************************弹框end**********************************************


    //****************************获取门禁记录start********************************
    getEntranceGuardRecord:function(page){
        var that = this;
        that.setData({loading:true})
        var farm_num = app.globalData.userInfo.pig_farm_id;
        var data = {
            pig_farm:farm_num,
            page: page,
            limit:that.data.limit,
            date:that.data.date,
            door:that.data.doorArr[that.data.doorIndex].value,
            cardNo:that.data.cardNoArr[that.data.cardNoIndex].value,
        }
        request.request_get('/personnelManagement/getEntranceGuardRecord.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var record = res.msg;
                    for(var a in record){
                        var time_second = record[a]["time_second"];
                        var time = that.timestampTurnsTime(time_second);
                        record[a]["time"] = time;
                    }
                    var record_old = that.data.record;
                    if(typeof(record_old) != "undefined"){
                        if(record.length == 0){
                            // 没有了
                            that.setData({isEnd:true})
                        }else{
                            if(page == that.data.page + 1){
                                record_old.push.apply(record_old,record);
                                that.setData({page:page})
                            }else if(page == 0){
                                record_old = record;
                                that.setData({page:page})
                            }else{
                                // nodo
                            }
                        }
                    }else{
                        // 第一次进入
                        record_old = record;
                    }
                    that.setData({record: record_old})
                } else {
                    box.showToast(res.msg)
                }
                that.setData({loading:false})
            }
        })
    },
    //上拉加载数据
    onReachBottom() {
        var that = this;
        if(!that.data.loading && !that.data.isEnd){
            var page = that.data.page + 1;
            that.getEntranceGuardRecord(page);
        }else{
            // nodo
        }
    },
    //****************************获取异物报警数据end********************************

    //********************************时间选择器 */
    DateChange(e) {
        this.setData({
            date: e.detail.value
        })
    },
    goBack:function(){
        var that = this;
        var date = that.data.date;
        var arr = date.split("-");
        var date = new Date(new Date(arr[0],(arr[1]-parseInt(1)),arr[2],'00','00','00').getTime() - 24 * 3600 * 1000);
        var newDateString = time.today(date);
        console.log(newDateString)
        that.setData({date:newDateString,record:null});
        that.getEntranceGuardRecord(0);
    },
    goNext:function(){
        var that = this;
        var date = that.data.date;
        var today = that.data.today;
        if(today == date){
            box.showToast('已是最新日期')
        }else{
            var arr = date.split("-");
            var date = new Date(new Date(arr[0],(arr[1]-parseInt(1)),arr[2],'00','00','00').getTime() + 24 * 3600 * 1000);
            var newDateString = time.today(date);
            console.log(newDateString)
            that.setData({date:newDateString,record:null});
            that.getEntranceGuardRecord(0);   
        }
    },

    //****************************门禁选择 */ 
    getDoorIdS:function(){
        var that = this;
        var farm_num = app.globalData.userInfo.pig_farm_id;
        var data = {
            pig_farm:farm_num
        }
        request.request_get('/personnelManagement/getEntranceGuardIDS.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var doorIds = res.msg;
                    var doorArr = [{'name':'--请选择门禁--','value':'-1','index':0}];
                    for(var a in doorIds){
                        var door_id = doorIds[a]["door_id"];
                        var door_name = "门禁" + door_id;
                        var json_door = {"name":door_name, "value": door_id, "index": a+1};
                        doorArr.push(json_door);
                    }
                    that.setData({doorArr: doorArr})
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },

    doorChange:function(e) {
        var that = this;
        console.log(e);
        this.setData({
            doorIndex: e.detail.value
        })
        that.setData({record:null});
        that.getEntranceGuardRecord(0);   
    },

    //*****************************门禁时间戳***********************
    timestampTurnsTime:function(timeStampStr){
        var timeStamp = parseInt(timeStampStr);
        var second = parseInt(timeStamp % 60);
        timeStamp /= 60;
        var minute = parseInt(timeStamp % 60);
        timeStamp /= 60;
        var hour =  parseInt(timeStamp % 24);
        timeStamp /= 24;
        var day =  parseInt(timeStamp % 31 + 1);
        timeStamp /= 31;
        var month =  parseInt(timeStamp % 12 + 1);
        timeStamp /= 12;
        var year =  parseInt(timeStamp + 2000)
        return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    },

    //****************************卡号选择 */ 
    getCardNos:function(){
        var that = this;
        var farm_num = app.globalData.userInfo.pig_farm_id;
        var data = {
            pig_farm:farm_num
        }
        request.request_get('/personnelManagement/getEntranceGuardCardNos.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var cardNos = res.msg;
                    var cardNoArr = [{'name':'--请选择卡号--','value':'-1','index':0}];
                    for(var a in cardNos){
                        var card_id = cardNos[a]["card_no"];
                        var card_name = cardNos[a]["card_no"];
                        var json_card = {"name":card_name, "value": card_id, "index": a+1};
                        cardNoArr.push(json_card);
                    }
                    that.setData({cardNoArr: cardNoArr})
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },

    cardNoChange:function(e) {
        var that = this;
        console.log(e);
        this.setData({
            cardNoIndex: e.detail.value
        })
        that.setData({record:null});
        that.getEntranceGuardRecord(0);
    },
})