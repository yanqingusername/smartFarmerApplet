const app = getApp()
var request = require('../../../utils/request.js')
var box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    submitState: true,
    genderList: ['男', '女'],
    genderIndex: 0,
    gender: '',
    isShowGender: 1,
    isEdit: 1,  //  1-新增   2-编辑
    uid: '',

    yearmouthday: "",
    timestamp: new Date().getTime(),
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
  getuserinfo() {
    let that = this;
    let params = {
      id: this.data.uid
    }

    request.request_get('/personnelManagement/getuserinfo.hn', params, function (res) {
      if (res) {
        if (res.success) {
          let userList = res.data;
          if(userList && userList.length > 0){
            let userInfo = userList[0];
            that.setData({
              name: userInfo.real_name,
              job_number: userInfo.job_number,
              job_phone: userInfo.phone,
              // password: userInfo.password,
              frontPhoto: userInfo.head_url
            });

            let job_id = userInfo.roleId;
            let job_name_1 = "";
            let categoryIndex = 0;
            if(that.data.jobNameList.length > 0){
              for(let i = 0; i < that.data.jobNameList.length; i++){
                if(job_id == that.data.jobNameList[i].id){
                  job_name_1 = that.data.jobNameList[i].role_name;
                  categoryIndex = i;
                  break;
                }
              }
            }
            let gender = userInfo.gender == 0 ? '男' : '女';
            let genderIndex = userInfo.gender == 0 ? '0' : '1';

            that.setData({
              job_name: job_name_1,
              job_id: job_id,
              categoryIndex: categoryIndex,
              gender: gender,
              genderIndex: genderIndex,
              isShowGender: 2,
              isShowRegion: 2
            });

            that.checkSubmitStatus();
          }
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    });
  },
  //保存按钮禁用判断
  checkSubmitStatus: function (e) {
    // && this.data.password != '' 
    if (this.data.name != '' && this.data.job_number != '' && this.data.job_phone != '' && this.data.job_name != '' && this.data.job_id != '' && this.data.frontPhoto != '' && this.data.gender != '') {
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
  bindJobNumber: function (e) {
    var str = e.detail.value;
    // str = utils.checkInput(str);
    this.setData({
      job_number: str
    })

    this.checkSubmitStatus();
  },
  bindPhone: function (e) {
    var str = e.detail.value;
    // str = utils.checkInput_2(str);
    this.setData({
      job_phone: str
    })

    this.checkSubmitStatus();
  },
  bindPassword: function (e) {
    var str = e.detail.value;
    // str = utils.checkInput_2(str);
    this.setData({
      password: str
    })

    this.checkSubmitStatus();
  },
  // 类别改变
  bindJobNameChange: function (e) {
    var categoryIndex = e.detail.value;
    this.setData({
      categoryIndex: categoryIndex,
      job_name: this.data.jobNameList[categoryIndex].role_name,
      job_id: this.data.jobNameList[categoryIndex].id,
      isShowRegion: 2
    });
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
  getRoleinfo() {
    let that = this;
    let params = {
      // company_serial: app.globalData.userInfo.company_serial
      pig_farm_id: app.globalData.userInfo.pig_farm_id
    }

    request.request_get('/personnelManagement/getRoleinfo.hn', params, function (res) {
      if (res) {
        if (res.success) {
          that.setData({
            jobNameList: res.data
          });

          if(that.data.uid){
            that.getuserinfo();
          }
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    });
  },
  submitBuffer() {
    let that = this;
    let name = this.data.name; //姓名
    let job_number = this.data.job_number; //工号
    let job_phone = this.data.job_phone;  //手机号
    // let password = this.data.password;  //密码
    let job_name = this.data.job_name;  //岗位id
    let job_id = this.data.job_id;   //岗位id
    let frontPhoto = this.data.frontPhoto;  //图片
    let gender = this.data.gender; //性别



    if (!name) {
      box.showToast("请输入姓名");
      return;
    }

    if (!job_number) {
      box.showToast("请输入工号");
      return;
    }

    if (!job_phone) {
      box.showToast("请输入手机号");
      return;
    }

    if (!utils.checkPhone(job_phone)) {
      box.showToast("手机号有误");
      return;
    }

    // if (!password) {
    //   box.showToast("请输入密码");
    //   return;
    // }

    if (!job_name || !job_id) {
      box.showToast("请选择所在岗位");
      return;
    }

    if (!gender) {
      box.showToast("请选择性别");
      return;
    }

    if (!frontPhoto) {
      box.showToast("请上传头像");
      return;
    }

    let params = {
      // company_serial: app.globalData.userInfo.company_serial, //公司id
      // company: app.globalData.userInfo.company, //公司
      pig_farm_id: app.globalData.userInfo.pig_farm_id,
      real_name: name, //姓名
      gender: gender == '男' ? '0' : '1', //男女
      phone: job_phone, //手机号
      job_number: job_number, //工号
      roleId: job_id, //岗位id
      // password: password, //密码
      fileUrl: frontPhoto
    }

    console.log('---->:',params)

    let url = "/personnelManagement/adduserinfo.hn";
    if(this.data.isEditCus == 2){
      params.id = this.data.uid;
      params.status = '0';
      url = "/personnelManagement/edituserinfo.hn";
    }

    request.request_get(url, params, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          box.showToast(res.msg);

          setTimeout(()=>{
            wx.navigateBack({
              delta: 1,
            });
          },1500);

          // if(that.data.isEditCus == 2){
          //   if(that.data.uid == app.globalData.userInfo.id){
          //     that.getWorderInfo();
          //   }else{
          //     wx.navigateBack({
          //       delta: 1,
          //     });
          //   }
          // }else{
          //   wx.navigateBack({
          //     delta: 1,
          //   });
          // }
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })

  },
  bindDeleteClick(e) {
    let that = this;
    let id = this.data.uid;
    if (id) {
      if(id == app.globalData.userInfo.id){
        box.showToast("该员工信息无法删除");
      } else {
        wx.showModal({
          title: '确认删除该员工？',
          content: '删除后无法恢复',
          success: function (res) {
            if (res.confirm) {
              var data = {
                id: id,
              }
              request.request_get('/personnelManagement/deleteEmployee.hn', data, function (res) {
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
                }
              })
            }
          }
        })
      }
    }
  },
// 获取个人中心的信息
    getWorderInfo:function(){
        var that = this;
        var data = {
            id: this.data.uid
        }
        request.request_get('/AppletCommon/getUserinfo.hn', data, function (res) {
            if(res){
                if(res.success){
                    var userInfo = res.userinfo;
                    //存储用户信息
                    app.globalData.userInfo = userInfo[0];
                    wx.navigateBack({
                      delta: 1,
                    });
                }else{
                    box.showToast(res.msg);
                }
            }
        })
    },
})