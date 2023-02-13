const app = getApp();
var request = require('../utils/request.js')
var box = require('../utils/box.js')

Component({
    options: {
        addGlobalClass: true,
        multipleSlots: true
    },
    properties: {
        //是否显示modal弹窗
        show: {
            type: Boolean,
            default: false,
        },
        sty: {
            type: String,
            default: '',
        }
    },

    data: {
        show: false,
        sty: '',
        isShowNumber: 1,
        select_farm: '',
        select_farm_name: '',
        select_piggery: '',
        select_piggery_name: '',
        select_sty: '',
        select_sty_name: '',
        farm_list: [], //场区列表
        piggery_lst: [], //猪舍列表
        sty_lst: [], //猪栏列表
    },
    observers: { //观察者：属性监听
        'show'(show) {
            if (show) {
                // 进入这里说明打开弹框，需要加载舍信息
                this.getPigSitearea();
            } else {
                // 进入这里说明关闭弹框，需要清除舍栏信息
            }
        },
    },

    methods: {
        hideModal() {
            this.setData({
                show: false,
                sty: '',
                isShowNumber: 1
            })
            this.emptyData();
        },

        // 选择场区***************
        getPigSitearea: function () {
            var that = this;
            that.setData({
                farm_list: []
            }) //清空
            var select_farm = '';
            var select_farm_name = ''

            var data = {
                pig_farm: app.globalData.userInfo.pig_farm_id
            }
            // 获取场区*********
            request.request_get('/pigManagement/getPigSitearea.hn', data, function (res) {
                console.info('回调', res)
                if (res) {
                    if (res.success) {
                        var farm_list = res.msg;
                        that.setData({
                            farm_list: farm_list,
                            select_farm: select_farm,
                            select_farm_name: select_farm_name,
                            isShowNumber: '1'
                        });
                    } else {
                        box.showToast(res.msg)
                    }
                }
            })
        },
        selectfarm: function (e) {
            var that = this;
            that.setData({
                piggery_lst: [],
                sty_lst: []
            }) //清空
            var select_farm = e.currentTarget.dataset.id;
            var select_farm_name = e.currentTarget.dataset.locationdescr;
            var data = {
                SiteAreaid: select_farm
            }
            request.request_get('/pigManagement/getPiggerybyid.hn', data, function (res) {
                console.info('回调', res)
                if (res) {
                    if (res.success) {
                        console.log("传入sty_number" + that.data.sty)
                        var piggery_lst = res.msg;
                        that.setData({
                            piggery_lst: piggery_lst,
                            select_farm: select_farm,
                            select_farm_name: select_farm_name,
                            isShowNumber: '2'
                        });
                    } else {
                        box.showToast(res.msg)
                    }
                }
            })
        },
        selectSty: function (e) {
            var that = this;
            that.setData({
                sty_lst: []
            }) //清空
            var select_piggery = e.currentTarget.dataset.id;
            var select_piggery_name = e.currentTarget.dataset.locationdescr;
            
            var data = {
                pig_farm: app.globalData.userInfo.pig_farm_id,
                piggery_number: select_piggery
            }
            request.request_get('/pigManagement/getStyByPiggery.hn', data, function (res) {
                console.info('回调', res)
                if (res) {
                    if (res.success) {
                        console.log("传入sty_number" + that.data.sty)
                        var sty_lst_0 = res.msg;
                        var sty_lst = [];
                        for (var a in sty_lst_0) {
                            var sty_number = sty_lst_0[a].sty_number;
                            if (sty_number == that.data.sty) {
                                continue;
                            } else {
                                sty_lst.push(sty_lst_0[a]);
                            }
                        }
                        that.setData({
                            sty_lst: sty_lst,
                            select_piggery: select_piggery,
                            select_piggery_name: select_piggery_name,
                            isShowNumber: '3'
                        });
                    } else {
                        box.showToast(res.msg)
                    }
                }
            })
        },
        //重选场区
        againSelectPiggery1: function () {
            this.setData({
                select_farm: '',
                select_farm_name: '',
                isShowNumber: '1'
            })
        },
        //重选猪舍
        againSelectPiggery: function () {
            this.setData({
                select_piggery: '',
                select_piggery_name: '',
                isShowNumber: '2'
            })
        },
        finishStySelect: function (e) {
            var that = this;
            var piggery_sty = []

            var farm_number = that.data.select_farm;
            var farm_name = that.data.select_farm_name;
            piggery_sty.push({
                'name': farm_name,
                'number': farm_number
            });

            var piggery_number = that.data.select_piggery;
            var piggery_name = that.data.select_piggery_name;
            piggery_sty.push({
                'name': piggery_name,
                'number': piggery_number
            });

            var sty_number = e.currentTarget.dataset.sty_number;
            var sty_name = e.currentTarget.dataset.sty_name;
            piggery_sty.push({
                'name': sty_name,
                'number': sty_number
            });

            console.log("所选的猪栏");
            console.log(piggery_sty)
            that.triggerEvent('selectData', piggery_sty);
            that.hideModal()
        },

        emptyData: function () {
            this.setData({
                select_farm: '',
                select_farm_name: '',
                select_piggery: '',
                select_piggery_name: '',
                select_sty: '',
                select_sty_name: '',
                farm_list: [],
                piggery_lst: [],
                sty_lst: [],
            })
        },
    }
})