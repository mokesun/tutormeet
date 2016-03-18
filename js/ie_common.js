/**
 * 	common.js
 */
$(function() {
	setCookie("username", "wei lin", 2);
	var username = getCookie("username");
	$(".user_name").empty().append(unescape(username));

	$(".setting-btn").click(function(){
	    $(".settings-navigation").show();
	});

	$(".close-settings").click(function(){
	    $(".settings-navigation").hide();
	});
});

//set cookies
function setCookie(c_name, value, expiredays){
 　　　　var exdate=new Date();
　　　　exdate.setDate(exdate.getDate() + expiredays);
　　　　document.cookie=c_name+ "=" + escape(value) + ((expiredays==null) ? "" : ";expires="+exdate.toGMTString());
}
 
//get cookies
function getCookie(name)
{
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
 
    if(arr=document.cookie.match(reg))
 
        return (arr[2]);
    else
        return null;
}

//remove cookies
function delCookie(name)
{
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    var cval=getCookie(name);
    if(cval!=null)
        document.cookie= name + "="+cval+";expires="+exp.toGMTString();
}
