const app = getApp()
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')

Page({
    data: {
        such_piggery_sty:[], // 转出猪栏
        enter_piggery_sty:[], //转入猪栏
        label_list:[],
        select_type: '', // 0转出 1转入
        select_piggery_show:false
    },
    onLoad: function (){
        console.log("进入转栏页面");
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
    select_piggery:function(e){
        var type = e.currentTarget.dataset.type;
        this.setData({select_piggery_show:true,select_type:type})
    },
    selectPiggeryStyData:function(e){
        var that = this;
        console.log('selectData')
        var piggery_sty = e.detail;
        console.log(piggery_sty)
        that.setData({select_piggery_show:false})
        if (piggery_sty.length == 2){
            var select_type = that.data.select_type;
            // 0转出 1转入
            if(select_type == '0'){
                // 获取耳环
                that.getStyLabelInfo(piggery_sty[1].number)
                that.setData({such_piggery_sty:piggery_sty})
            }else{
                that.setData({enter_piggery_sty:piggery_sty})
            }
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
    submit_jump:function(){
        var that = this;
        var such_piggery_sty = that.data.such_piggery_sty;
        var enter_piggery_sty = that.data.enter_piggery_sty;
        console.log(such_piggery_sty)
        console.log(enter_piggery_sty)
        if(such_piggery_sty.length == 0){
            box.showToast('请选择转出猪栏!');
            return;
        }else if(enter_piggery_sty.length == 0){
            box.showToast('请选择转入猪栏!');
            return;
        }else if(such_piggery_sty[1].number == enter_piggery_sty[1].number){
            // 同栏禁止转栏
            box.showToast('请选择不同的猪栏!');
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
        }else{
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
                oldsty: such_piggery_sty[1].number,
                label_ids: label_ids,
                label_serials: label_serials,
                newsty: enter_piggery_sty[1].number,
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
                                var info = result_arr[a].label_id;
                                if(info == ""){ // 耳环不存在此栏的中
                                    var label_serial = result_arr[a].label_serial;
                                    var msg = result_arr[a].msg;
                                    info = label_info[label_serial] + msg
                                }
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
                                        that.getStyLabelInfo(such_piggery_sty[1].number)
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
                                        that.getStyLabelInfo(such_piggery_sty[1].number)
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
    },
})