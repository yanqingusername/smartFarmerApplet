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

        birthDate1: "",
        isShowbirth1: 1,

        birthDate2: "",
        isShowbirth2: 1,

        approvalList: ["出栏","死亡"],
        approvalIndex: 0,
        isShowApproval: 1,
        approvalText: '',

        farmList:[],
        farmIndex: 0,
        farm_name: "",
        farm_id: "",
        isShowFarm: 1,

        piggeryList:[],
        piggeryIndex: 0,
        piggery_name: "",
        piggery_id: "",
        isShowPiggery: 1,

        styList:[],
        styIndex: 0,
        sty_name: "",
        sty_id: "",
        isShowSty: 1,

        snname: "", //耳号
        sourcelable: "", //耳标
        source_label_list: [],

        //转栏 栏位选择
        farmList2:[],
        farmIndex2: 0,
        farm_name2: "",
        farm_id2: "",
        isShowFarm2: 1,

        piggeryList2:[],
        piggeryIndex2: 0,
        piggery_name2: "",
        piggery_id2: "",
        isShowPiggery2: 1,

        styList2:[],
        styIndex2: 0,
        sty_name2: "",
        sty_id2: "",
        isShowSty2: 1,

    },
    onLoad: function (){

        this.setData({
            farm_name: wx.getStorageSync('storage_farm_name') || '',
            farm_id: wx.getStorageSync('storage_farm_id') || '',
            piggery_name: wx.getStorageSync('storage_piggery_name') || '',
            piggery_id: wx.getStorageSync('storage_piggery_id') || '',
            sty_name: wx.getStorageSync('storage_sty_name') || '',
            sty_id: wx.getStorageSync('storage_sty_id') || '',

            farm_name2: wx.getStorageSync('storage_farm_name2') || '',
            farm_id2: wx.getStorageSync('storage_farm_id2') || '',
            piggery_name2: wx.getStorageSync('storage_piggery_name2') || '',
            piggery_id2: wx.getStorageSync('storage_piggery_id2') || '',
            sty_name2: wx.getStorageSync('storage_sty_name2') || '',
            sty_id2: wx.getStorageSync('storage_sty_id2') || '',
        });
        this.currentTime();

        this.getPigSitearea();

        /**
         * 转入
         */
        if(this.data.farm_name && this.data.farm_id){
            this.setData({
                isShowFarm: 2
            });
            this.selectfarm(2);
        }
        if(this.data.piggery_name && this.data.piggery_id){
            this.setData({
                isShowPiggery: 2
            });
            this.selectSty(2)
        }
        if(this.data.sty_name && this.data.sty_id){
            this.setData({
                isShowSty: 2
            });
        }

        /**
         * 转栏
         */
         if(this.data.farm_name2 && this.data.farm_id2){
            this.setData({
                isShowFarm2: 2
            });
            this.selectfarm2(2);
        }
        if(this.data.piggery_name2 && this.data.piggery_id2){
            this.setData({
                isShowPiggery2: 2
            });
            this.selectSty2(2)
        }
        if(this.data.sty_name2 && this.data.sty_id2){
            this.setData({
                isShowSty2: 2
            });
        }

        
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
      birthDate1: curDate,
      birthDate2: curDate,
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
  bindDateChange1: function (e) {
    let datestring1 = e.detail.value;
    if (datestring1) {
      this.setData({
        birthDate1: datestring,
        isShowbirth1: 2
      });
    }
  },
  bindDateChange2: function (e) {
    let datestring2 = e.detail.value;
    if (datestring2) {
      this.setData({
        birthDate2: datestring,
        isShowbirth2: 2
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
    getSourceLabelByLabelId(label_id, typestring) {
        var that = this;
        var data = {
            pig_farm_id: app.globalData.userInfo.pig_farm_id,
            label_id: label_id
        }
        request.request_get('/pigManagement/getSourceLabelByLabelId.hn', data, function (res) {
          if (res) {
            if (res.success) {
                var label_id_list = that.data.label_id_list;
                let dataList = res.data;
                let source_label;
                if(dataList && dataList.length > 0){
                    source_label = dataList[0].source_label;
                }else{
                    source_label= '';
                }
                var label_id_info_array = {"id":label_id,"source_id":source_label,'time': time.formatTime(new Date)};
                label_id_list.push(label_id_info_array)

                that.setData({
                    label_id_list: label_id_list
                });

                if(typestring == 2){
                    that.setData({
                        inputInfo:''
                    });
                }
            } else {
              box.showToast(res.msg);
            }
          }
        });
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
                    that.getSourceLabelByLabelId(res.result, 1);

                    // var label_id_info_array = {"id":res.result,"source_id":'','time': time.formatTime(new Date)};
                    // label_id_list.push(label_id_info_array)
                    // box.showToast('成功', 'success')
                }
                // that.setData({
                //    label_id_list: label_id_list
                // });
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
        if(!inputInfo) {
            box.showToast('请输入耳环编号')
        } else if (inputInfo.length!=8){
            box.showToast('耳环编号位数不对')
        } else if (utils.exist_arr(label_id_list, 'id', inputInfo)){
            box.showToast('请勿重复录入')
        }else{
            this.getSourceLabelByLabelId(inputInfo, 2);

            // var label_id_info_array = {"id":inputInfo,"source_id":'','time': time.formatTime(new Date)};
            // label_id_list.push(label_id_info_array)
            // that.setData({ label_id_list: label_id_list, inputInfo:'' })
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
        // var piggery_sty = that.data.piggery_sty;

        if (label_id_list.length == 0){
            box.showToast('暂无任何数据，请扫描条形码或手动输入！')
        }else if(this.data.farm_name == '' && this.data.farm_id == ''){
            // else if(piggery_sty.length == 0){
            box.showToast('请选择场区')
        }else if(this.data.piggery_name == '' && this.data.piggery_id == ''){
            box.showToast('请选择栋舍')
        }else if(this.data.sty_name == '' && this.data.sty_id == ''){
            box.showToast('请选择栏号')
        }else{
            box.showLoading('正在入栏');
            // var label_ids = [];
            // for (var index in label_id_list) {
            //     var inputText = label_id_list[index].id;
            //     label_ids.push(inputText);
            // }
            // label_ids = label_ids.join(",");

            let date3 = new Date().getTime();
            let tempTime3 = new Date(date3);
            let formatTime3 =  time.formatTime3(tempTime3);

            var data = {
                // sty_number: piggery_sty[2].number,
                sty_number: this.data.sty_id,
                label_ids: JSON.stringify(label_id_list),
                user_serial: app.globalData.userInfo.id,
                pig_type: index,
                checkinTime: that.data.birthDate + " " + formatTime3 //入栏
            };

            console.log(label_id_list)
            console.log(JSON.stringify(data))

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
                        that.setData({label_id_list:[],piggery_sty:[] })

                        // 存储到storage
                        wx.setStorageSync('storage_farm_name', that.data.farm_name);
                        wx.setStorageSync('storage_farm_id', that.data.farm_id);
                        wx.setStorageSync('storage_piggery_name', that.data.piggery_name);
                        wx.setStorageSync('storage_piggery_id', that.data.piggery_id);
                        wx.setStorageSync('storage_sty_name', that.data.sty_name);
                        wx.setStorageSync('storage_sty_id', that.data.sty_id);


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
        if (piggery_sty.length == 3){
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
      // 确认离场 (出栏/死亡)
      submit_livestock:function(){
        var that = this;
        var index = that.data.index;
        var label_id_list = that.data.label_id_list;
        if (label_id_list.length == 0){
            box.showToast('暂无任何数据，请扫描条形码或手动输入！')
        }else{

            if(this.data.approvalText == ''){
                box.showToast('请选择离场选项！')
                return
            }

            box.showLoading('加载中...');
            var label_ids = [];
            for (var index in label_id_list) {
                var inputText = label_id_list[index].id;
                label_ids.push(inputText);
            }
            let labelidsstring = label_ids.join(",");

            let date3 = new Date().getTime();
            let tempTime3 = new Date(date3);
            let formatTime3 =  time.formatTime3(tempTime3);

            var data = {
                label_ids: labelidsstring,
                user_serial: app.globalData.userInfo.id,
                checkoutTime: that.data.birthDate1 + " " + formatTime3,
                operation: that.data.approvalText == '出栏' ? '2' : '3', //2是健康出栏 //3是死亡
                // approvalText: that.data.approvalText //离场原因
            };

            console.log(data)

            request.request_get('/pigManagement/Livestock.hn', data, function (res) {
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
                        that.setData({label_id_list:[],piggery_sty:[] })
                        if(fail_text == ''){
                            wx.showModal({
                                title: '成功',
                                content: '出栏成功',
                                confirmText: '继续出栏',
                                cancelText: '返回主页',
                                success: function (res) {
                                    if (res.confirm) {
                                        console.log('用户点击了继续出栏')
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
                                confirmText: '继续出栏',
                                cancelText: '返回主页',
                                success: function (res) {
                                    if (res.confirm) {
                                        console.log('用户点击了继续出栏')
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
    // 确认死亡
    submit_click:function(){
        var that = this;
        var index = that.data.index;
        var label_id_list = that.data.label_id_list;
        if (label_id_list.length == 0){
            box.showToast('暂无任何数据，请扫描条形码或手动输入！')
        }else{
            box.showLoading('加载中...');
            var label_ids = [];
            for (var index in label_id_list) {
                var inputText = label_id_list[index].id;
                label_ids.push(inputText);
            }
            let labelidsstring = label_ids.join(",");

            let date3 = new Date().getTime();
            let tempTime3 = new Date(date3);
            let formatTime3 =  time.formatTime3(tempTime3);

            var data = {
                label_ids: labelidsstring,
                user_serial: app.globalData.userInfo.id,
                checkoutTime: that.data.birthDate + " " + formatTime3,
                operation: '3' //3是死亡
            };

            console.log(data)

            request.request_get('/pigManagement/Livestock.hn', data, function (res) {
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
                        that.setData({label_id_list:[],piggery_sty:[] })
                        if(fail_text == ''){
                            wx.showModal({
                                title: '成功',
                                content: '',
                                confirmText: '继续',
                                cancelText: '返回主页',
                                success: function (res) {
                                    if (res.confirm) {
                                        console.log('用户点击了确认死亡')
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
                                confirmText: '继续',
                                cancelText: '返回主页',
                                success: function (res) {
                                    if (res.confirm) {
                                        console.log('用户点击了确认死亡')
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
    // 获取 离场选项
    bindApprovalChange: function (e) {
        var approvalIndex = e.detail.value;
        this.setData({
          approvalIndex: approvalIndex,
          approvalText: this.data.approvalList[approvalIndex],
          isShowApproval: 2
        });
    },
    // 选择场区***************
    clickPigSiteareaData(){
        this.getPigSitearea();
    },
    getPigSitearea() {
        var that = this;

        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id
        }
        // 获取场区*********
        request.request_get('/pigManagement/getPigSitearea.hn', data, function (res) {
            if (res) {
                if (res.success) {
                    that.setData({
                        farmList: res.msg,
                        farmList2: res.msg,
                    });
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    // 选择场区
    bindPickerPigSitearea: function (e) {
        if(this.data.farmList.length > 0){
            var farmIndex = e.detail.value;
            this.setData({
                farmIndex: farmIndex,
                farm_name: this.data.farmList[farmIndex].location_descr,
                farm_id: this.data.farmList[farmIndex].id,
                isShowFarm: 2
            });

            this.selectfarm(1)
        }
    },
    selectfarm(typenumber) {
        var that = this;

        if(typenumber == 1){
            this.setData({
                piggeryIndex: 0,
                piggery_name: "",
                piggery_id: "",
                isShowPiggery: 1,
                styIndex: 0,
                sty_name: "",
                sty_id: "",
                isShowSty: 1
            });
        }
        var data = {
            SiteAreaid: this.data.farm_id
        }
        request.request_get('/pigManagement/getPiggerybyid.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    console.log("传入sty_number" + that.data.sty)
                    var piggeryList = res.msg;
                    that.setData({
                        piggeryList: piggeryList
                    });
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    bindPickerPiggery: function (e) {

        // if(!this.data.farm_name && !this.data.farm_id){
        //     box.showToast('请选择场区')
        //     return 
        // }
        if(this.data.piggeryList.length > 0){
            var piggeryIndex = e.detail.value;
            this.setData({
                piggeryIndex: piggeryIndex,
                piggery_name: this.data.piggeryList[piggeryIndex].location_descr,
                piggery_id: this.data.piggeryList[piggeryIndex].id,
                isShowPiggery: 2
            });
    
            this.selectSty(1)
        }else{
            box.showToast('请选择栋舍')
        }

        
    },
    selectSty(typenumber) {
        var that = this;
        if(typenumber == 1){
            this.setData({
                styIndex: 0,
                sty_name: "",
                sty_id: "",
                isShowSty: 1
            });
        }
        

        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id,
            piggery_number: this.data.piggery_id
        }
        request.request_get('/pigManagement/getStyByPiggery.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var styList = res.msg;
                    that.setData({
                        styList: styList
                    });
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    bindPickerSty: function (e) {
        if(this.data.styList.length > 0){
            var styIndex = e.detail.value;
            this.setData({
                styIndex: styIndex,
                sty_name: this.data.styList[styIndex].sty_name,
                sty_id: this.data.styList[styIndex].sty_number,
                isShowSty: 2
            });
        }
    },

    /**
     * 转栏
     */
     inputTap(e){
        var that = this
        wx.hideKeyboard()
        setTimeout(function(){
          that.setData({
            focusId: e.currentTarget.id
          })
        },200)
      },
     inputSnNameInfo:function(e){
        let that = this;
        that.setData({
            snname: e.detail.value,
        })
    },
    inputSnNameFocus:function() {
        // 输入框聚焦，判断是否开启蓝牙输入功能
        let bluetoothStatus = app.globalData.bluetoothStatus;
        let bluetoothInfo = app.globalData.bluetoothInfo;
        if(bluetoothStatus){
            bluetooth.get_device_value(bluetoothInfo,this.bluetoothRollback)
        } 
    },

    bluetoothRollback:function (text) {
        console.log("蓝牙设备的返回值" + text);
        this.setData({snname:text});
    },
    inputSourceInfo:function(e){
        let that = this;
        that.setData({
            sourcelable: e.detail.value,
        })
    },
    inputSourceFocus:function() {
        // 输入框聚焦，判断是否开启蓝牙输入功能
        let bluetoothStatus = app.globalData.bluetoothStatus;
        let bluetoothInfo = app.globalData.bluetoothInfo;
        if(bluetoothStatus){
            bluetooth.get_device_value(bluetoothInfo,this.bluetoothRollback1)
        } 
    },

    bluetoothRollback1:function (text) {
        console.log("蓝牙设备的返回值" + text);
        this.setData({sourcelable:text});
    },
    addSourceList:function(){
        let that = this;
        let source_label_list = that.data.source_label_list;
        let snname = that.data.snname;
        let sourcelable = that.data.sourcelable;
        if (!snname && !sourcelable){
            box.showToast('请输入耳号或电子耳标')
        } else if (sourcelable && sourcelable.length!=8){
            box.showToast('电子耳标编号位数不对')
        } else if (utils.exist_arr(source_label_list, 'source_label', snname)){
            box.showToast('请勿重复录入')
        }else if (utils.exist_arr(source_label_list, 'label_id', sourcelable)){
            box.showToast('请勿重复录入')
        }else{
            this.getPigInfoBylable(snname, sourcelable);
        }
    },
    getPigInfoBylable(sourcelable, label_id) {
        let that = this;
        let data = {
            pig_farm_id: app.globalData.userInfo.pig_farm_id,
            label_id: label_id,
            source_label: sourcelable
        }
        request.request_get('/pigManagement/getPigInfoBylable.hn', data, function (res) {
          if (res) {
            if (res.success) {
                let source_label_list = that.data.source_label_list;
                let dataList = res.data;
                if(dataList && dataList.length > 0){
                    let label_id_info_array = dataList[0];
                    source_label_list.push(label_id_info_array)
                    that.setData({
                        source_label_list: source_label_list,
                        snname:'',
                        sourcelable: ''
                    });
                }
            } else {
              box.showToast(res.msg);
            }
          }
        });
    },
    // 删除耳环id
    del_source_id:function(e){
        let that = this;
        let index = e.currentTarget.dataset.gid;
        console.log("删除的index " + index)
        let source_label_list = that.data.source_label_list;
        source_label_list.splice(index, 1);
        console.log("**********source_label_list*********");
        console.log(source_label_list);
        that.setData({ source_label_list: source_label_list })
    },
    // 选择场区
    bindPickerPigSitearea2: function (e) {
        if(this.data.farmList2.length > 0){
            var farmIndex2 = e.detail.value;
            this.setData({
                farmIndex2: farmIndex2,
                farm_name2: this.data.farmList2[farmIndex2].location_descr,
                farm_id2: this.data.farmList2[farmIndex2].id,
                isShowFarm2: 2
            });

            this.selectfarm2(1)
        }
    },
    selectfarm2(typenumber) {
        var that = this;

        if(typenumber == 1){
            this.setData({
                piggeryIndex2: 0,
                piggery_name2: "",
                piggery_id2: "",
                isShowPiggery2: 1,
                styIndex2: 0,
                sty_name2: "",
                sty_id2: "",
                isShowSty2: 1
            });
        }
        var data = {
            SiteAreaid: this.data.farm_id2
        }
        request.request_get('/pigManagement/getPiggerybyid.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var piggeryList2 = res.msg;
                    that.setData({
                        piggeryList2: piggeryList2
                    });
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    bindPickerPiggery2: function (e) {
        if(this.data.piggeryList2.length > 0){
            var piggeryIndex2 = e.detail.value;
            this.setData({
                piggeryIndex2: piggeryIndex2,
                piggery_name2: this.data.piggeryList2[piggeryIndex2].location_descr,
                piggery_id2: this.data.piggeryList2[piggeryIndex2].id,
                isShowPiggery2: 2
            });
    
            this.selectSty2(1)
        }else{
            box.showToast('请选择栋舍')
        }

        
    },
    selectSty2(typenumber) {
        var that = this;
        if(typenumber == 1){
            this.setData({
                styIndex2: 0,
                sty_name2: "",
                sty_id2: "",
                isShowSty2: 1
            });
        }
        

        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id,
            piggery_number: this.data.piggery_id2
        }
        request.request_get('/pigManagement/getStyByPiggery.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var styList2 = res.msg;
                    that.setData({
                        styList2: styList2
                    });
                } else {
                    box.showToast(res.msg)
                }
            }
        })
    },
    bindPickerSty2: function (e) {
        if(this.data.styList2.length > 0){
            var styIndex2 = e.detail.value;
            this.setData({
                styIndex2: styIndex2,
                sty_name2: this.data.styList2[styIndex2].sty_name,
                sty_id2: this.data.styList2[styIndex2].sty_number,
                isShowSty2: 2
            });
        }
    },
    //确认转栏
    submit_jump:function(){
        let that = this;
        let index = that.data.index;
        let source_label_list = that.data.source_label_list;

        if (source_label_list.length == 0){
            box.showToast('暂无任何数据，请扫描条形码或手动输入！')
        }else if(this.data.farm_name2 == '' && this.data.farm_id2 == ''){
            box.showToast('请选择场区')
        }else if(this.data.piggery_name2 == '' && this.data.piggery_id2 == ''){
            box.showToast('请选择栋舍')
        }else if(this.data.sty_name2 == '' && this.data.sty_id2 == ''){
            box.showToast('请选择栏号')
        }else{
            box.showLoading('正在转栏');

            let date3 = new Date().getTime();
            let tempTime3 = new Date(date3);
            let formatTime3 =  time.formatTime3(tempTime3);

            let data = {
                sty_number: this.data.sty_id2,
                label_ids: JSON.stringify(source_label_list),
                user_serial: app.globalData.userInfo.id,
                pig_type: index,
                checkinTime: that.data.birthDate2 + " " + formatTime3 //入栏
            };

            console.log(source_label_list)
            console.log(JSON.stringify(data))


            request.request_post('/pigManagement/NewSuch.hn', data, function (res) {
                console.info('回调', res)
                if (res) {
                    if (res.success) {
                        var result_arr = res.msg;
                       
                        wx.hideLoading()
                        that.setData({source_label_list:[]})

                        // 存储到storage
                        wx.setStorageSync('storage_farm_name2', that.data.farm_name2);
                        wx.setStorageSync('storage_farm_id2', that.data.farm_id2);
                        wx.setStorageSync('storage_piggery_name2', that.data.piggery_name2);
                        wx.setStorageSync('storage_piggery_id2', that.data.piggery_id2);
                        wx.setStorageSync('storage_sty_name2', that.data.sty_name2);
                        wx.setStorageSync('storage_sty_id2', that.data.sty_id2);


                        wx.showModal({
                            title: '成功',
                            content: result_arr,
                            confirmText: '继续转栏',
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
                        box.showToast(res.msg)
                    }
                }
            })
        }
    },
})