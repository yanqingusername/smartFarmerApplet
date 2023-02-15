const app = getApp()
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')
const time = require('../../../utils/time.js')
const bluetooth = require('../../../utils/bluetooth.js')

Page({
    data: {
        homePersonal: [{
                'id': '1',
                'name': 'LL0001',
                'selected': false
            },
            {
                'id': '2',
                'name': 'LL0002',
                'selected': false
            },
            {
                'id': '3',
                'name': 'LL0003',
                'selected': false
            },
            {
                'id': '4',
                'name': 'LL0004',
                'selected': false
            }
        ],
        select_bindid: '',
        select_bindname: '',
        inputInfo: '',
        searchname: ''

    },
    onLoad: function () {

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
        // var bluetoothStatus = app.globalData.bluetoothStatus;
        // var bluetoothInfo = app.globalData.bluetoothInfo;
        // if (bluetoothStatus) {
        //     bluetooth.get_device_value(bluetoothInfo, this.bluetoothRollback)
        // }
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
    },
    inputSearchNameFocus: function () {
        console.log("输入框聚焦");
        
    },
    submit_label_id: function () {
        var that = this;
        var index = that.data.index;
        var label_id_list = that.data.label_id_list;
        var piggery_sty = that.data.piggery_sty;
        if (label_id_list.length == 0) {
            box.showToast('暂无任何数据，请扫描条形码或手动输入！')
        } else if (piggery_sty.length == 0) {
            box.showToast('请选择猪栏')
        } else {
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
                        for (var a in result_arr) {
                            if (result_arr[a].success) {

                            } else {
                                var info = result_arr[a].label_id + ' ' + result_arr[a].msg
                                fail_text += info
                                fail_text += '\r\n'
                            }
                        }
                        wx.hideLoading()
                        that.setData({
                            label_id_list: []
                        })
                        if (fail_text == '') {
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
                        } else {
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
})