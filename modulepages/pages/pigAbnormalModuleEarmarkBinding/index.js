const app = getApp()
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')
const time = require('../../../utils/time.js')
const bluetooth = require('../../../utils/bluetooth.js')

Page({
    data: {
        label_id_list: [],
        piggery_sty:[],
        select_piggery_show:false,
        index:0,
        array: ['母猪', '公猪', '仔猪', '肥猪'],

        selectedType: 0,

        yearmouthday: "",
        timestamp: new Date().getTime(),
        birthDate: "",
        isShowbirth: 1,
    },
    onLoad: function (){
        this.currentTime();
    },
    /**
   * 当前日期
   */
   currentTime() {
    let tempTime = new Date(this.data.timestamp);
    let month = tempTime.getMonth() + 1;
    let day = tempTime.getDate();
    if (month < 10) {
      month = "0" + month
    }
    if (day < 10) {
      day = "0" + day
    }
    // let curtime = tempTime.getFullYear() + "年" + (month) + "月" + day + "日";
    let curDate = tempTime.getFullYear() + "-" + (month) + "-" + day;
    this.setData({
      yearmouthday: curDate,
      birthDate: curDate,
    })
  },
  bindDateChange: function (e) {
    let datestring = e.detail.value;
    if (datestring) {
      this.setData({
        birthDate: datestring,
        isShowbirth: 2
      });
    }
  },
    // 类型切换
    selectFunc:function(e){
        var that = this;
        var initType = that.data.selectedType;
        var type = e.currentTarget.dataset.type;
        if(type != initType){
            
            that.setData({selectedType: type})
        }
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

    // 扫码录入
    getQRCode:function(){
        var that = this;
        wx.scanCode({//扫描API
            success: function (res) {
                console.log(res);    //输出回调信息
                var label_id_list = that.data.label_id_list;
                if (res.scanType != 'CODE_128'){
                    console.log('二维码错误' + res.scanType)
                    that.getQRCode();
                }else if (utils.exist_arr(label_id_list, 'id', res.result)){
                    box.showToast('已经扫描过')
                }else{
                    var label_id_info_array = {"id":res.result,"source_id":'','time': time.formatTime(new Date)};
                    label_id_list.push(label_id_info_array)
                    box.showToast('成功', 'success')
                }
                that.setData({
                    label_id_list: label_id_list
                });
            }
        })
    },

    // 手动录入
    inputInfo:function(e){
        var that = this;
        that.setData({
            inputInfo: e.detail.value,
        })
    },
    addList:function(){
        var that = this;
        var label_id_list = that.data.label_id_list;
        var inputInfo = that.data.inputInfo;
        if (inputInfo.length!=8){
            box.showToast('耳环编号位数不对')
        } else if (utils.exist_arr(label_id_list, 'id', inputInfo)){
            box.showToast('请勿重复录入')
        }else{
            var label_id_info_array = {"id":inputInfo,"source_id":'','time': time.formatTime(new Date)};
            label_id_list.push(label_id_info_array)
            that.setData({ label_id_list: label_id_list, inputInfo:'' })
        }
    },

    // 删除耳环id
    del_label_id:function(e){
        var that = this;
        var index = e.currentTarget.dataset.gid;
        console.log("删除的index " + index)
        var label_id_list = that.data.label_id_list;
        label_id_list.splice(index, 1);
        console.log("**********label_id_list*********");
        console.log(label_id_list);
        that.setData({ label_id_list: label_id_list })
    },
    // 提交耳环id
    submit_label_id:function(){
        var that = this;
        var index = that.data.index;
        var label_id_list = that.data.label_id_list;
        var piggery_sty = that.data.piggery_sty;
        if (label_id_list.length == 0){
            box.showToast('暂无任何数据，请扫描条形码或手动输入！')
        }else if(piggery_sty.length == 0){
            box.showToast('请选择猪栏')
        }else{
            box.showLoading('正在入栏');
            // var label_ids = [];
            // for (var index in label_id_list) {
            //     var inputText = label_id_list[index].id;
            //     label_ids.push(inputText);
            // }
            // label_ids = label_ids.join(",");
            var data = {
                sty_number: piggery_sty[1].number,
                label_ids: JSON.stringify(label_id_list),
                user_serial: app.globalData.userInfo.id,
                pig_type: index
            };

            request.request_get('/pigManagement/lairage.hn', data, function (res) {
                console.info('回调', res)
                if (res) {
                    if (res.success) {
                        var result_arr = res.msg;
                        var fail_text = '';
                        for(var a in result_arr){
                            if(result_arr[a].success){

                            }else{
                                var info = result_arr[a].label_id + ' ' + result_arr[a].msg
                                fail_text += info
                                fail_text += '\r\n'
                            }
                        }
                        wx.hideLoading()
                        that.setData({label_id_list:[] })
                        if(fail_text == ''){
                            wx.showModal({
                                title: '成功',
                                content: '耳环入栏成功',
                                confirmText: '继续录入',
                                cancelText: '返回主页',
                                success: function (res) {
                                    if (res.confirm) {
                                        console.log('用户点击了继续录入')
                                    } else if (res.cancel) {
                                        wx.switchTab({
                                            url: '/pages/operation/index',
                                        })
                                    }
                                }
                            })
                        }else{
                            wx.showModal({
                                title: '失败',
                                content: fail_text,
                                confirmText: '继续录入',
                                cancelText: '返回主页',
                                success: function (res) {
                                    if (res.confirm) {
                                        console.log('用户点击了继续录入')
                                    } else if (res.cancel) {
                                        wx.switchTab({
                                        url: '/pages/operation/index',
                                        })
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
            that.setData({piggery_sty:piggery_sty})
        }else{
            console.log('参数传递异常')
        }
    },

    inputFocus:function() {
        // 输入框聚焦，判断是否开启蓝牙输入功能
        console.log("输入框聚焦");
        var bluetoothStatus = app.globalData.bluetoothStatus;
        var bluetoothInfo = app.globalData.bluetoothInfo;
        if(bluetoothStatus){
            bluetooth.get_device_value(bluetoothInfo,this.bluetoothRollback)
        } 
    },

    bluetoothRollback:function (text) {
        console.log("蓝牙设备的返回值" + text);
        this.setData({inputInfo:text});
    },
    bindPickerChange: function(e) {
        this.setData({
          index: e.detail.value
        })
      },
      change_source_id: function(e) {
        console.log('修改猪小智id');
        var that = this;
        var id = e.currentTarget.dataset.gid;
        var label_id_list = that.data.label_id_list;
        label_id_list[id].source_id = e.detail.value;
        this.setData({
            label_id_list: label_id_list
        })
      },
})