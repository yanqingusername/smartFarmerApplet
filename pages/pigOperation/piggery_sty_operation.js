const app = getApp()
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')

Page({
    data: {
        piggery_index:0,
        sty_index:0,
        DialogInput: '',
    },
    onLoad: function (){
        console.log("进入猪舍猪栏管理页面");
        this.get_piggery();
    },
    onShow:function(){
        
    },
    // 弹框********************
    showModal(e) {
        this.setData({
            modalName: e.currentTarget.dataset.target,
        })
    },
    hideModal() {
        this.setData({
            modalName: null
        })
    },
    // 弹框中的输入框
    DialogInput:function(e){
        var value = e.detail.value
        // console.log(value);
        this.setData({ DialogInput: value})
    },
    // 获取猪舍****************
    get_piggery:function(piggery_number){
        var piggery_number = arguments[0] ? arguments[0] : '';
        var that = this;
        var piggery_index = 0;
        var data = {
            pig_farm:app.globalData.userInfo.pig_farm_id
        }
        request.request_get('/pigManagement/getPiggery.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var list = res.msg;
                    var piggery_list = [{'piggery_name':'--选择猪舍--', 'piggery_number': ''}];
                    for(var a in list){
                        piggery_list.push(list[a]);
                    }
                    for(var a in piggery_list){
                        if(piggery_number == piggery_list[a].piggery_number){
                            piggery_index = a;
                            break;
                        }
                    }
                    that.get_sty(piggery_number);
                    that.setData({piggery_list:piggery_list,piggery_index:piggery_index});
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    piggeryChange(e) {
        console.log(e);
        var that = this;
        var piggery_index = e.detail.value;
        var piggery_list = that.data.piggery_list;
        var piggery_number = piggery_list[piggery_index].piggery_number;
        that.get_sty(piggery_number);
        that.setData({
            piggery_index: piggery_index
        })
    },
    
    
    //获取猪栏**************************
    get_sty:function(piggery_number, sty_number){
        var that = this;
        var sty_number = arguments[1] ? arguments[1] : '';
        var sty_index = 0;
        var sty_list = [{'sty_name':'--选择猪栏--', 'sty_number': ''}];
        if(piggery_number!=''){
            var data = {
                piggery_number: piggery_number
            }
            request.request_get('/pigManagement/getStyByPiggery.hn', data, function (res) {
                console.info('回调', res)
                if (res) {
                    if (res.success) {
                        var list = res.msg;
                        for(var a in list){
                            sty_list.push(list[a]);
                        }
                        for(var a in sty_list){
                            if(sty_number == sty_list[a].sty_number){
                                sty_index = a;
                                break;
                            }
                        }
                        that.setData({sty_list:sty_list,sty_index:sty_index});
                    } else {
                        box.showToast(res.msg)
                    }
                }
            })
        }else{
            that.setData({sty_list:sty_list,sty_index:sty_index});
        }
    },
    styChange:function(e){
        console.log(e);
        this.setData({
            sty_index: e.detail.value
        })
    },
    // 猪栏重命名**************************
    rename_sty:function(){
        var that = this;
        var sty_index = that.data.sty_index;
        if(sty_index=='0'){
            box.showToast("请选择猪栏")
        }else{
            that.setData({modalName:'DialogRenameSty'})
        }
    },
    submit_rename_sty:function(){
        var that = this;
        var DialogInput = that.data.DialogInput;

        var sty_list = that.data.sty_list;
        var sty_index = that.data.sty_index;
        var sty_number = sty_list[sty_index].sty_number;
        console.log(DialogInput)
        DialogInput = DialogInput.replace(/\s+/g, '');
        if (DialogInput == '') {
            box.showToast('请填写猪栏名称')
        }else{
            var data = {
                new_name: DialogInput,
                sty_number:sty_number
            }
            request.request_get('/pigManagement/styRename.hn', data, function (res) {
                console.info('回调', res)
                if (res) {
                    if (res.success) {
                        box.showToast('成功', 'success')
                        // 直接更改猪舍名称*********加载用户体验不好
                        for(var a in sty_list){
                            if(sty_list[a].sty_number == sty_number){
                                sty_list[a].sty_name = DialogInput;
                                break;
                            }
                        }
                        that.setData({sty_list:sty_list,modalName:null,DialogInput:''})
                    } else {
                        box.showToast(res.msg)
                    }
                }
            })
        }
    },
    // 删除猪栏**************
    del_sty:function(){
        var that = this;
        var sty_index = that.data.sty_index;
        if(sty_index=='0'){
            box.showToast("请选择猪栏")
        }else{
            var piggery_list = that.data.piggery_list;
            var piggery_index = that.data.piggery_index;
            var piggery_number = piggery_list[piggery_index].piggery_number;
            var sty_list = that.data.sty_list;
            var sty_number = sty_list[sty_index].sty_number;
            wx.showModal({
                title: '',
                content: '是否删除猪栏',
                confirmText:'删除',
                success: function (res) {
                    if (res.confirm) {
                        var data = {
                            sty_number: sty_number,
                        }
                        request.request_get('/pigManagement/deleteSty.hn', data, function (res) {
                            console.info('回调', res)
                            if (res) {
                                if (res.success) {
                                    box.showToast('删除成功', 'success')
                                    // 重新获取猪栏列表
                                    that.get_sty(piggery_number);
                                } else {
                                    box.showToast(res.msg)
                                }
                            }
                        })
                    }
                }
            })
        }
    },
    // 添加猪栏****************************
    add_sty:function(){
        var that = this;
        var piggery_index = that.data.piggery_index;
        if(piggery_index=='0'){
            box.showToast("请选择猪舍")
        }else{
            that.setData({modalName:'DialogAddSty'})
        }
    },
    submit_add_sty:function(){
        var that = this;
        var DialogInput = that.data.DialogInput;
        console.log(DialogInput)
        var piggery_list = that.data.piggery_list;
        var piggery_index = that.data.piggery_index;
        var piggery_number = piggery_list[piggery_index].piggery_number;
        DialogInput = DialogInput.replace(/\s+/g, '');
        if (DialogInput == '') {
            box.showToast('请填写猪栏名称')
        } else{
            var data = {
                sty_name: DialogInput,
                piggery_number: piggery_number,
            }
            request.request_get('/pigManagement/addSty.hn', data, function (res) {
                console.info('回调', res)
                if (res) {
                    if (res.success) {
                        box.showToast('成功', 'success')
                        that.get_sty(piggery_number,res.sty_number)
                        that.setData({modalName:null,DialogInput:''})
                    } else {
                        box.showToast(res.msg)
                    }
                }
            })
        }
    }
})