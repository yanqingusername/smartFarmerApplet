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
    ipstring: "",
    submitState: true,
    jobNameList: [],
    categoryIndex: 0,
    isShowRegion: 1,
    job_id: '',
    job_name: '',

    positionList: [],
    positionIndex: 0,
    isShowPosition: 1,
    position_id: '',
    position_name: '',

    isEdit: 1, // 1-新增  2-编辑
    uid: '',

    managePersionIds:"",
    managePersion: '',
    selectPersionList: [],
    employeesList: []
  },
  onShow: function () {
    // this.getPersonnelList();
    // this.getPositionList();
    this.checkSubmitStatus();
  },
  onLoad: function (options) {

    this.setData({
      isEdit: options.isEdit || 1,
      uid: options.uid
    });
    wx.setNavigationBarTitle({
      title: this.data.isEdit == 1 ? "新增门禁位点信息" : "编辑门禁位点信息"
    })

    this.getPositionList();
    this.getEmployeesList();

    if(this.data.uid && this.data.isEdit == 2){
      this.getAccessdeviceinfobyid();
    }
  },
  getAccessdeviceinfobyid(){
    let that = this
    let params = {
      // pig_farm_id: app.globalData.userInfo.pig_farm_id,
      id: this.data.uid,
    }

    request.request_get('/AccessManagement/getAccessdeviceinfobyid.hn', params, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          if(res.data && res.data.length > 0){
            let deviceInfo = res.data[0]
            that.setData({
              name: deviceInfo.sn,
              ipstring: deviceInfo.access_control_ipaddress,
              position_id: deviceInfo.location_id,
              position_name: deviceInfo.location_descr,
              isShowPosition: 2
            });
          }

          if(res.user && res.user.length > 0){
            
            let user = res.user
            let managePersionIds = [];
            let managePersion = [];
            for(let j = 0; j < user.length; j++) {
              managePersion.push(user[j].name);
              managePersionIds.push(user[j].id);
            }

            that.setData({
              managePersionIds:managePersionIds.join(','),
              managePersion: managePersion.join(','),
              selectPersionList: user,
            });

          }

          that.checkSubmitStatus();
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  //保存按钮禁用判断
  checkSubmitStatus: function (e) {
    // && this.data.job_id != '' && this.data.job_name != ''
    if (this.data.name != '' && this.data.ipstring != '' && this.data.position_id != '' && this.data.position_name != '' && this.data.managePersion != '') {
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
    console.log(e.detail.value)
    var str = e.detail.value;
    // str = utils.checkInput_2(str);
    this.setData({
      name: str
    })

    this.checkSubmitStatus();
  },
  bindPositionChange: function (e) {
    var positionIndex = e.detail.value;
    this.setData({
      positionIndex: positionIndex,
      position_id: this.data.positionList[positionIndex].id,
      position_name: this.data.positionList[positionIndex].location_descr,
      isShowPosition: 2
    });
    this.checkSubmitStatus();
  },
  bindIp: function (e) {
    var str = e.detail.value;
    this.setData({
      ipstring: str
    })

    this.checkSubmitStatus();
  },
  bindJobNameChange: function (e) {
    var categoryIndex = e.detail.value;
    this.setData({
      categoryIndex: categoryIndex,
      job_id: this.data.jobNameList[categoryIndex].id,
      job_name: this.data.jobNameList[categoryIndex].name,
      isShowRegion: 2
    });
    this.checkSubmitStatus();
  },
  submitBuffer() {
    let that = this;
    let name = this.data.name;
    let ipstring = this.data.ipstring;
    let position_id = this.data.position_id;
    let position_name = this.data.position_name;
    // let job_id = this.data.job_id;
    // let job_name = this.data.job_name;

    let managePersion = this.data.managePersion;
    let managePersionIds = this.data.managePersionIds;

    if (!name) {
      box.showToast("请输入设备编号");
      return;
    }

    if (!ipstring) {
      box.showToast("请输入设备IP");
      return;
    }

    if (!utils.checkIP(ipstring)) {
      box.showToast("ip格式有误");
      return;
    }

    if (!position_id && !position_name) {
      box.showToast("请选择设备位置");
      return;
    }

    if (!managePersion && !managePersionIds) {
      box.showToast("请选择设备人员");
      return;
    }
    box.showLoading('加载中...');
    // if (!job_id && !job_name) {
    //   box.showToast("请选择设备管理员");
    //   return;
    // }
    if(this.data.isEdit == 2){
      let params = {
        pig_farm: app.globalData.userInfo.pig_farm_id ,
        sn: name, //设备编号
        ip: ipstring, //设备IP
        address_id: position_id, //设备位置
        // user_id:  job_id,//设备管理员id
        Person_authority: managePersionIds, //（管理者）
        id: this.data.uid,
      }

      request.request_get('/AccessManagement/editEntranceGuard.hn', params, function (res) {
        wx.hideLoading();
        if (res) {
          if (res.success) {
            box.showToast(res.msg,'',1000);
            setTimeout(()=>{
              wx.navigateBack({
                delta: 1,
              });
            },1500);
            // let fail_text = '';

            // if(res.inserterrormsg && res.inserterrormsg.length > 0){
            //   fail_text += that.setMsg(res.inserterrormsg, '新增失败')
            // }

            // if(res.insertsuccessmsg && res.insertsuccessmsg.length > 0){
            //   fail_text += that.setMsg(res.insertsuccessmsg, '新增成功')
            // }

            // if(res.deleteerrormsg && res.deleteerrormsg.length > 0){
            //   fail_text += that.setMsg(res.deleteerrormsg, '删除失败')
            // }

            // if(res.deletesuccessmsg && res.deletesuccessmsg.length > 0){
            //   fail_text += that.setMsg(res.deletesuccessmsg, '删除成功')
            // }

            // wx.showModal({
            //   title: '温馨提示',
            //   content: fail_text,
            //   confirmText: '确定',
            //   cancelText: '返回',
            //   // showCancel: false,
            //   success: function (res) {
            //       if (res.confirm) {
            //         wx.navigateBack({
            //           delta: 1,
            //         });
            //       }else {
            //         wx.navigateBack({
            //           delta: 1,
            //         });
            //       }
            //   }
            // })
          } else {
            box.showToast(res.msg);
          }
        } else {
          box.showToast("网络不稳定，请重试");
        }
      });
    }else{
      let params = {
        pig_farm: app.globalData.userInfo.pig_farm_id ,
        sn: name, //设备编号
        ip: ipstring, //设备IP
        address_id: position_id, //设备位置
        // user_id:  job_id,//设备管理员id
        Person_authority: managePersionIds, //（管理者）
      }

      console.log('---->:',params)

      request.request_get('/AccessManagement/addEntranceGuard.hn', params, function (res) {
        wx.hideLoading();
        if (res) {
          if (res.success) {
            box.showToast(res.msg,'',1000);
            setTimeout(()=>{
              wx.navigateBack({
                delta: 1,
              });
            },1500);

            // let fail_text = '';

            // if(res.successmsg && res.successmsg.length > 0){
            //   fail_text += that.setMsg(res.successmsg, '下发命令成功')
            // }

            // if(res.errormsg && res.errormsg.length > 0){
            //   fail_text += that.setMsg(res.errormsg, '下发命令失败')
            // }


            // wx.showModal({
            //   title: '温馨提示',
            //   content: fail_text,
            //   confirmText: '确定',
            //   cancelText: '返回',
            //   // showCancel: false,
            //   success: function (res) {
            //       if (res.confirm) {
            //         wx.navigateBack({
            //           delta: 1,
            //         });
            //       }else {
            //         wx.navigateBack({
            //           delta: 1,
            //         });
            //       }
            //   }
            // })
          } else {
            // if(res.errormsg && res.errormsg.length > 0){
            //   let employeesList = that.data.employeesList;
            //   let errormsg = res.errormsg || [];
            //   let persionListName = [];
            //   if (errormsg.length > 0) {
            //     if (employeesList.length > 0) {
            //       for (let i = 0; i < employeesList.length; i++) {
            //         for (let j = 0; j < errormsg.length; j++) {
            //           if (errormsg[j] == employeesList[i].id) {
            //             persionListName.push(employeesList[i].name)
            //             break;
            //           } else {
            //           }
            //         }
            //       }
            //     }
            //     let fail_text = persionListName.join('/')
            //     wx.showModal({
            //       title: '失败',
            //       content: fail_text + " " + res.msg,
            //       confirmText: '确定',
            //       // cancelText: '返回主页',
            //       showCancel: false,
            //       success: function (res) {
            //           if (res.confirm) {
                          
            //           }
            //       }
            //     })
            //   }
            // }else{
              box.showToast(res.msg);
            // }
          }
        } else {
          box.showToast("网络不稳定，请重试");
        }
      })
    }

  },
  getPersonnelList() {
    let that = this;
    let params = {
      // source: "1",
      pig_farm: app.globalData.userInfo.pig_farm_id
    }

    request.request_get('/personnelManagement/getOnTheJobPersonnelList.hn', params, function (res) {
      if (res) {
        if (res.success) {
          that.setData({
            jobNameList: res.msg
          });
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  getPositionList() {
    let that = this;
    let params = {
      pig_farm_id: app.globalData.userInfo.pig_farm_id
    }

    request.request_get('/AccessManagement/getAccesslayout.hn', params, function (res) {
      if (res) {
        if (res.success) {
          that.setData({
            positionList: res.data
          });
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    });
  },
  bindDeleteClick(e) {
    let that = this;
    let id = this.data.uid;
    if (id) {
      wx.showModal({
        title: '是否删除设备?',
        content: '删除设备后无法恢复',
        success: function (res) {
          if (res.confirm) {
            var data = {
              id: id,
              status: '1'
            }
            request.request_get('/AccessManagement/deleteEntranceGuardInfo.hn', data, function (res) {
              if (res) {
                if (res.success) {
                  box.showToast(res.msg,'',1000);
                  setTimeout(()=>{
                    wx.navigateBack({
                      delta: 1,
                    });
                  },1500)
                } else {
                  box.showToast(res.msg);
                }
              }
            })
          }
        }
      })
    }
  },
  clickOzoneModuleManagePersion(){
    wx.navigateTo({
      url:`/modulepages/pages/entranceGuardManagePersion/index?idlist=${this.data.managePersionIds}`
    });
  },
  getEmployeesList: function () {
    var that = this;
    var data = {
      // source: "1",
      pig_farm: app.globalData.userInfo.pig_farm_id
    }
    request.request_get('/personnelManagement/getOnTheJobPersonnelList.hn', data, function (res) {
      if (res) {
        if (res.success) {
          that.setData({
            employeesList: res.msg
          });
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
  setMsg(dataList, textName){
    let that = this;
    let fail_text = ''
    if(dataList && dataList.length > 0){
      let employeesList = that.data.employeesList;
      let persionListName = [];
      if (dataList.length > 0) {
        if (employeesList.length > 0) {
          for (let i = 0; i < employeesList.length; i++) {
            for (let j = 0; j < dataList.length; j++) {
              if (dataList[j] == employeesList[i].id) {
                persionListName.push(employeesList[i].name)
                break;
              } else {
              }
            }
          }
        }
        fail_text = persionListName.join('/');
        fail_text = fail_text + textName + '\r\n'
      }
    }
    return fail_text;
  }
})