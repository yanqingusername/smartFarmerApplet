const app = getApp()
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')
const time = require('../../../utils/time.js')
const bluetooth = require('../../../utils/bluetooth.js')

Page({
    data: {
        homePersonal: [],
        select_bindid: '',
        select_bindname: '',
        inputInfo: '',
        searchname: ''

    },
    onLoad: function () {
        this.getNotbindinglabel();
    },
    /**
     * 获取未绑定的耳号
     */
    getNotbindinglabel: function () {
        var that = this;
        var data = {
            pig_farm_id: app.globalData.userInfo.pig_farm_id,
            source_label: this.data.searchname
        }
        request.request_get('/pigManagement/getNotbindinglabel.hn', data, function (res) {
            if (res) {
                if (res.success) {
                    that.setData({
                        homePersonal: res.data,
                    });
                } else {
                // box.showToast(res.msg);
                }
            }
        })
    },
    checkboxChange(e) {
        let bindid = e.currentTarget.dataset.id;
        let bindname = e.currentTarget.dataset.name;

        if (bindid == this.data.select_bindid) {
            this.setData({
                select_bindid: '',
                select_bindname: '',
            });
        } else {
            this.setData({
                select_bindid: bindid,
                select_bindname: bindname,
            });
        }
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
                    that.setData({
                        inputInfo: res.result,
                    })
                    box.showToast('成功', 'success')
                }
            }
        })
    },
    // 手动录入
    inputInfo: function (e) {
        var that = this;
        that.setData({
            inputInfo: e.detail.value,
        });
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
    },
    inputSearchName: function (e) {
        var that = this;
        that.setData({
            searchname: e.detail.value,
        });
        this.getNotbindinglabel();
    },
    inputSearchNameFocus: function () {
        console.log("输入框聚焦");
        // this.getNotbindinglabel();
    },
    submitClick: function () {
        var that = this;
        var select_bindid = that.data.select_bindid;
        var select_bindname = that.data.select_bindname;
        var inputInfo = that.data.inputInfo;

        if (inputInfo == '') {
            box.showToast('耳环ID不能为空')
        } else if (select_bindid == '' || select_bindname == ''){
            box.showToast('请选择猪只耳号')
        } else {
            
            var data = {
                pig_farm_id: app.globalData.userInfo.pig_farm_id,
                label_id: inputInfo,
                source_label: select_bindname,
            };

            request.request_get('/pigManagement/bindinglabel.hn', data, function (res) {
                console.info('回调', res)
                if (res) {
                    if (res.success) {
                        wx.showModal({
                            title: '成功',
                            content: res.msg,
                            confirmText: '继续录入',
                            cancelText: '返回主页',
                            success: function (res) {
                                if (res.confirm) {
                                    that.setData({
                                        homePersonal: [],
                                        select_bindid: '',
                                        select_bindname: '',
                                        inputInfo: '',
                                        searchname: ''
                                    });

                                    that.getNotbindinglabel();
                                } else if (res.cancel) {
                                    wx.switchTab({
                                        url: '/pages/operation/index',
                                    });
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
})