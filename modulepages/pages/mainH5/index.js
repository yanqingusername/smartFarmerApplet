const app = getApp()
Page({
  data: {
    typestring:1,
    title: ''
  },
  onLoad: function (options) {
    
      let typestring = options.typestring;
      let title = options.title
      this.setData({
        typestring:typestring,
        title: title
      });

      wx.setNavigationBarTitle({
        title: title
      });
  },
  onReady: function () {

  },
  onShow: function () {

  },

})