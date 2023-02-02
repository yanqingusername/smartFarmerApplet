/* 
*  网络请求js
*  author cuiyf
*  date 2020-10-28
*/

// 参数配置
//var apiurl = 'http://localhost:8080/wisdomLivestock'     // 本地测试
//var apiurl = 'http://dev6.coyotebio-lab.com//wisdomLivestock'   // 测试服务器
var apiurl = 'https://www.prohealth-wch.com:8443/wisdomLivestock'    //正式服务器

// 常用request get封装-异步
function request_get(controller, data, cb) {
    var url = apiurl + controller;
    wx.request({
        url: url,
        data: data,
        method: 'GET',
        success: function (res) {
            return typeof cb == "function" && cb(res.data)
        },
        fail: function (res) {
            console.log('request networkTimeout')
            wx.showModal({
                title: "提示",
                showCancel: false,
                content: '请求超时,请检查网络！'
            })
            return typeof cb == "function" && cb(false)
        }
    })
}

// 文件上传
function upload_file(controller, file, name, data, cb) {
    var url = apiurl + controller;
    // 对data中的数据进行encodeURI处理
    for(var a in data){
        data[a] = encodeURI(data[a]);
    }
    wx.uploadFile({
        url: url,
        filePath: file,
        name: name,
        formData: data,
        header:{"chartset":"utf-8"},
        success: function (res) {
            var data = JSON.parse(res.data)
            return typeof cb == "function" && cb(data)
        },
        fail: function (res) {
            wx.showModal({
                title: "提示",
                showCancel: false,
                content: '请求超时,请检查网络！',
                success: function () {
                    console.log('request networkTimeout')
                }
            })
            return typeof cb == "function" && cb(false)
        }
    })
}


/**
 * 新增
 */
var apiurl1 = 'http://syrdev.coyotebio-lab.com:8080/IntelligentCreature'   // 测试服务器

// 常用request get封装-异步
function request_get1(controller, data, cb) {
    var url = apiurl1 + controller;
    wx.request({
        url: url,
        data: data,
        method: 'GET',
        success: function (res) {
            return typeof cb == "function" && cb(res.data)
        },
        fail: function (res) {
            console.log('request networkTimeout')
            wx.showModal({
                title: "提示",
                showCancel: false,
                content: '请求超时,请检查网络！'
            })
            return typeof cb == "function" && cb(false)
        }
    })
}

module.exports = {
    request_get:request_get,
    upload_file:upload_file,
    request_get1:request_get1,
}