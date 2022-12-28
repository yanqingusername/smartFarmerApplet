const app = getApp();
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')

Page({
    data: {
        loading:false,
        isEnd:false,
        page:0,
        limit:10,
    },
    onLoad: function (options){
        this.setData({
            type: options.type,
            id: options.id
        })
    },
    onShow:function(){
        var that = this;
        that.getPigAlarm(that.data.page);
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
    // 猪只报警
    getPigAlarm:function(page){
        var that = this;
        that.setData({loading:true})
        var data = {
            pig_farm:app.globalData.userInfo.pig_farm_id,
            type:that.data.type,
            id:that.data.id
        }
        request.request_get('/equipmentManagement/getFarmEquipmentAlarm.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    that.setData({pig_alarm: res.msg})
                } else {
                    box.showToast(res.msg)
                }
                that.setData({loading:false})
            }
        })
    },
    //********上拉加载**************************************
    onReachBottom() {
        var that = this;
        if(!that.data.loading && !that.data.isEnd){
            var page = that.data.page + 1;
            that.getPigAlarm(page);
        }else{
            // nodo
        }
    },
})