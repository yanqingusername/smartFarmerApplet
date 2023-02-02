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
    job_number: '',
    job_phone: "",
    password: '',
    job_name: '',
    job_id: '',
    frontPhoto: "",
    jobNameList: [],
    categoryIndex: 0,
    isShowRegion: 1,
    submitState: true,
    genderList: ['男', '女'],
    genderIndex: 0,
    gender: '',
    isShowGender: 1,
    isEditCus: 1,  //  1-新增   2-编辑
    uid: ''
  },
  onShow: function () {
    
  },
  onLoad: function (options) {
    this.setData({
      isEditCus: options.isEditCus || 1,
      uid: options.uid
    });
    wx.setNavigationBarTitle({
      title: this.data.isEditCus == 1 ? "新增员工信息" : "编辑员工信息"
    })

    this.getRoleinfo();
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
              password: userInfo.password,
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
    if (this.data.name != '' && this.data.job_number != '' && this.data.job_phone != '' && this.data.password != '' && this.data.job_name != '' && this.data.job_id != '' && this.data.frontPhoto != '' && this.data.gender != '') {
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
  // bindJobNameChange(e){
  //   console.log(e.detail.detail)
  //   this.setData({
  //     job_name: '',
  //     isShowRegion: 2
  //   });
  // },
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
  // 头像上传
  ChooseImage: function () {
    var that = this;
    let data = [];
    that.setData({
      imgFlag: true
    })
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        var filePath = res.tempFilePaths;

        for (let i = 0; i < filePath.length; i++) {
          wx.uploadFile({
            url: 'http://syrdev.coyotebio-lab.com:8080/IntelligentCreature/personnelManagement/upload.hn',  // 测试服务器
            // url: 'https://monitor.coyotebio-lab.com:8443/IntelligentCreature/personnelManagement/upload.hn',  // 正式服务器
            filePath: filePath[i],
            name: 'imageFile',
            formData: data,
            header: {
              "chartset": "utf-8"
            },
            success: function (returnRes) {
              let data = JSON.parse(returnRes.data)
              if(data){
                if(data.success){
                  let msg = data.msg;
                  that.setData({
                    frontPhoto: msg
                  })
                  that.checkSubmitStatus();
                }
              }
            },
          })
        }
      }
    })
  },
  //预览图片，放大预览
  preview: function (e) {
    var that = this;
    that.setData({
      imgFlag: true
    })
    let currentUrl = e.currentTarget.dataset.url
    wx.previewImage({
      current: currentUrl, // 当前显示图片的http链接
      urls: [currentUrl] // 需要预览的图片http链接列表
    })
  },
  delview: function () {
    this.setData({
      frontPhoto: ""
    });
    this.checkSubmitStatus();
  },
  getRoleinfo() {
    let that = this;
    let params = {
      company_serial: app.globalData.userInfo.company_serial
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
    let password = this.data.password;  //密码
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

    if (!password) {
      box.showToast("请输入密码");
      return;
    }

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
      company_serial: app.globalData.userInfo.company_serial, //公司id
      company: app.globalData.userInfo.company, //公司
      real_name: name, //姓名
      gender: gender == '男' ? '0' : '1', //男女
      phone: job_phone, //手机号
      job_number: job_number, //工号
      roleId: job_id, //岗位id
      password: password, //密码
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
          if(that.data.isEditCus == 2){
            if(that.data.uid == app.globalData.userInfo.id){
              that.getWorderInfo();
            }else{
              wx.navigateBack({
                delta: 1,
              });
            }
          }else{
            wx.navigateBack({
              delta: 1,
            });
          }
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
                    wx.navigateBack({
                      delta: 1,
                    });
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