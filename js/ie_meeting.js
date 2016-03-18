/**
 *	Meeting List page
 */
$(function() {
	var API_ROOT = getGlobalPath('api');
	var DASHBOARD_ROOT = "https://corp.tutormeet.com/tutormeet";
	var MAGIC_KEY = '2747d4b501ba58';
	var MAGIC_KEY2 = '6ae212f2ab55e';

	var USER_INFO = {};

	$("#from-date").calendricalDate({usa:true});
	$("#to-date").calendricalDate({usa:true});

    var pageIndex = 0;        
    var pageSize = 10;

    initPagenation();

	$("#meetingid").keydown(function(event){
	    if(event.which == 13 || event.keyCode == 13){
	        joinMeeting($(this).val());
	    }
	});

	$('.filter-icon').click(function(){
	    $('.filter-meeting').toggle();
	});

	$('a.search').click(function(){
	    initPagenation();
	});

	$("input[name='searchfilter']").click(function(){
	    if($("input[name='searchfilter']:checked").val() == 'range'){
	        $("#from-date").removeAttr("disabled");
	        $("#to-date").removeAttr("disabled");
	    }else{
	        $("#from-date").attr("disabled","disabled");
	        $("#to-date").attr("disabled","disabled");
	    }
	});

	$('a.apply-filter').click(function(){        
	    initPagenation();
	    $('.filter-meeting').hide();
	    $('.no-meeting-content .no-meeting-text').text('No search result found');
	});

    function getMeetingList(pageIndex,succCallback, errCallback){       

        var jsonInput = {      
          action: 'searchMeetings',
          offset:pageIndex * pageSize,
          limit:pageSize,
          startDate:'',
          endDate:'',
          searchFilter:'',
          showAttachment:'',
          showQuiz:'',
          showSurvey:'',
          showNewTasks:'',
          hostBy: '0',
          search: ''
        }; 

        jsonInput.search = $("input[name='searchmeeting']").val();
        jsonInput.searchFilter = $("input[name='searchfilter']:checked").val();
        jsonInput.startDate = str2timespan($("#from-date").val());
        jsonInput.endDate = str2timespan($("#to-date").val());
        jsonInput.hostBy = $("input[name='hostby']:checked").val();
        jsonInput.showAttachment = $("input[name='showattachment']").is(":checked") ? "1" : "";
        jsonInput.showQuiz = $("input[name='showquiz']").is(":checked") ? "1" : "";
        jsonInput.showSurvey = $("input[name='showsurvey']").is(":checked") ? "1" : "";
        jsonInput.showNewTasks = $("input[name='shownewtasks']").is(":checked") ? "1" : "";

        $.ajax({
            type: "GET",
            //url: API_ROOT + '/corpmeeting.do?json='+ encodeURIComponent(JSON.stringify(jsonInput)),
            url: 'http://localhost:88/api/values?param=' + encodeURIComponent(JSON.stringify(jsonInput)),
            //url: 'http://192.168.8.89:67/api/values?json=1',
            success: function(data) {     
                data = JSON.parse(data);
                var returnCode = data.returnCode;                
                if (returnCode == 0) {
                    if(succCallback){
                        succCallback(data);
                    }
                } else {
                    alert("System error. Error code:" + returnCode);
                    if(errCallback){
                        errCallback(data);
                    }
                }
            },
            error: function(data) {                    
                console.log('fail');
            }
        });
    };

    function initMeetingListByData (data) {
        if(data.meetings.length <= 0){
            $(".no-meeting-content .calendar_bg").text((new Date()).getDate());
            $(".no-meeting-content").show();
        }else{
            $(".no-meeting-content").hide();
        }

        $(".meeting-list").find("ul").find("li").not("li.meeting-item-template").remove();

        for(var m in data.meetings){
            var subject     = data.meetings[m].subject;
            var meetingId   = data.meetings[m].meetingId;
            var userName    = data.meetings[m].userName;
            var startTime   = data.meetings[m].startTime;
            var meetingSn   = data.meetings[m].meetingSn;
            var description = data.meetings[m].description;

            var meetingTemplate = $("li.meeting-item-template").clone();
            meetingTemplate.show();
            meetingTemplate.removeClass("meeting-item-template");
            meetingTemplate.addClass("meeting-item");
            meetingTemplate.find(".small-view").show();
            meetingTemplate.find(".meeting-title h3").text(subject);
            meetingTemplate.find(".meeting-host span").eq(0).text('ID: '+meetingId);
            meetingTemplate.find(".meeting-host span").eq(1).text('H: '+userName);
            meetingTemplate.find(".meeting-time span").eq(0).text(timeStamp2DateString(startTime));
            meetingTemplate.find(".meeting-time span").eq(1).text(timeStamp2TimeString(startTime));               
            meetingTemplate.find("a.show-details").attr('data', meetingSn);
            meetingTemplate.find("a.show-details").attr('data-time', startTime);
            meetingTemplate.find("a.show-details").bind('click', showDetails);
            meetingTemplate.find("a.start-meeting").attr('data',meetingId);
            meetingTemplate.find("a.start-meeting").bind('click',function(){
                joinMeeting($(this).attr('data'));
            });
            
            //Details
            meetingTemplate.find(".view-details .details-id").text('ID: '+ meetingId);
            meetingTemplate.find(".view-details .details-time span").eq(0).text(timeStamp2DateString(startTime));
            meetingTemplate.find(".view-details .details-time span").eq(1).text(timeStamp2TimeString(startTime));
            meetingTemplate.find(".view-details .details-subject h3").text(subject);
            meetingTemplate.find(".view-details .details-des h4").text(description);

            meetingTemplate.find("a.close-details").bind('click',function(){
                $(this).parent().parent().parent(".view-details").hide();
                $(this).parent().parent().parent(".view-details").prev(".small-view").show();
            }); 

            $(".meeting-list").find("ul").append(meetingTemplate);
        }
    }

    //分页
    function initPagenation(){
        pageIndex = 0;
        getMeetingList(0,function(data){
            $("#Pagination").pagination(data.total, {
                callback: PageCallback,
                prev_text: "<",
                next_text: ">",    
                num_edge_entries: 2,
                num_display_entries: 8,
                items_per_page: pageSize,
                current_page:pageIndex
            }); 
        });
    }

    function PageCallback(index, jq) {
        getMeetingList(index,function (data) {
             initMeetingListByData(data);
        });
        
    };

	//Page function
	function joinMeeting(meetingId){
	    var jsonInput = { action:"joinMeeting", meetingId:meetingId };
	    $.ajax({
	        type: "GET",
	        //url: API_ROOT + '/corpmeeting.do?json='+ encodeURIComponent(JSON.stringify(jsonInput)),
	        url: 'http://localhost:88/api/values?param=' + encodeURIComponent(JSON.stringify(jsonInput)),
	        success: function(data) {     
	            data = JSON.parse(data);
	            var returnCode = data.returnCode;
	            if (returnCode == 0) {
	                var paddingX = 5;
	                var paddingY = 50;
	                var winWidth = screen.width - 2 * paddingX;
	                var winHeight = screen.height - paddingY;

	                var dashboardUri = DASHBOARD_ROOT + '/tutormeet.html?data=';
	                var dashboardParam = 'width='+winWidth +', height='+winHeight + ',top=0,left=' + paddingX + ',toolbar=no,menubar=no,scrollbars=yes,resizable=yes,status=no';

	                var dashboardWin = window.open(dashboardUri + data.meetingUri,
	                    "TutorMeet_Enterprise", dashboardParam);
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
	};

	// show meetingList details
	function showDetails(){
        $(this).parent().parent(".small-view").hide();
        $(this).parent().parent(".small-view").next(".view-details").show();

        //get Meeting Invitees
        // 获取data.meetings[m].meetingSn
        var meetingSn = $(this).attr('data');
        // 获取data.meetings[m].startTime
        var startTime = $(this).attr('data-time');

        // 判断是否显示DELETE MEETING按钮
        if(new Date().getTime() < parseInt(startTime)){
           $(this).parent().parent(".small-view").next(".view-details").find(".details-btn").show();
           $(this).parent().parent(".small-view").next(".view-details").find(".delete-btn").attr('data',meetingSn);
           // DELETE MEETING button
           $(this).parent().parent(".small-view").next(".view-details").find(".delete-btn").click(function(){
                var meetingSn = $(this).attr('data');
                $(this).parent(".details-btn").next(".masklay").show();
                $(this).parent(".details-btn").next().next(".overlay").show();
                $(this).parent(".details-btn").next().next(".overlay").children('.yes-btn').attr('data', meetingSn);

                // close overlay---no-btn
                $(this).parent(".details-btn").next().next(".overlay").children(".lay-close").click(function(){
                    $(this).parent(".overlay").hide();
                    $(this).parent(".overlay").prev(".masklay").hide();
                });

                $(this).parent(".details-btn").next().next(".overlay").children(".no-btn").click(function(){
                    $(this).parent(".overlay").hide();
                    $(this).parent(".overlay").prev(".masklay").hide();
                });

                // delete meetinglist---yes-btn
                $(this).parent(".details-btn").next().next(".overlay").children('.yes-btn').click(function(){
                    var meetingSn = $(this).attr('data');
                    $(this).parent(".overlay").hide();
                    $(this).parent(".overlay").prev(".masklay").hide();

                    cancelMeeting(meetingSn);
                });
           });

        }
        else{
            $(this).parent().parent(".small-view").next(".view-details").find(".details-btn").hide();
        }  

        // 获取email
        var parentDiv = $(this).parent().parent(".small-view").next(".view-details").find(".invitees");
        parentDiv.html('');
        getMeetingInvitees(meetingSn, parentDiv,function(invitees){
            for(var e in invitees.emails){
                parentDiv.append('<h4>' + invitees.emails[e] + '</h4>');
            }                                    
        });
        //get Meeting Translators
        // 获取翻译人员的email
        var parentDivTrans = $(this).parent().parent(".small-view").next(".view-details").find(".translator-list");
        parentDivTrans.html('');
        getMeetingTranslators(meetingSn, parentDivTrans, function(translators){
            for(var e in translators.translatorList){
                var $translator = $("<div></div>");
                $translator.append('<span style="color:#999;">' + translators.translatorList[e].lang + ':</span><br/>');
                $translator.append('<h4>' + translators.translatorList[e].email + '</h4>');
                parentDivTrans.append($translator);
            }
        });

    };

    //删除列表
    function cancelMeeting(meetingSn) {
        var jsonInput = {action:'cancelMeeting', meetingSn:meetingSn};
        // console.log(jsonInput);return;
        $.ajax({
            type: "GET",
            //url: API_ROOT + '/corpmeeting.do?json='+ encodeURIComponent(JSON.stringify(jsonInput)),
            url: 'http://localhost:88/api/values?param=' + encodeURIComponent(JSON.stringify(jsonInput)),
            //url: 'http://192.168.8.89:67/api/values?json=1',
            success: function(data) {
                data = JSON.parse(data);
                var returnCode = data.returnCode;
                if(returnCode == 0) {
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
    };

    // 获取email
    function getMeetingInvitees(meetingSn, parentDiv, callback){
        var jsonInput = { action:"getMeetingInvitees", meetingSn:meetingSn };
        $.ajax({
            type: "GET",
            //url: API_ROOT + '/corpmeeting.do?json='+ encodeURIComponent(JSON.stringify(jsonInput)),
            url: 'http://localhost:88/api/values?param=' + encodeURIComponent(JSON.stringify(jsonInput)),
            success: function(data) {     
                data = JSON.parse(data);
                var returnCode = data.returnCode;
                if (returnCode == 0) {
                    callback(data);
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
    };

     // 获取翻译员email
    function getMeetingTranslators(meetingSn,parentDiv, callback){
        var jsonInput = { action:"getMeetingTranslators", meetingSn:meetingSn };
        $.ajax({
            type: "GET",
            //url: API_ROOT + '/corpmeeting.do?json='+ encodeURIComponent(JSON.stringify(jsonInput)),
            url: 'http://localhost:88/api/values?param=' + encodeURIComponent(JSON.stringify(jsonInput)),
            success: function(data) {     
                data = JSON.parse(data);
                var returnCode = data.returnCode;
                if (returnCode == 0) {
                    callback(data);
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
    };

});