/* ========================
*  Function
*  ======================== */


function timeStamp2DateString(time){

    var datetime = new Date();
    datetime.setTime(time);
    var year = datetime.getFullYear();
    var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
    var date = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
    var hour = datetime.getHours()< 10 ? "0" + datetime.getHours() : datetime.getHours();
    var minute = datetime.getMinutes()< 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
    var second = datetime.getSeconds()< 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();
    return year + "-" + month + "-" + date;
    //return moment(datetime).format("YYYY-MM-DD HH:mm Z");
}
function timeStamp2TimeString(time){
    var datetime = new Date();
    datetime.setTime(time);
    var year = datetime.getFullYear();
    var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
    var date = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
    var hour = datetime.getHours()< 10 ? "0" + datetime.getHours() : datetime.getHours();
    var minute = datetime.getMinutes()< 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
    var second = datetime.getSeconds()< 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();
    return hour+":"+minute;
}
function str2timespan(stringTime){
    // 获取某个时间格式的时间戳
    var timestamp2 = Date.parse(new Date(stringTime));
    timestamp2 = timestamp2 / 1000;
    return timestamp2;
}
// 格式化时间
function formatTime(hour, minute)
{
    var printHour = hour % 12;
    //if (printHour == 0) printHour = 12;
    var printMinute = minute;
    if (minute < 10) printMinute = '0' + minute;
    var half = (hour < 12 && hour >= 0) ? ' am' : ' pm';
    if(hour==12) printHour="12";
    return printHour + ':' + printMinute + half;
}