const app = getApp()
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')

Page({
    data: {
        piggery_sty:[], // 转出猪栏
        select_piggery_show:false,
        label_list:[],
        DialogInput: '',
        DialogInputType: '',  // 2健康出栏 3无害化处理
        DialogInputTypeLabelInfo:[], // 添加问题反馈得耳环信息
    },
    onLoad: function (){
        console.log("进入出栏页面");
    },
    //**********弹框 */
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

    // 获取猪栏内的信息**********************************
    getStyLabelInfo:function(sty_number){
        var that = this;
        console.log('获取栏内信息');
        var data = {
            sty_number: sty_number
        };
        request.request_get('/pigManagement/getPigLabelBySty.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var label_list = res.msg;
                    that.setData({ label_list: label_list})
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    
    // 选择猪舍***************
    select_piggery:function(){
        this.setData({select_piggery_show:true})
    },
    selectPiggeryStyData:function(e){
        var that = this;
        console.log('selectData')
        var piggery_sty = e.detail;
        console.log(piggery_sty)
        that.setData({select_piggery_show:false})
        if (piggery_sty.length == 2){
            // 获取耳环
            that.getStyLabelInfo(piggery_sty[1].number)
            that.setData({piggery_sty:piggery_sty})
        }else{
            console.log('参数传递异常')
        }
    },

    // 处理选中耳环id事件**************************
    img_checked:function(e){
        var that = this;
        var label_list = that.data.label_list;
        var label_id = e.currentTarget.dataset.id;
        console.log('耳环id选中事件发生change：', label_id);
        for (var i = 0; i < label_list.length; ++i) {
            if (label_list[i].label_id == label_id){
                label_list[i].checked = !label_list[i].checked
            }
        }
        this.setData({
            label_list: label_list,
        });
    },
    such:function(e){
        var that = this;
        var such_type = e.currentTarget.dataset.such_type; //2健康出栏3无害化处理
        var piggery_sty = that.data.piggery_sty;
        if(piggery_sty.length == 0){
            box.showToast('请选择转出猪栏!');
            return;
        }

        var label_list = that.data.label_list;
        var select_label_list = [];
        var normal = 0;  // 正常的数量
        var abnormality = 0; // 不正常的数量
        for(var i = 0; i < label_list.length; i++){
            if(label_list[i].checked){
                var obj = {'label_id': label_list[i].label_id, 'label_serial': label_list[i].serial}
                select_label_list.push(obj)
                if(label_list[i].status == 0){
                    normal += 1;
                }else{
                    abnormality += 1;
                }
            }
        }
        if(select_label_list.length == 0){
            box.showToast('请至少选择一条数据!');
        }else if(normal != 0 && abnormality != 0){
            // 不能同时进行操作
            that.setData({modalName:'noticesModal'})
        }else if(normal > 0 && such_type == '3'){
            // 正常猪进行无害化处理(仅限一头)
            if(select_label_list.length == 1){
                that.send_feedback(such_type, select_label_list );
            }else{
                that.setData({modalName:'noticesModal'})
            }
        }else if(abnormality > 0 && such_type == '2'){
            // 非正常猪进行健康出栏(仅限一头)
            if(select_label_list.length == 1){
                that.send_feedback(such_type, select_label_list);
            }else{
                that.setData({modalName:'noticesModal'})
            }
        }else{
            that.submit_such(select_label_list,such_type);
        }
    },
    send_feedback:function(such_type, label_list){
        var that = this;
        console.log("添加问题反馈");
        console.log(label_list)
        var DialogInputType = such_type;
        var DialogInputTypeLabelInfo = label_list;
        that.setData({DialogInputType:DialogInputType,modalName:'DialogAddFeedback',DialogInputTypeLabelInfo:DialogInputTypeLabelInfo})
    },
    submit_feedback:function(){
        var that = this;
        var DialogInput = that.data.DialogInput;
        var DialogInputType = that.data.DialogInputType;
        var DialogInputTypeLabelInfo = that.data.DialogInputTypeLabelInfo;
        var piggery_sty = that.data.piggery_sty;
        DialogInput = DialogInput.replace(/\s+/g, '');
        if (DialogInput == '') {
            box.showToast('请填写问题反馈')
        }else{
            console.log(DialogInputTypeLabelInfo)
            var data = {
                sty:piggery_sty[1].number,
                label_serial:DialogInputTypeLabelInfo[0]['label_serial'],
                label_id:DialogInputTypeLabelInfo[0]['label_id'],
                content:DialogInput,
                user_serial:app.globalData.userInfo.id,
                type:DialogInputType
            }
            request.request_get('/pigManagement/insertFeedback.hn', data, function (res) {
                console.info('回调', res)
                if (res) {
                    if (res.success) {
                        wx.showModal({
                            title: '成功',
                            content: '提交成功',
                            showCancel: false,
                            confirmText:'确定',
                            success: function (res) {
                                if (res.confirm) {
                                    that.setData({ DialogInput: [], modalName:null})
                                    that.submit_such(DialogInputTypeLabelInfo,DialogInputType);
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
    // 弹框输入的操作 **********************
    DialogInput:function(e){
        var value = e.detail.value
        // console.log(value);
        this.setData({ DialogInput: value})
    },
    // 出栏**********************************
    submit_such:function(label_list, such_type){
        var that = this;
        wx.showModal({
            title: '',
            content: '是否出栏',
            cancelText:'否',
            confirmText:'是',
            success: function (res) {
                if (res.confirm) {
                    box.showLoading('正在出栏');
                    var piggery_sty = that.data.piggery_sty;
                    var label_ids = [];
                    var label_serials = [];
                    for (var index in label_list) {
                        var label_id = label_list[index].label_id;
                        var label_serial = label_list[index].label_serial;
                        label_ids.push(label_id);
                        label_serials.push(label_serial);
                    }
                    label_ids = label_ids.join(",");
                    label_serials = label_serials.join(",");

                    var data = {
                        sty_number: piggery_sty[1].number,
                        label_ids: label_ids,
                        label_serials: label_serials,
                        operation: such_type,
                        user_serial: app.globalData.userInfo.id,
                        type:"1", //1正常出栏，2报警出栏
                    };

                    request.request_get('/pigManagement/such.hn', data, function (res) {
                        console.info('回调', res)
                        if (res) {
                            if (res.success) {
                                var result_arr = res.msg;
                                var fail_text = '';
                                var fail_list = [];
                                var success_list = [];
                                for(var a in result_arr){
                                    var result_label_id = result_arr[a].label_id;
                                    if(result_arr[a].success){
                                        success_list.push(result_label_id);
                                    }else{
                                        fail_list.push(result_label_id);
                                        var info = result_arr[a].label_id
                                        fail_text += info
                                        fail_text += '\r\n'
                                    }
                                }
                                wx.hideLoading()
                                if(fail_text == ''){
                                    wx.showModal({
                                        title: '成功',
                                        content: '出栏成功',
                                        showCancel: false,
                                        confirmText:'确定',
                                        success: function (res) {
                                            if (res.confirm) {
                                                that.getStyLabelInfo(piggery_sty[1].number)
                                            }
                                        }
                                    })
                                }else{
                                    wx.showModal({
                                        title: '出栏失败，请重试!',
                                        content: fail_text,
                                        showCancel: false,
                                        confirmText:'确定',
                                        success: function (res) {
                                            if (res.confirm) {
                                                that.getStyLabelInfo(piggery_sty[1].number)
                                            }
                                        }
                                    })
                                }
                            } else {
                                box.showToast(res.msg)
                            }
                        }
                    })
                }
            }
        })
    },

})