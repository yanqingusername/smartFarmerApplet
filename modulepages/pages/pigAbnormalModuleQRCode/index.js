const app = getApp()
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')
const time = require('../../../utils/time.js')
const bluetooth = require('../../../utils/bluetooth.js')

Page({
    data: {
        inputInfo: '',
        source_label: "",
        objData: []
    },
    onLoad: function () {
    },
    getSourceLabelByLabelId(label_id) {
        var that = this;
        var data = {
            pig_farm_id: app.globalData.userInfo.pig_farm_id,
            label_id: label_id
        }
        request.request_get('/pigManagement/getSourceLabelByLabelId.hn', data, function (res) {
          if (res) {
            if (res.success) {
                let dataList = res.data;
                let source_label;
                if(dataList && dataList.length > 0){
                    source_label = dataList[0].source_label;
                }else{
                    source_label= '';
                }
                that.setData({
                    source_label: source_label,
                    objData: res.info
                });
            } else {
              box.showToast(res.msg);
            }
          }
        });
    },
    // 扫码录入
    getQRCode: function () {
        var that = this;
        wx.scanCode({ //扫描API
            success: function (res) {
                console.log(res); //输出回调信息
                if (res.scanType != 'CODE_128') {
                    console.log('二维码错误' + res.scanType)
                    that.getQRCode();
                } else {
                    // that.setData({
                    //     inputInfo: res.result,
                    // })
                    that.bluetoothRollback(res.result);
                    box.showToast('成功', 'success')
                }
            }
        })
    },
    // 手动录入
    inputInfo: function (e) {
        var that = this;
        // that.setData({
        //     inputInfo: e.detail.value,
        // });
        that.bluetoothRollback(e.detail.value);
    },
    inputFocus: function () {
        // 输入框聚焦，判断是否开启蓝牙输入功能
        console.log("输入框聚焦");
        var bluetoothStatus = app.globalData.bluetoothStatus;
        var bluetoothInfo = app.globalData.bluetoothInfo;
        if (bluetoothStatus) {
            bluetooth.get_device_value(bluetoothInfo, this.bluetoothRollback)
        }
    },
    bluetoothRollback: function (text) {
        console.log("蓝牙设备的返回值" + text);
        this.setData({
            inputInfo: text
        });

        if(this.data.inputInfo){
            this.getSourceLabelByLabelId(this.data.inputInfo);
        }
    },
    submitClick: function () {
        var that = this;
        var inputInfo = that.data.inputInfo;

        if (inputInfo == '') {
            box.showToast('电子耳标ID不能为空')
        } else {
            if(this.data.objData && this.data.objData.length > 0){
                let item = this.data.objData[0];
                if(item){
                    // this.setData({
                    //     inputInfo: '',
                    //     source_label: "",
                    //     objData: []
                    // });
                    let jsonItem = JSON.stringify(item);
                    wx.redirectTo({
                        url: `/modulepages/pages/pigAbnormalModuleInfo/index?jsonItem=${jsonItem}`,
                    })
                }
            }else{
                box.showToast('未查询到猪只信息')
            }
        }
    },
})