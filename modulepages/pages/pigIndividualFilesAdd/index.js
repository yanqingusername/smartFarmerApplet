const app = getApp()
var request = require('../../../utils/request.js')
var box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: "",
    snname: "",

    varietiesList: [],
    varietiesIndex: 0,
    varieties: '',
    isShowVarieties: 1,

    submitState: true,
    genderList: ['母猪', '公猪'], // 1-母猪   3-公猪
    genderIndex: 0,
    gender: '',
    isShowGender: 1,
    isEdit: 1, //  1-新增   2-编辑
    uid: '',

    yearmouthday: "",
    timestamp: new Date().getTime(),

    individualStatus: '在场',
    pidinfo: ''
  },
  onShow: function () {

  },
  onLoad: function (options) {

    this.setData({
      isEdit: options.isEdit || 1,
      uid: options.id
    });

    wx.setNavigationBarTitle({
      title: this.data.isEdit == 1 ? "新增猪只信息" : '编辑猪只信息'
    });

    this.currentTime();

    this.getBreedlist();

    if(this.data.isEdit == 2){
      /**
       * 根据ID获取品种信息
       */
      this.getPidinfobyid();
    }
  },
  /**
   * 根据ID获取品种信息
   */
   getPidinfobyid: function () {
    var that = this;
    var data = {
      id: this.data.uid,
    }
    request.request_get('/pigManagement/getPidinfobyid.hn', data, function (res) {
      if (res) {
        if (res.success) {
          if(res.data && res.data.length > 0){
            let pidinfo = res.data[0];
            that.setData({
              name: pidinfo.source_label,
              snname: pidinfo.label_id,
              varieties: pidinfo.breed,
              isShowVarieties: 2,
              gender: pidinfo.label_type == 3 ? '公猪' : '母猪',
              isShowGender: 2,
              individualStatus: pidinfo.operation == 1 ? '离场' : '在场'
            });

            that.checkSubmitStatus();
          }
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
  /**
   * 获取品种信息
   */
  getBreedlist: function () {
    var that = this;
    var data = {
      pig_farm_id: app.globalData.userInfo.pig_farm_id,
    }
    request.request_get('/pigManagement/getBreedlist.hn', data, function (res) {
      if (res) {
        if (res.success) {
          that.setData({
            varietiesList: res.data,
          });
        } else {
          // box.showToast(res.msg);
        }
      }
    })
  },
  /**
   * 当前日期
   */
  currentTime() {
    let tempTime = new Date(this.data.timestamp);
    let month = tempTime.getMonth() + 1;
    let day = tempTime.getDate();
    if (month < 10) {
      month = "0" + month
    }
    if (day < 10) {
      day = "0" + day
    }
    // let curtime = tempTime.getFullYear() + "年" + (month) + "月" + day + "日";
    let curDate = tempTime.getFullYear() + "-" + (month) + "-" + day;
    this.setData({
      yearmouthday: curDate
    })
  },
  //保存按钮禁用判断
  checkSubmitStatus: function (e) {
    // && this.data.password != '' 
    if (this.data.name != '' && this.data.varieties != '' && this.data.gender != '') {
      this.setData({
        submitState: false
      })
    } else {
      this.setData({
        submitState: true
      })
    }
  },
  inputTap(e){
    var that = this
    wx.hideKeyboard()
    setTimeout(function(){
      that.setData({
        focusId: e.currentTarget.id
      })
    },200)
  },
  bindName: function (e) {
    var str = e.detail.value;
    // str = utils.checkInput_2(str);
    this.setData({
      name: str
    })

    this.checkSubmitStatus();
  },
  bindSnName: function (e) {
    var str = e.detail.value;
    // str = utils.checkInput(str);
    this.setData({
      snname: str
    })

    this.checkSubmitStatus();
  },
  // 品种改变
  bindPickerChangeVarieties: function (e) {
    var that = this;
    this.setData({
      varietiesIndex: e.detail.value,
      varieties: that.data.varietiesList[e.detail.value],
      isShowVarieties: 2
    })
    this.checkSubmitStatus();
  },
  bindPickerChangeGender: function (e) {
    var that = this;
    this.setData({
      genderIndex: e.detail.value,
      gender: that.data.genderList[e.detail.value],
      isShowGender: 2
    })
    this.checkSubmitStatus();
  },
  submitBuffer() {
    let that = this;
    let name = this.data.name; //耳号
    let snname = this.data.snname; //电子耳标
    let varieties = this.data.varieties; //品种
    let gender = this.data.gender; //性别

    if (!name) {
      box.showToast("请输入耳号");
      return;
    }

    // if (!snname) {
    //   box.showToast("请输入电子耳标");
    //   return;
    // }

    if (!varieties) {
      box.showToast("请选择品种");
      return;
    }

    if (!gender) {
      box.showToast("请选择性别");
      return;
    }

    let params = {
      pig_farm_id: app.globalData.userInfo.pig_farm_id,
      source_label: name,
      type: gender == '母猪' ? '1' : '3',// 1-母猪   3-公猪
      label_id: snname,
      breed: varieties,
      create_time: this.data.yearmouthday
    }

    console.log('---->:', params)

    let url = "/pigManagement/addPiginfo.hn";
    if (this.data.isEdit == 2) {
      params.id = this.data.uid;
      url = "/pigManagement/editPiginfo.hn";
    }

    request.request_get(url, params, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          box.showToast(res.msg);

          setTimeout(() => {
            wx.navigateBack({
              delta: 1,
            });
          }, 1500);
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })

  },
})