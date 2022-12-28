const app = getApp();

Component({
  /**
   * 组件的一些选项
   */
  options: {
        addGlobalClass: true,
        multipleSlots: true
  },
  /**
   * 组件的对外属性
   */
  properties: {
    bgColor: {
        type: String,
        default: ''
    }, 
    isCustom: {
        type: [Boolean, String],
        default: false
    },
    isBack: {
        type: [Boolean, String],
        default: false
    },
    isMenu: {
        type: [Boolean, String],
        default: false
    },
    isMenuMesg:{
        type: [Boolean, String],
        default: false
    },
    isMenuMesgAdd:{
        type: [Boolean, String],
        default: false
    },
    bgImage: {
        type: String,
        default: ''
    },
    isHome:{
        type: [Boolean, String],
        default: false
    },
    farm_num:{
        type: String,
        default: ''
    },
    isClose:{
        type: [Boolean, String],
        default: false
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
        StatusBar: app.globalData.StatusBar,
        CustomBar: app.globalData.CustomBar,
        Custom: app.globalData.Custom
  },
  /**
   * 组件的方法列表
   */
  methods: {
        BackPage() {
            wx.navigateBack({
                delta: 1
            });
        },
        toHome(e){
            var farm_num = e.currentTarget.dataset.farm_num
            wx.reLaunch({
                url: '/pages/main/home?farm_num=' + farm_num,
            })
        },
        openMenu(){
            console.log('open menu')
            this.triggerEvent('openMenu', true);
        },
        openMesg() {
            console.log('open mesg')
            this.triggerEvent('openMesg', true);
        },
        openAdd(){
            console.log('open add')
            this.triggerEvent('openAdd', true);
        },
        toClose(){
            console.log('open close')
            this.triggerEvent('toClose', true);
        }
    }
})