const app = getApp()
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')

Page({
    data:{
        enter_piggery_sty:[], //转入猪栏        
        select_piggery:'',
        select_piggery_name:'',
        select_piggery_show:false,
        monitor:0
    },

    onLoad: function (options){
        var applet_permissions_list = app.globalData.userInfo.applet_permissions_list;
        console.log("权限信息:" + applet_permissions_list);

        this.setData({
            sty: options.sty,
            label_id_enter:options.label_id,
            applet_permissions_list:applet_permissions_list
        })
    },

    onShow:function(){
        // 获取定位
        this.positioning()
        // 获取栏内信息
        this.getStyLabelInfo()
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
    // 显示位置信息*********************
    positioning:function(){
        var that = this;
        request.request_get('/pigManagement/getNamebyStyId.hn', {id: that.data.sty}, function (res) {
            console.info('显示位置信息回调', res)
            if (res) {
                if (res.success) {
                    var name = res.msg;
                    that.setData({ name: name,monitor:res.monitor})
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    
    // 获取猪栏内的信息**********************************
    getStyLabelInfo:function(){
        var that = this;
        console.log('获取栏内信息' + that.data.sty)
        var data = {
            sty_number: that.data.sty
        };
        // 正常猪
        request.request_get('/pigManagement/getPigLabelBySty.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var label_list = res.msg;
                    for(var a in label_list){
                        if(label_list[a].label_id == that.data.label_id_enter){
                            label_list[a].checked = true;
                            break;
                        }
                    }
                    that.setData({ label_list: label_list})
                } else {
                    box.showToast(res.msg)
                }
            }
        })
        //出栏猪
        request.request_get('/pigManagement/getPigSuchLabelBySty.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var label_such_list = res.msg;
                    that.setData({label_such_list: label_such_list})
                } else {
                    box.showToast(res.msg)
                }
            }
        })
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
        var sty = that.data.sty;
        DialogInput = DialogInput.replace(/\s+/g, '');
        if (DialogInput == '') {
            box.showToast('请填写问题反馈')
        }else{
            console.log(DialogInputTypeLabelInfo)
            var data = {
                sty:sty,
                label_serial:DialogInputTypeLabelInfo[0]['label_serial'],
                label_id:DialogInputTypeLabelInfo[0]['label_id'],
                content:DialogInput,
                user_serial:app.globalData.userInfo.id,
                type:DialogInputType,
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
                    var sty = that.data.sty;
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
                        sty_number: sty,
                        label_ids: label_ids,
                        label_serials: label_serials,
                        operation: such_type,
                        user_serial: app.globalData.userInfo.id,
                        type:"1"
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
                                                that.getStyLabelInfo()
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
                                                that.getStyLabelInfo()
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

    // 转栏操作
    check_jump:function(){
        var that = this;
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
        }else{
            // 选择猪栏
            this.setData({select_piggery_show:true});
        }
    },
    selectPiggeryStyData:function(e){
        var that = this;
        console.log('selectData')
        var piggery_sty = e.detail;
        console.log(piggery_sty)
        that.setData({select_piggery_show:false});
        if(piggery_sty[1].number == that.data.sty){
            box.showToast("已在此栏内无需转栏");
        }else{
            that.startJump(piggery_sty);
        }
    },

    startJump:function(piggery_sty){
        var that = this;
        var sty_number = piggery_sty[1].number;
        var sty_name = piggery_sty[1].name;
        var piggery_number = piggery_sty[0].number;
        var piggery_name = piggery_sty[0].name;
        wx.showModal({
            title: '转栏',
            content: '所选耳环是否转入\n'+piggery_name+'-'+sty_name+'',
            cancelText:'否',
            confirmText:'是',
            success: function (res) {
                if (res.confirm) {
                    that.setData({modalName:null})
                    var label_list = that.data.label_list;
                    var select_label_list = [];
                    for(var i = 0; i < label_list.length; i++){
                        if(label_list[i].checked){
                            var obj = {'label_id': label_list[i].label_id, 'label_serial': label_list[i].serial}
                            select_label_list.push(obj)
                        }
                    }
                    box.showLoading('正在转栏')
                    var label_ids = [];
                    var label_serials = [];
                    for (var index in select_label_list) {
                        var label_id = select_label_list[index].label_id;
                        var label_serial = select_label_list[index].label_serial;
                        label_ids.push(label_id);
                        label_serials.push(label_serial);
                    }
                    label_ids = label_ids.join(",");
                    label_serials = label_serials.join(",");

                    var data = {
                        oldsty: that.data.sty,
                        label_ids: label_ids,
                        label_serials: label_serials,
                        newsty: sty_number,
                        user_serial: app.globalData.userInfo.id,
                        type:"1"
                    };

                    request.request_get('/pigManagement/jump.hn', data, function (res) {
                        console.info('回调', res)
                        if (res) {
                            if (res.success) {
                                var result_arr = res.msg;
                                var fail_text = '';
                                for(var a in result_arr){
                                    if(result_arr[a].success){
        
                                    }else{
                                        var info = result_arr[a].label_id
                                        fail_text += info
                                        fail_text += '\r\n'
                                    }
                                }
                                wx.hideLoading()
                                if(fail_text == ''){
                                    wx.showModal({
                                        title: '成功',
                                        content: '转栏成功',
                                        showCancel: false,
                                        confirmText:'确定',
                                        success: function (res) {
                                            if (res.confirm) {
                                                that.getStyLabelInfo()
                                            }
                                        }
                                    })
                                }else{
                                    wx.showModal({
                                        title: '转栏失败，请重试!',
                                        content: fail_text,
                                        showCancel: false,
                                        confirmText:'确定',
                                        success: function (res) {
                                            if (res.confirm) {
                                                that.getStyLabelInfo()
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

    // 进入猪样请页面************************************
    pigDetail:function(e){
        var that = this;
        var label_id = e.currentTarget.dataset.label_id;
        var label_serial = e.currentTarget.dataset.label_serial;
        var host_serial = e.currentTarget.dataset.host_serial;
        var sty_num_custom = e.currentTarget.dataset.sty_num_custom;
        var source_label = e.currentTarget.dataset.source_label;
        // 时间格式 /// ==》 ---
        var check_in_time = e.currentTarget.dataset.check_in_time;
        console.log(check_in_time)
        var date_arr = check_in_time.split(" ")[0].split("/")
        var lairage_date = date_arr[0] + "-" + date_arr[1] + "-" + date_arr[2];
        console.log(lairage_date)
        var sty = that.data.sty;
        console.log('进入详情页' + label_id)
        var url = '/pages/pigOperation/details';
        wx.navigateTo({
            url: url + "?sty=" + sty + "&label_id=" + label_id + "&label_serial=" + label_serial + "&lairage_date=" + lairage_date + "&host_serial=" + host_serial + "&sty_num_custom=" + sty_num_custom + "&source_label=" + source_label,
        })
    },
    enterMonitor:function(e){
        console.log('进入摄像头页面');
        var that = this;
        console.log('获取栏内信息' + that.data.sty)
        wx.navigateTo({
            url: '/pages/pigOperation/monitor?sty=' + that.data.sty,
        })
    },
})