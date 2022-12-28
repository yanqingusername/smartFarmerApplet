const app = getApp();
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')

Page({
    data:{
        enter_piggery_sty:[], //转入猪栏        
        select_piggery:'',
        select_piggery_name:'',
        DialogInput:'',
        index:0,
        array:['无','转栏','无害化处理'],
        modalName2:'',
        sty_number:'',
        sty_name:'',
        piggery_name:''
    },

    onLoad: function (options){
        this.setData({
            log_id:options.log_id
        })
    },
    onShow:function(){
        this.getLogInfo();
    },
    //**********弹框 */
    showModal(e) {
        this.setData({
            modalName: e.currentTarget.dataset.target
        })
    },
    hideModal(e) {
        this.setData({
            modalName: null,
            index:0,
            sty_number:'',
            sty_name:'',
            piggery_name:''
        })
    },
    hideModal2(e) {
        this.setData({
            modalName2: null,
            index:0,
            sty_number:'',
            sty_name:'',
            piggery_name:''
        })
    },
    getLogInfo:function(){
        var that = this;
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id,
            id:that.data.log_id,
        }
        request.request_get('/pigManagement/getAlarmInfoById.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var alarmInfo = res.alarmInfo;
                    var pigInfo = res.pigInfo;
                    var operationList = res.operationList;
                    that.setData({alarmInfo:alarmInfo,pigInfo:pigInfo,operationList:operationList})
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    // 转栏*****************
    check_jump:function(){
        var that = this;
        // 选择猪栏
        that.select_piggery();
    },
    // 选择猪舍***************
    select_piggery:function(e){
        var that = this;
        var modalName = 'piggeryStyModal';
        that.setData({piggery_lst:[]})
        var select_piggery = '';
        var select_piggery_name = '';
        var data = {
            pig_farm:app.globalData.userInfo.pig_farm_id
        }
        // 获取猪舍*********
        request.request_get('/pigManagement/getPiggery.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var piggery_lst = res.msg;
                    that.setData({piggery_lst:piggery_lst,modalName2:modalName,select_piggery:select_piggery,select_piggery_name:select_piggery_name});
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    selectSty:function(e){
        var that = this;
        that.setData({sty_lst:[]}) //清空
        var piggery_number = e.currentTarget.dataset.piggery_number;
        var piggery_name = e.currentTarget.dataset.piggery_name;
        var data = {
            pig_farm:app.globalData.userInfo.pig_farm_id,
            piggery_number:piggery_number
        }
        request.request_get('/pigManagement/getStyByPiggery.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var list = res.msg;
                    var sty_lst = []
                    // 过滤本猪栏
                    for(var a in list){
                        if(list[a].sty_number == that.data.pigInfo.sty_number){
                            //nodo
                        }else{
                            sty_lst.push(list[a])
                        }
                    }
                    that.setData({sty_lst:sty_lst,select_piggery:piggery_number,select_piggery_name:piggery_name});
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    againSelectPiggery:function(){
        this.setData({select_piggery:'',select_piggery_name:''})
    },
    finishStySelect:function(e){
        var that = this;
        var sty_number = e.currentTarget.dataset.sty_number;
        var sty_name = e.currentTarget.dataset.sty_name;
        var piggery_name = that.data.select_piggery_name;
        that.setData({
            sty_number:sty_number,
            sty_name:sty_name,
            piggery_name:piggery_name,
            modalName2:null
        })
    },    
    // 问题反馈****************
    send_feedback:function(){
        var that = this;
        console.log("添加问题反馈");
        that.setData({modalName:'DialogAddFeedback'})
    },
    // 弹框输入的操作 **********************
    DialogInput:function(e){
        var value = e.detail.value
        // console.log(value);
        this.setData({ DialogInput: value})
    },
    submit_feedback:function(){
        var that = this;
        var pigInfo = that.data.pigInfo;
        var DialogInput = that.data.DialogInput;
        DialogInput = DialogInput.replace(/\s+/g, '');
        if (DialogInput == '') {
            box.showToast('请填写问题反馈')
        }else{
            var data = {
                sty:pigInfo.layout_id,
                label_serial:pigInfo.serial,
                label_id:pigInfo.label_id,
                content:DialogInput,
                user_serial:app.globalData.userInfo.id,
                f_type:"1", //问题反馈类型，0普通反馈 1报警猪反馈 2非正常猪进行健康出栏 3正常猪进行无害化处理
                alarm_id:that.data.log_id,
                sty_number: pigInfo.layout_id,
                label_ids: pigInfo.label_id,
                label_serials: pigInfo.serial,
                operation: 3,
                c_type:"2",
                alarm_problem_back: pigInfo.layout_id, 
                index:that.data.index,
                oldsty: pigInfo.layout_id,
                newsty: that.data.sty_number,
                z_type:"2"
            }
            request.request_get('/pigManagement/feedback.hn', data, function (res) {
                console.info('回调', res)
                if (res) {
                    that.setData({modalName:null})
                    if (res.success) {
                        wx.showModal({
                            title: '成功',
                            content: '提交成功',
                            showCancel: false,
                            confirmText:'确定',
                            success: function (res) {
                                if (res.confirm) {
                                    that.getLogInfo();
                                }
                            }
                        })
                    } else {
                        box.showToast(res.msg)
                    }
                }
            })
        }
    },
    bindPickerChange: function(e) {

        var that = this;
        var index = e.detail.value;
        that.setData({
          index: index
        })
        if(index==1){
            //转栏
            this.check_jump();
        }else{
            that.setData({
            sty_number:'',
            sty_name:'',
            piggery_name:''
              })
        }
      },
})