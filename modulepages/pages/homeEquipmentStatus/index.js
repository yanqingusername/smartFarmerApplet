const app = getApp();
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')

Page({
	data:{
        page: 1,
        limit: 10,
        deviceinfoList: [],
        count: 0
	},
    onLoad:function() {
      var that = this;
      that.getdeviceinfo();
    },
    onShow:function(){
        
    },
    onReachBottom: function () {
        this.getdeviceinfo();
      },
    getdeviceinfo:function(){
        var that = this;
        var data = {
            page: that.data.page,
            limit: that.data.limit,
            // company_serial: app.globalData.userInfo.company_serial
            pig_farm_id: app.globalData.userInfo.pig_farm_id
        }
        request.request_get('/equipmentManagement/getdeviceinfo.hn', data, function (res) {
            if (res) {
                if (res.success) {
                  if (that.data.page == 1) {
                    that.setData({
                        count: res.count,
                        deviceinfoList: res.info,
                      page: (res.info && res.info.length > 0) ? that.data.page + 1 : that.data.page
                    });
                  } else {
                    that.setData({
                        // count: res.count,
                        deviceinfoList: that.data.deviceinfoList.concat(res.info || []),
                      page: (res.info && res.info.length > 0) ? that.data.page + 1 : that.data.page,
                    });
                  }
                } else {
                  box.showToast(res.msg);
                }
              }
        })
    },
    handleRouter(e){
      let id = e.currentTarget.dataset.id;
      if(id){
        wx.navigateTo({
          url: `/modulepages/pages/homeEquipmentStatusList/index?eid=${id}`
        });
      }
    }
});