const app = getApp();
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
const box = require('../../utils/box.js')
const time = require('../../utils/time.js')
const face = require('../../utils/face.js')

Page({
    data: {
        selectedType: 0,
        personnelArr: [],
        personnelIndex: 0,
        personnelValue: '', // 只作用于初始化
        name: '',
        job_number: '',
        phone: '',
        reason: '',
        RecordList:[]
    },
    onShow: function () {
        var that = this;
        var type = that.data.selectedType;
        if (type == '1') {
            //TODO 如果是历史，则查询记录 
            that.getPersonnelRecord();
        }
    },

    // 类型切换
    selectFunc: function (e) {
        var that = this;
        var initType = that.data.selectedType;
        var type = e.currentTarget.dataset.type;
        if (type == '1') {
            //TODO 如果是历史，则查询记录 
            that.getPersonnelRecord();
        }
        that.setData({
            selectedType: type
        })

    },
    getPersonnelRecord:function(e){
        //TODO 获取人员入场记录
        
    },

    // 新增信息提交
    submitAdd: function (e) {
        data = {
            pig_farm: app.globalData.userInfo.pig_farm_id,
        }
        if (phone == "") {
            box.showToast("请填写手机号");
            return;
        }
        box.showLoading('正在上传');
        //TODO
        //新增入场申请，提交
    },

    // 进入详情
    enter_details: function (e) {
        var id = e.currentTarget.dataset.id;
        console.log("入场申请id:" + id);
        //TODO
        wx.navigateTo({
            url: '/pages/personal/details?id=' + id + '&type=' + type,
        })
    },
    // 获取人员列表
    getPersonnelList: function () {
        var that = this;
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id,
            source: '1',
        }
        console.log(data);
        request.request_get('/personnelManagement/getPersonnelList.hn', data, function (res) {
            console.info('回调', res)
            if (res.success) {
                var personnelInfo = res.msg;
                var personnelArr = [];
                var personnelIndex = 0;
                var personnelValue = '';
                for (var a in personnelInfo) {
                    var name = personnelInfo[a].name;
                    var job_number = personnelInfo[a].job_number;
                    name = name + "(工号" + job_number + ")";
                    var id = personnelInfo[a].id;
                    personnelArr.push({
                        'name': name,
                        'job_number': job_number,
                        'id': id
                    })
                }
                that.setData({
                    personnelArr: personnelArr,
                    personnelIndex: personnelIndex,
                    personnelValue: personnelValue
                });
            } else {
                box.showToast(res.msg)
            }
            box.hideLoading();
        })
    },
    personnelChange(e) {
        var that = this;
        that.setData({
            personnelIndex: e.detail.value
        })
    },
})