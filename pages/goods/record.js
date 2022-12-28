const app = getApp()
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')

Page({
    data: {
        loading:false, //加载中
        isEnd:false, // 是否结束
        page:0,
        limit:10,
        search_info:'', // 物品id
    },

    onLoad: function (){
        console.log('进入问题反馈记录页面' );
    },
    onShow:function(){
        var that = this;
        that.getGoodsRecords(that.data.page);
    },

    // 获取物品记录记录
    getGoodsRecords:function(page){
        var that = this;
        that.setData({loading:true});
        var search_info = that.data.search_info;
        var data = {
            pig_farm: app.globalData.userInfo.pig_farm_id, 
            page: page,
            limit:that.data.limit,
            search:search_info
        }
        request.request_get('/goodsManagement/getGoodsRecords.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {
                    var data_list = res.msg;
                    var data_list_all = that.data.data_list;
                    if(typeof(data_list_all) != "undefined"){
                        if(data_list.length==0){
                            that.setData({isEnd:true}); // 没有了
                        }else{
                            if(page == that.data.page + 1){
                                data_list_all.push.apply(data_list_all,data_list);
                                that.setData({page:page});
                            }else if(page == 0){
                                data_list_all = data_list;
                                that.setData({page:page});
                            }
                        }   
                    }else{ // 第一次进入
                        data_list_all = data_list;
                    }
                    that.setData({data_list: data_list_all})
                } else {
                    box.showToast(res.msg)
                }
            }
            that.setData({loading: false})
        })
    },

    // ----------------------搜索------------
    searchInput:function(e){
        var that = this;
        that.setData({
            search_info: e.detail.value,
        })
    },
    search:function(){
        var that = this;
        var search_info = that.data.search_info;
        search_info = search_info.replace(/\s+/g, '');
        console.log('查找的内容' + search_info);
        
        // 重置页数信息
        that.setData({search_info:search_info,data_list: undefined,isEnd:false,loading:false,page:0,})
        // 置顶
        if (wx.pageScrollTo) {
            wx.pageScrollTo({
                scrollTop: 0
            })
        } else {
            console.log('当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。')
        }
        that.getGoodsRecords(that.data.page);
    },

    //-------------上拉加载*---------------
    onReachBottom() {
        var that = this;
        if(!that.data.loading && !that.data.isEnd){
            var page = that.data.page + 1;
            that.getGoodsRecords(page);
        }
    },
})