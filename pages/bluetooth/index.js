const app = getApp()
const box = require('../../utils/box.js')

Page({
	data: {
		devices_list:[], // 搜索可连接设备列表
		deviceId: ''
 	},
	
	onLoad:function () {
		//iOS 微信客户端 6.5.6 版本开始支持，Android 6.5.7 版本开始支持
		//由于系统限制，Android 上获取到的 deviceId 为设备 MAC 地址，iOS 上则为设备 uuid。因此 deviceId 不能硬编码到代码中
		console.log("进入蓝牙连接页面")
		this.init_Bluetooth(); // 初始化蓝牙模块

		var bluetoothStatus = app.globalData.bluetoothStatus;
        var bluetoothInfo = app.globalData.bluetoothInfo;
        if(bluetoothStatus){
			this.setData({
				deviceId: bluetoothInfo.deviceId
			});
        } 
	},

	// 初始化蓝牙模块
	init_Bluetooth:function(){
		var that = this;
		wx.openBluetoothAdapter({
			mode: 'central', // 主从模式，ios需要。central主机模式
		  	success() {
				console.log("蓝牙模块初始化成功");
				that.search_equipment(); // 搜索设备
			},
		  	fail(res) {
				console.log("蓝牙模块初始化失败:");
				console.log(res);
				box.showToast("开启蓝牙失败，请检查蓝牙是否打开!");
		  	}
		})
	},

	// 搜索设备
	search_equipment:function(){
		var that = this;
		console.log("开始搜索设备");
        wx.startBluetoothDevicesDiscovery({
			allowDuplicatesKey: false, // 是否允许重复上报同一设备。
			interval: 0, // 上报设备的间隔。0 表示找到新设备立即上报
			success(res) {
				console.log("设备成功开启搜索功能");
				console.log(res);

				//获取在蓝牙模块生效期间所有已发现的蓝牙设备。包括已经和本机处于连接状态的设备。  
				wx.onBluetoothDeviceFound(function (info) {
					var devices_info = info.devices[0];
					//console.log("获取到的设备信息:");
					//console.log(devices_info);
					that.deal_devices_info(devices_info);
				})
			},
			fail(res) {
				console.log("搜索设备失败:");
				console.log(res);
				box.showToast("搜索设备失败，请重试!");
		  	}
		})
	},

	// 处理获取的设备信息
	deal_devices_info:function(info){
		var that = this;
		var name = info.name;
		var deviceId = info.deviceId;
		var devices_list = that.data.devices_list;
		if(name != ""){ // 不带名称的设备过滤
			var data = {
				"name": name,
				"deviceId":deviceId,
			}
			console.log("能够连接的设备");
			console.log(data);
			devices_list.push(data);
			that.setData({devices_list:devices_list})
		}
	},

	// 蓝牙设备连接
	bluetoothConnection:function(e){
		var that = this;
		var deviceId = e.currentTarget.dataset.id;
		var name = e.currentTarget.dataset.name;
		console.log("要连接蓝牙设备deviceId" + deviceId);
		console.log("要连接蓝牙设备name" + name);
		wx.showModal({
			title: '连接蓝牙设备',
			content: '是否连接' + name,
			showCancel: true,
			cancelText:"否",
			confirmText:"是",
			success: function (res) {
			   	if (res.cancel) {
					//点击取消,默认隐藏弹框
			   	} else {
					// 开始连接蓝牙设备
					console.log("开始蓝牙连接")
					that.connetBlue(deviceId);
			   }
			}
		})
	},

	// 开始连接蓝牙设备
	connetBlue:function(deviceId){
		var that = this;
		wx.createBLEConnection({
			deviceId: deviceId,// 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
			success: function () {
				console.log("连接蓝牙成功!")
				wx.showToast("蓝牙连接成功");
				that.getServiceId(deviceId);

				that.setData({
					deviceId: deviceId
				});
			},
			fail(res) {
				console.log("连接蓝牙失败:");
				console.log(res);
				box.showToast("蓝牙设备连接失败，请重试!");
		  	}
		})
	},

	onHide:function () { 
		// 页面隐藏，关闭蓝牙搜索功能
		wx.stopBluetoothDevicesDiscovery({
			success: function (res) {
				console.log('连接蓝牙成功之后关闭蓝牙搜索');
			}
		})
	},

	// 获取蓝牙设备所有服务(service)。
	getServiceId(deviceId) {
		var that = this
		wx.getBLEDeviceServices({
			deviceId: deviceId, // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
			success: function (res) {
				var model = res.services[0];
				var serviceId = model.uuid;
				that.getCharacteId(deviceId, serviceId);     	
			},
			fail(res) {
				console.log("获取蓝牙设备服务失败:");
				console.log(res);
				box.showToast("获取蓝牙设备服务失败，请重试!");
		  	}
		})
	},

	// 获取蓝牙设备某个服务中所有特征值(characteristic)。
	getCharacteId(deviceId, serviceId) {
		var that = this
		wx.getBLEDeviceCharacteristics({
			deviceId: deviceId, // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接
			serviceId: serviceId, // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
			success: function (res) {

				var characteristics = res.characteristics; // [uuid, properties]
				console.log(characteristics)
				var uuid = characteristics[0].uuid;
				var properties = characteristics[0].properties;

				var notify = properties.notify; // 同来接收数据
				if(!notify){
					wx.showModal({
						title: '提示',
						content: '此蓝牙设备不支持数据读取',
						showCancel: false,
						success: function (res) {
						}
					})
				}

				var data = {
					characteristicId:uuid,
					deviceId:deviceId,
					serviceId:serviceId
				}

				app.globalData.bluetoothInfo = data;
				app.globalData.bluetoothStatus = true;
			}
		})
	}
})