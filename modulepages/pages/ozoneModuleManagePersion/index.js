const app = getApp();
const request = require('../../../utils/request.js')
const box = require('../../../utils/box.js')
const utils = require('../../../utils/utils.js')

Page({
  data: {
    page: 1,
    limit: 10,
    employeesList: [],
    // employeesList: [{
    //   "role_name": "生产区员工",
    //   "head_url": "",
    //   "name": "张三",
    //   "id": 98,
    //   "job_number": "00001111",
    //   "isSelect": false
    // }, {
    //   "role_name": "生产区员工",
    //   "head_url": "",
    //   "name": "李四",
    //   "id": 99,
    //   "job_number": "22221111",
    //   "isSelect": false
    // }, {
    //   "role_name": "生产区员工",
    //   "head_url": "",
    //   "name": "王五",
    //   "id": 96,
    //   "job_number": "33331111",
    //   "isSelect": false
    // }, {
    //   "role_name": "测试区员工",
    //   "head_url": "",
    //   "name": "赵四",
    //   "id": 95,
    //   "job_number": "55552222",
    //   "isSelect": false
    // }, {
    //   "role_name": "生产区员工",
    //   "head_url": "",
    //   "name": "测试",
    //   "id": 97,
    //   "job_number": "77887788",
    //   "isSelect": false
    // }, {
    //   "role_name": "生产区员工",
    //   "head_url": "",
    //   "name": "测试8",
    //   "id": 94,
    //   "job_number": "77887784",
    //   "isSelect": false
    // }, {
    //   "role_name": "生产区员工",
    //   "head_url": "",
    //   "name": "测试9",
    //   "id": 93,
    //   "job_number": "77887783",
    //   "isSelect": false
    // }],
    title: "",

    searchText: '',
    isfocus: false,
    isSearch: false,

    lableidList: [],
    selectPersionList: []
  },
  onLoad: function (options) {
    this.setData({
      title: options.title
    });

    wx.setNavigationBarTitle({
      title: '选择设备管理员'
    })

    this.setData({
      page: 1
    });

    if (options && options.idlist) {
      let idlist = options.idlist
      let lableidList = idlist.split(',')
      console.log('--lableidList-->:', lableidList)
      this.setData({
        lableidList: lableidList
      });
    }


    this.getPersonnelList();
    // if (this.data.lableidList.length > 0) {
    //   this.setlableidList(1);
    // }
  },
  onShow: function () {

  },
  onReachBottom: function () {

  },
  getPersonnelList: function () {
    var that = this;
    var data = {
      source: "1",
      pig_farm: app.globalData.userInfo.pig_farm_id
    }
    request.request_get('/personnelManagement/getPersonnelList.hn', data, function (res) {
      if (res) {
        if (res.success) {

          let list = res.msg;
          for (let i = 0; i < list.length; i++) {
            list[i].isSelect = false;
          }
          that.setData({
            employeesList: list
          });

          if (that.data.employeesList.length == 0) {
            that.setData({
              isSearch: true
            });
          }

          if (that.data.lableidList.length > 0) {
            that.setlableidList(1);
          }
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
  //利用js进行模糊查询
  searchChangeHandle: function (e) {
    let that = this;
    this.setData({
      searchText: e.detail.value,
      page: 1
    });

    var value = e.detail.value;
    var channelList = that.data.employeesList;
    if (value == '' || value == null) {
      this.setData({
        searchText: '',
        page: 1,
        employeesList: [],
        isSearch: false
      });

      this.getPersonnelList();

    } else {
      var arr = [];
        for (var i = 0; i < channelList.length; i++) {
          if (channelList[i].name.indexOf(value) >= 0) {
            channelList[i].isSelect = false;
            arr.push(channelList[i]);
          }
        }
        console.log(arr);
        that.setData({
          employeesList: arr
        });

        if (that.data.employeesList.length == 0) {
          that.setData({
            isSearch: true
          });
        }

        if (that.data.lableidList.length > 0) {
          that.setlableidList(1);
        }
    }
  },
  // 输入框有文字时，点击X清除
  clearSearchHandle() {
    this.setData({
      searchText: '',
      page: 1,
      isSearch: false,
      employeesList: []
    });

    this.getPersonnelList();
  },
  clickSelectHandler(e) {

    let lableid = e.currentTarget.dataset.id;
    let lableidList = this.data.lableidList;
    if (lableid) {
      // if (this.data.selectPersionList.length < 5) {
        for (let i = 0; i < this.data.employeesList.length; i++) {
          if (lableid == this.data.employeesList[i].id) {
            if (this.data.employeesList[i].isSelect) {
              this.data.lableidList.splice(this.data.lableidList.findIndex(index => index == lableid), 1)
              this.data.employeesList[i].isSelect = false;
            } else {
              if (this.data.lableidList.length < 5) {
                lableidList.push(lableid);
                this.data.employeesList[i].isSelect = true;
              } else {
                box.showToast('设备管理员不能超过5个');
              }
            }
          }
        }

        this.setData({
          employeesList: this.data.employeesList,
          lableidList: lableidList,
        });

        let selectPersionList = []
        if (this.data.lableidList.length > 0) {
          if (this.data.employeesList.length > 0) {
            for (let i = 0; i < this.data.employeesList.length; i++) {

              for (let j = 0; j < this.data.lableidList.length; j++) {
                if (this.data.lableidList[j] == this.data.employeesList[i].id) {
                  selectPersionList.push(this.data.employeesList[i])
                  break;
                } else {}
              }
            }
          }
        }
        this.setData({
          selectPersionList: selectPersionList
        });

        if (selectPersionList.length > 0) {
          let managePersionList = [];
          let managePersionIds = [];
          for (let j = 0; j < this.data.selectPersionList.length; j++) {
            managePersionList.push(this.data.selectPersionList[j].name);
            managePersionIds.push(this.data.selectPersionList[j].id);
          }
          let pages = getCurrentPages();
          let prevPage = pages[pages.length - 2];
          prevPage.setData({
            managePersion: managePersionList.join(','),
            selectPersionList: selectPersionList,
            managePersionIds: managePersionIds.join(','),
          });
        }else{
          let pages = getCurrentPages();
          let prevPage = pages[pages.length - 2];
          prevPage.setData({
            managePersion: "",
            selectPersionList: [],
            managePersionIds: "",
          });
        }

      // } else {
      //   box.showToast('设备管理员不能超过5个');
      // }
    }
  },
  setlableidList(typestring) {

    let selectPersionList = []
    if (this.data.lableidList.length > 0) {
      if (this.data.employeesList.length > 0) {
        for (let i = 0; i < this.data.employeesList.length; i++) {

          for (let j = 0; j < this.data.lableidList.length; j++) {
            if (this.data.lableidList[j] == this.data.employeesList[i].id) {
              selectPersionList.push(this.data.employeesList[i])
              this.data.employeesList[i].isSelect = true;
              break;
            } else {
              this.data.employeesList[i].isSelect = false;
            }
          }
        }
      }
    }else{
      if (this.data.employeesList.length > 0) {
        for (let i = 0; i < this.data.employeesList.length; i++) {
          this.data.employeesList[i].isSelect = false;
        }
      }
    }

    this.setData({
      selectPersionList: selectPersionList,
      employeesList: this.data.employeesList
    });

    if(typestring == 2){
      if (selectPersionList.length > 0) {
        let managePersionList = [];
        let managePersionIds = [];
        for (let j = 0; j < this.data.selectPersionList.length; j++) {
          managePersionList.push(this.data.selectPersionList[j].name);
          managePersionIds.push(this.data.selectPersionList[j].id);
        }
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        prevPage.setData({
          managePersion: managePersionList.join(','),
          selectPersionList: selectPersionList,
          managePersionIds: managePersionIds.join(','),
        });
      }else{
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        prevPage.setData({
          managePersion: "",
          selectPersionList: [],
          managePersionIds: "",
        });
      }
    }

    console.log(this.data.employeesList)
  },
  clearClick(e){
    let lableid = e.currentTarget.dataset.id;
    if(lableid){
      this.data.lableidList.splice(this.data.lableidList.findIndex(index => index == lableid), 1);
      this.setlableidList(2);
    }
  }
});