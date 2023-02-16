const app = getApp();

Page({

    onLoad:function(){
        console.log("进入操作");
        var applet_permissions_list = app.globalData.userInfo.applet_permissions_list;
        console.log("权限信息:" + applet_permissions_list);
        this.setData({applet_permissions_list:applet_permissions_list});
    },
    
    //人员管理
    enter_personnel_permissions:function(){
        wx.navigateTo({
            url: '/pages/personal/management',
        })
    },
    enter_personnel_records:function(){
        wx.navigateTo({
            url: '/pages/personal/record',
        })
    },
    enter_admission_application:function(){
        wx.navigateTo({
            url: '/pages/personal/admission_application',
        })
    },
    // 车辆管理
    enter_car_permissions:function(){
        wx.navigateTo({
            url: '/pages/car/management',
        })
    },
    enter_car_records:function(){
        wx.navigateTo({
            url: '/pages/car/record',
        })
    },
    enter_driver_register:function(){
        wx.navigateTo({
            url: '/pages/car/register',
        })
    },
    enter_driver_records:function(){
        wx.navigateTo({
            url: '/pages/car/record_decontamination',
        })
    },

    // 物品管理
    enter_goods_register:function(){
        wx.navigateTo({
            url: '/pages/goods/register',
        })
    },
    enter_goods_records:function(){
        wx.navigateTo({
            url: '/pages/goods/record',
        })
    },

    //*******猪只操作******************
    enter_operation_pig_show:function(){
        // wx.navigateTo({
        //     url: '/pages/pigOperation/farm',
        // })

        //猪只历史记录及统计报表
        wx.navigateTo({
            url: '/modulepages/pages/pigAbnormalModuleHistoryList/index',
        })
    },
    enter_operation_pig_lairage:function(){
        wx.navigateTo({
            url: '/pages/pigOperation/lairage',
        })
    },
    enter_operation_pig_jump:function(){
         wx.navigateTo({
            url: '/pages/pigOperation/jump',
        })
    },
    enter_operation_pig_such:function(){
        wx.navigateTo({
            url: '/pages/pigOperation/such',
        })
    },
    enter_operation_pig_log:function(){
        wx.navigateTo({
            url: '/pages/pigOperation/log',
        })
    },
    enter_operation_pig_remarks:function(){
        wx.navigateTo({
            url: '/pages/pigOperation/remarks',
        })
    },
    enter_operation_vaccine:function(){
        wx.navigateTo({
            url: '/pages/pigOperation/vaccine',
        })
    },
    enter_operation_pathogen:function(){
        wx.navigateTo({
            url: '/pages/pigOperation/pathogen',
        })
    },
    enter_operation_piggery_sty:function(){
        wx.navigateTo({
            url: '/pages/pigOperation/piggery_sty_operation',
        });
    },

    enter_bluetooth:function(){
        wx.navigateTo({
            url: '/pages/bluetooth/index',
        });
    },
    clickPigAbnormalModuleManage:function(){

        //猪只管理
        wx.navigateTo({
            url: '/modulepages/pages/pigAbnormalModuleManage/index',
        });
    },
    clickPigAbnormalModuleEarmarkBinding:function(){

        //耳标绑定
        wx.navigateTo({
            url: '/modulepages/pages/pigAbnormalModuleEarmarkBinding/index',
        });
    },
    clickPigDoorDormManage:function(){
        //猪舍档案管理
        wx.navigateTo({
            url: '/modulepages/pages/pigDoorDormManage/index',
        });
    },
    clickPigIndividualFilesManage:function(){
        //猪舍个体档案管理
        wx.navigateTo({
            url: '/modulepages/pages/pigIndividualFilesManage/index',
        });
    },

    
});