// 查看手机号是否正确
function checkPhone(phone) {
    var phoneReg = /^(((13[0-9]{1})|(15[0-9]{1})|(14[0-9]{1})|(19[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (phone.length != 11) {
        return false
    } else if (!phoneReg.test(phone)) {
        return false
    } else {
        return true
    }
}

// list1 是否有元素存在 list2
function list1_inexistence_list2(list1, list2){
    var flag = false;
    for(var i = 0; i < list1.length; i++){
        var item = list1[i];
        if(list2.indexOf(item) > -1){
            flag = true;
            break;
        }
    }
    return flag;
}

// 元素是否存在数组中
function isInArray(value,arr){
    for(var i = 0; i < arr.length; i++){
        if(value == arr[i]){
            return true;
        }
    }
    return false;
}

// 判断 JSONArray是否存在摸个元素
function exist_arr(arr, self_value, self_item){
    var flag = false;
    arr.forEach(item=>{
        if(item[self_value]==self_item){
            flag = true;
        }
    })
    return flag
}

module.exports = {
    checkPhone: checkPhone,
    list1_inexistence_list2:list1_inexistence_list2,
    isInArray:isInArray,
    exist_arr:exist_arr
}
