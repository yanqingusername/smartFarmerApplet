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
        sty:{
            type: String,
            default: '',
        }
    },
  
    data: {
        show: false,
        sty:'',
        select_piggery:'',
        select_piggery_name:'',
        select_sty:'',
        select_sty_name:'',
        piggery_lst:[], //猪舍列表
        sty_lst:[], //猪栏列表
    },
    observers: { //观察者：属性监听
        'show'(show) {  
            if(show){
                // 进入这里说明打开弹框，需要加载舍信息
                this.select_piggery();
            }else{
                // 进入这里说明关闭弹框，需要清除舍栏信息
            }
        },
    },
      
    methods: {
        hideModal() {
            this.setData({show: false,sty:''})
            this.emptyData();
        },
        
        // 选择猪舍***************
        select_piggery:function(){
            var that = this;
            that.setData({piggery_lst:[]}) //清空
            var select_piggery = '';
            var select_piggery_name = ''
            var data = {
                pig_farm:app.globalData.userInfo.pig_farm_id
            }
            // 获取猪舍*********
            request.request_get('/pigManagement/getPiggery.hn', data, function (res) {
                console.info('回调', res)
                if (res) {
                    if (res.success) {
                        var piggery_lst = res.msg;
                        that.setData({piggery_lst:piggery_lst,select_piggery:select_piggery,select_piggery_name:select_piggery_name});
                    } else {
                        box.showToast(res.msg)
                    }
                }
            })
        },

        selectSty:function(e){
            var that = this;
            that.setData({sty_lst:[]}) //清空
            var piggery_number = e.currentTarget.dataset.piggery_number;
            var piggery_name = e.currentTarget.dataset.piggery_name;
            var select_piggery = piggery_number;
            var select_piggery_name = piggery_name
            var data = {
                pig_farm:app.globalData.userInfo.pig_farm_id,
                piggery_number:piggery_number
            }
            request.request_get('/pigManagement/getStyByPiggery.hn', data, function (res) {
                console.info('回调', res)
                if (res) {
                    if (res.success) {
                        console.log("传入sty_number" + that.data.sty)
                        var sty_lst_0 = res.msg;
                        var sty_lst = [];
                        for(var a in sty_lst_0){
                            var sty_number = sty_lst_0[a].sty_number;
                            if(sty_number == that.data.sty){
                                continue;
                            }else{
                                sty_lst.push(sty_lst_0[a]);
                            }
                        }
                        that.setData({sty_lst:sty_lst,select_piggery:select_piggery,select_piggery_name:select_piggery_name});
                    } else {
                        box.showToast(res.msg)
                    }
                }
            })
        },
        againSelectPiggery:function(){
            this.setData({select_piggery:'',select_piggery_name:''})
        },
        finishStySelect:function(e){
            var that = this;
            var piggery_sty = []
            var piggery_number = that.data.select_piggery;
            var piggery_name = that.data.select_piggery_name;
            piggery_sty.push({'name':piggery_name,'number':piggery_number});
    
            var sty_number = e.currentTarget.dataset.sty_number;
            var sty_name = e.currentTarget.dataset.sty_name;
            piggery_sty.push({'name':sty_name,'number':sty_number});
            
            console.log("所选的猪栏");
            console.log(piggery_sty)
            that.triggerEvent('selectData', piggery_sty);
            that.hideModal()
        },

        emptyData:function(){
            this.setData({
                select_piggery:'',
                select_piggery_name:'',
                select_sty:'',
                select_sty_name:'',
                piggery_lst:[],
                sty_lst:[], 
            })
        },
    }
  })