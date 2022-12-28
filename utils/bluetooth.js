
/* 
*  蓝牙输入，蓝牙设置参考/pages/bluetooth/index.js
*  author cuiyf
*  date 2020-11-20
*/

function get_device_value(info,rollbackFunc){
    startNotice(info,rollbackFunc);
}

// 开启通知监听
function startNotice(info,rollbackFunc){
    wx.notifyBLECharacteristicValueChange({
        state: true, // 启用 notify 功能
        deviceId: info.deviceId,    // 这里的 deviceId 需要已经通过 createBLEConnection 与对应设备建立链接 
        serviceId: info.serviceId, // 这里的 serviceId 需要在上面的 getBLEDeviceServices 接口中获取
        characteristicId: info.characteristicId, //开启监听 notityid // 这里的 characteristicId 需要在上面的 getBLEDeviceCharacteristics 接口中获取
        success: function (res) {
            // 设备返回的方法
            wx.onBLECharacteristicValueChange(function (res) {
                // 此时可以拿到蓝牙设备返回来的数据是一个ArrayBuffer类型数据，
                //所以需要通过一个方法转换成字符串
                var a = bluetoothUint8ArrayToString(new Uint8Array(res.value));
                console.log("我是从蓝牙设备上获取的值：" + a)
                rollbackFunc(a);
            })
        }
    })
}

function bluetoothUint8ArrayToString(fileData){
    var dataString = "";
    for (var i = 0; i < fileData.length; i++) {
        dataString += String.fromCharCode(fileData[i]);
    }
    return dataString.replace(/[^0-9]/g, '');
}

module.exports = {
    get_device_value: get_device_value,
}