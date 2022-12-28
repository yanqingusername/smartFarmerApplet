/* 
*  face++ js
*  author cuiyf
*  date 2020-10-30
*/

// 人脸判断-是否为一张人脸
// src 图片地址 that 小程序this  need_data 回滚函数需要的数据
function face_judgment(src, callback, need_data){
    wx.getImageInfo({
        src: src,
        success: res => {
            var pic_width = res.width;
            var pic_height = res.height;
            // 限制上传图片的信息，eg宽高比
            console.log("宽度：" + pic_width);
            console.log("高度：" + pic_height);
            // 将临时路径转换为base64
            var FSM = wx.getFileSystemManager();
            FSM.readFile({
                filePath: src,
                encoding: "base64",
                success: function(res) {
                    var base64 = res.data;
                    // face++ 获取图片人脸数据
                    var face_data = {
                        api_key: api_key,
                        api_secret: api_secret,
                        image_base64: base64,
                        return_landmark: 1, // 0不检测 1(83关键点) 2检测(106关键点)
                    }

                    _face_post(face_data, function (res) {
                        console.info('回调', res);
                        if(res){
                            if(res.statusCode == "200"){
                                var face_info = res.data;
                                console.log(face_info);
                                if(face_info.face_num == 1){
                                    var result = {"success":true, "msg": src};
                                }else if(face_info.face_num > 1){
                                    var result = {"success":false, "msg": "请上传单人照片"};
                                }else if(face_info.face_num == 0){
                                    var result = {"success":false, "msg": "请上传人脸照片"};
                                }
                                callback(result, need_data);
                            }else{
                                console.log(res.data.error_message);
                                var result = {"success":false, "msg": "照片分析失败，请重试"};
                                callback(result, need_data);
                            }
                        }
                    })
                },
                fail: fail => {
                    console.log(fail);
                    var result = {"success":false, "msg": "照片文件读取失败"};
                    callback(result, need_data);
                }
            })
        },
        fail: fail => {
            console.log(fail);
            var result = {"success":false, "msg": "照片信息错误"};
            callback(result, need_data);
        }
    })
}


// 调用face++
var api_key = 'uV91Apq1bPVCVVFABxlRju4l3NIublJP';
var api_secret = '-lwufDE3mdhR7J2FKLrevRXxEMLSKHPG';
function _face_post(data, cb) {
  	var url = 'https://api-cn.faceplusplus.com/facepp/v3/detect';
	var form_data = _setFormData(data);
	wx.request({
		url: url,
		header: {'content-type':'multipart/form-data; boundary=XXX'},
		data: form_data,
		method: 'POST',
		success: function (res) {
			return typeof cb == "function" && cb(res)
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

// 设置 FormData 因小程序 request不能使用formatdata
function _setFormData (dic) {
	var form_data_str = "";
		for (var i in dic){
			form_data_str += 
				'\r\n--XXX' +
				'\r\nContent-Disposition: form-data; name="' + i + '"' +
				'\r\n' +
				'\r\n'+ dic[i];
		}
	form_data_str += "\r\n--XXX--";
	return form_data_str;
}

module.exports = {
    face_judgment: face_judgment
}