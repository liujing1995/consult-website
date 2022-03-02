
layui.define(['layer'], function (exports) {
    var $ = layui.jquery;
    var layer = layui.layer;
    var config = layui.config;
    var obj = {
        dataformat:function (date) {
        if (date==null){
            return"";
        }else {
            var temp=new Date(date);
            var year=temp.getFullYear();
            var month=temp.getMonth()+1;
            var date=temp.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (date >= 0 && date <= 9) {
                date = "0" + date;
            }
            return year+"-"+month+"-"+date;
        }
    }



};
    exports('dataFormat', obj);
});