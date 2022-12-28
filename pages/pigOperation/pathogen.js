const app = getApp()
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')
const time = require('../../utils/time.js')

Page({
    data: {
        loading: false,
        isEnd: false,
        page: 0,
        limit: 20,
        img: [],
        modalName: '',
        label_id: '',
        test_name: '非洲猪瘟检测',
        test_result: '阴性',
        test_date: time.getDate(new Date())
    },
    onShow: function () {
        var that = this;
        this.getPathogenDetection(that.data.page);
    },
    getPathogenDetection: function (page) {
        var that = this;
        // that.setData({
        //     loading: true
        // })
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id,
            page: page,
            limit: that.data.limit,
        }
        request.request_get('/pigManagement/getPathogenDetection.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var test_list = res.msg;

                    var test_list_old = that.data.test_list;
                    if (typeof (test_list_old) != "undefined") {
                        if (test_list.length == 0) {
                            // 没有了
                            that.setData({
                                isEnd: true
                            })
                        } else {
                            if (page == that.data.page + 1) {
                                test_list_old.push.apply(test_list_old, test_list);
                                that.setData({
                                    page: page
                                })
                            } else if (page == 0) {
                                test_list_old = test_list;
                                that.setData({
                                    page: page
                                })
                            } else {
                                // nodo
                            }
                        }
                    } else {
                        // 第一次进入
                        test_list_old = test_list;
                    }
                    that.setData({
                        test_list: test_list_old
                    })
                } else {
                    box.showToast(res.msg)
                }
            }
            // that.setData({
            //     loading: false
            // })
        })
    },

    //********上拉加载**************************************
    onReachBottom() {
        var that = this;
        if (!that.data.loading && !that.data.isEnd) {
            var page = that.data.page + 1;
            that.getPathogenDetection(page);
        } else {
            // nodo
        }
    },
    previewTestImage: function (e) {
        var that = this;
        var url = e.currentTarget.dataset.url;
        if (url != null && url != '' && typeof (url) != undefined) {
            var img = [];
            img.push(url);
            wx.previewImage({
                urls: img
            })
        }
    },
    upimg: function () {
        var that = this;
        var data = [];

        wx.chooseImage({
            sizeType: ['original', 'compressed'],
            success: function (res) {
                var filePath = res.tempFilePaths;
                console.log("filePath.length:" + filePath.length)

                request.upload_file('/pigManagement/addPathogenImg.hn', filePath[0], 'imageFile', data, function (res) {
                    console.info('回调', res)
                    if (res) {
                        if (res.success) {
                            var img = [];
                            img.push(res.msg);
                            that.setData({
                                img: img
                            })
                            console.log("img" + img)
                        } else {
                            box.showToast(res.msg)
                        }
                    }
                })
            }
        })

    },
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
    // 预览图片
    previewImg: function (e) {
        var that = this;

        wx.previewImage({
            //所有图片
            urls: that.data.img
        })
    },
    bindDateChange: function (e) {
        var that = this;
        var values = e.detail.value;
        that.setData({
            test_date: values
        })
    },
    uploadData: function (e) {
        var that = this;
        request.request_get('/pigManagement/addPathogenData.hn', {
            label_id: that.data.label_id,
            test_name: that.data.test_name,
            test_result: that.data.test_result,
            img: that.data.img[0],
            test_date: that.data.test_date,
            pig_farm: app.globalData.userInfo.pig_farm_id
        }, function (res) {
            console.info('回调', res)
            if (res) {
                box.showToast(res.msg)
                if (res.success) {
                    // 关闭modal
                    that.setData({
                        modalName: null
                    })
                    that.onShow();
                }
            }
        })
    },
    set_test_name: function (e) {
        var that = this;
        var values = e.detail.value;
        that.setData({
            test_name: values
        })

    },
    set_test_result: function (e) {
        var that = this;
        var values = e.detail.value;
        that.setData({
            test_result: values
        })
    },
    set_label_id: function (e) {
        var that = this;
        var values = e.detail.value;
        that.setData({
            label_id: values
        })
    },
})