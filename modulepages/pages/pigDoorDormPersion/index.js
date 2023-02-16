const app = getApp()
var request = require('../../../utils/request.js')
var box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    submitState: true,
    uid: ''
  },
  onShow: function () {
    
  },
  onLoad: function (options) {
    this.setData({
      uid: options.id
    });
    wx.setNavigationBarTitle({
      title: "编辑饲养员"
    })

  },
  //保存按钮禁用判断
  checkSubmitStatus: function (e) {
    if (this.data.name != '') {
      this.setData({
        submitState: false
      })
    } else {
      this.setData({
        submitState: true
      })
    }
  },
  bindName: function (e) {
    var str = e.detail.value;
    // str = utils.checkInput_2(str);
    this.setData({
      name: str
    })

    this.checkSubmitStatus();
  },
  
  submitBuffer() {
    let that = this;
    let name = this.data.name; //姓名

    if (!name) {
      box.showToast("请输入姓名");
      return;
    }

    

    let params = {
      pig_farm_id: app.globalData.userInfo.pig_farm_id,
      real_name: name, //姓名
      id: this.data.uid
    }

    console.log('---->:',params)

    request.request_get("/personnelManagement/edituserinfo.hn", params, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          box.showToast(res.msg);

          setTimeout(()=>{
            wx.navigateBack({
              delta: 1,
            });
          },1500);
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })

  },
})