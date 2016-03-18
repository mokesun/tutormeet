/**
 * 	launch meeting page and Schdule meeting page
 */
$(function() {
	var API_ROOT = getGlobalPath('api');
	var DASHBOARD_ROOT = "https://corp.tutormeet.com/tutormeet";
	var MAGIC_KEY = '2747d4b501ba58';
	var MAGIC_KEY2 = '6ae212f2ab55e';

	var USER_INFO = {};

	//Region: Common - Launch Meeting page and Schdule meeting page
	$("#select-server").click(function(){
	    $(".server-list").toggle();
	});

	$(".add-trans").click(function(){
	    var item = $(".invite-list .item-template").clone();   
	    item.find("input").removeAttr("disabled");   
	    item.removeClass("item-template").addClass("translator-item");
	    item.find(".action-box").html("");
	    item.find(".action-box").append("<a class='delete-trans'><img src=\"./img/jian.jpg\" width=\"25\" height=\"25\" /></a>");      
	    $(".invite-list .item-template").before(item);
	    $(".delete-trans").bind("click",deleteTrans);
	});

	function deleteTrans(){            
	    $(this).parent().parent(".trans-item").remove();
	}
	//Endregion: Common - Launch Meeting page and Schdule meeting page
	//Launch Meeting page
	var $meetingSubject = $(".meeting-subject");
	var $meetingDesc = $(".meeting-desc");
	var $meetingType = $(".meeting-type");
	var $meetingAddress = $(".invite-address");
	var $turnOnMeeting = $(".turn-on-meeting");
	var $serverLocation = $(".server-location");

	$("a.launch-now").click(function(){
	    if($meetingSubject.val() == ''){
	        alert("Please enter your meeting subject! ");
	        return;
	    }

	    var jsonInput = {      
	      action: 'createMeeting',          
	      emailList:[],
	      translatorList:[],
	      meetingType: $meetingType.val(),
	      recording: $turnOnMeeting.is(":checked"),
	      location: $serverLocation.val(),
	      subject:$meetingSubject.val(),
	      description: $meetingDesc.val()
	    };            

	    var emailList = $meetingAddress.val().split(',');
	    if($meetingAddress.val().indexOf(',')){
	        emailList = $meetingAddress.val().split(',');
	    }
	    if($meetingAddress.val().indexOf(';')){
	        emailList = $meetingAddress.val().split(';');
	    }
	    if($meetingAddress.val().indexOf('|')){
	        emailList = $meetingAddress.val().split('|');
	    }

	    for(var email in emailList){
	        jsonInput.emailList.push(email);
	    }
	    $(".invite-list .translator-item").each(function(){
	        var translator = {};
	        translator.email = $(this).find(".trans-email").val();
	        translator.lang = $(this).find(".trans-lang").val();
	        jsonInput.translatorList.push(translator);   
	    });  

	    var paddingX = 5;
	    var paddingY = 50;
	    var winWidth = screen.width - 2 * paddingX;
	    var winHeight = screen.height - paddingY;
	    var dashboardUri = DASHBOARD_ROOT + '/tutormeet.html?data=';
	    var dashboardParam = 'width='+winWidth +', height='+winHeight + ',top=0,left=' + paddingX + ',toolbar=no,menubar=no,scrollbars=yes,resizable=yes,status=no';

	    $.ajax({
	        type: "GET",
	        //url: API_ROOT + '/corpmeeting.do?json='+encodeURIComponent(JSON.stringify(jsonInput)),
	        url: 'http://localhost:88/api/values?param='+encodeURIComponent(JSON.stringify(jsonInput)),
	        success: function(data) {      
	            data = JSON.parse(data);        
	            var returnCode = data.returnCode;
	            if (returnCode == 0) {
	                var meetingUri = data.meetingUri;
	                var dashboardWin = window.open(dashboardUri + meetingUri,
	                    "TutorMeet_Enterprise", dashboardParam);
	                window.opener = top;
	                location.href = "ie_meeting.html";
	            } else {
	                // show error
	                if (returnCode == -3) {
	                    alert(data.message);
	                } else if (returnCode == -4) {
	                    alert("The meeting ID is invalid. Please check your record");
	                } else {
	                    alert("System error. Error code:" + returnCode);
	                }
	            }
	        },
	        error: function(data) {                    
	            console.log('fail');
	        }
	    });
	});

	//Schdule meeting page
	var $meetingSubject = $(".meeting-subject");
	var $meetingDesc = $(".meeting-desc");
	var $meetingType = $(".meeting-type");
	var $meetingAddress = $(".invite-address");
	var $turnOnMeeting = $(".turn-on-meeting");
	var $serverLocation = $(".server-location");
	var $schStartDate = $(".sch-start-date");
	var $schStartTime = $(".sch-start-time");
	var $schDuration = $(".sch-duration");
	var $selectTimezone = $(".select-timezone");

	initSchMeeting();

	function initSchMeeting(){
	    var now = new Date();
	    $schStartDate.val((now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear());
	    $schStartTime.val(formatTime(now.getHours(),now.getMinutes()));
	    $schDuration.val(60);
	    $selectTimezone.val(USER_INFO.timeZone);

	    $("#sch-start-date").calendricalDate({usa:true});
	    $("#sch-start-time").calendricalTime();

	    $('.no-meeting-content .no-meeting-text').text('You have not scheduled any meetings');
	};

	$("a.schedule-meeting-btn").click(function(){
	    if($meetingSubject.val() == ''){
	        alert("Please enter your meeting subject! ");
	        return;
	    }

	    var jsonInput = {      
	      action: 'scheduleMeeting',          
	      emailList:[],
	      translatorList:[],
	      meetingType: $meetingType.val(),
	      recording: $turnOnMeeting.is(":checked"),
	      location: $serverLocation.val(),
	      subject:$meetingSubject.val(),
	      description: $meetingDesc.val(),
	      startTime: str2timespan($schStartDate.val() + ' ' + $schStartTime.val()),
	      length: $schDuration.val(),
	      timeZone: $selectTimezone.find('option:selected').eq(0).val()
	    };            

	    var emailList = $meetingAddress.val().split(',');
	    if($meetingAddress.val().indexOf(',')){
	        emailList = $meetingAddress.val().split(',');
	    }
	    if($meetingAddress.val().indexOf(';')){
	        emailList = $meetingAddress.val().split(';');
	    }
	    if($meetingAddress.val().indexOf('|')){
	        emailList = $meetingAddress.val().split('|');
	    }

	    for(var email in emailList){
	        jsonInput.emailList.push(email);
	    }
	    $(".invite-list .translator-item").each(function(){
	        var translator = {};
	        translator.email = $(this).find(".trans-email").val();
	        translator.lang = $(this).find(".trans-lang").val();
	        jsonInput.translatorList.push(translator);   
	    });   
	    

	    $.ajax({
	        type: "GET",
	        //url: API_ROOT + '/corpmeeting.do?json='+ encodeURIComponent(JSON.stringify(jsonInput)),
	        url: 'http://localhost:88/api/values?param='+encodeURIComponent(JSON.stringify(jsonInput)),
	        success: function(data) {      
	            data = JSON.parse(data);        
	            var returnCode = data.returnCode;
	            if (returnCode == 0) {
	                location.href = "ie_meeting.html";
	            } else {
	                // show error
	                if (returnCode == -3) {
	                    alert(data.message);
	                } else if (returnCode == -4) {
	                    alert(data.message);
	                } else {
	                    alert("System error. Error code:" + returnCode);
	                }
	            }
	        },
	        error: function(data) {
	            
	            console.log('fail');
	        }
	    });

	});

	$(".reset-launch-form").click(function(){
	    $meetingSubject.val('');
	    $meetingDesc.val('');
	    $meetingAddress.val('');
	    $("input[name='meeting-type'][value='6']").attr('checked','checked');
	    $("input[name='meeting-type'][value='33']").removeAttr('checked');
	    $turnOnMeeting.removeAttr('checked');
	    $('#select-server').removeAttr('checked');
	    $("input[name='server-location']").removeAttr('checked');
	    $("input[name='server-location'][value='Default']").attr('checked','checked');
	    $(".translator-item").remove();
	});

	$(".reset-sch-form").click(function(){
	    $meetingSubject.val('');
	    $meetingDesc.val('');
	    $meetingAddress.val('');
	    $("input[name='meeting-type'][value='6']").attr('checked','checked');
	    $("input[name='meeting-type'][value='33']").removeAttr('checked');
	    $turnOnMeeting.removeAttr('checked');
	    $('#select-server').removeAttr('checked');
	    $("input[name='server-location']").removeAttr('checked');
	    $("input[name='server-location'][value='Default']").attr('checked','checked');
	    $(".translator-item").remove();
	    var now = new Date();
	    $schStartDate.val((now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear());
	    $schStartTime.val(formatTime(now.getHours(),now.getMinutes()));
	    $schDuration.val(60);
	    $selectTimezone.val(USER_INFO.timeZone);
	});
});

