/* ===========================
 * jQuery No Conflict
 * ==========================*/

window.console = window.console || (function(){

    var c = {}; c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function(){};
    return c;
})();


(function($) {

    $(document).ready(function() {
        
        var API_ROOT = getGlobalPath('api');
        var DASHBOARD_ROOT = "https://corp.tutormeet.com/tutormeet";
        var MAGIC_KEY = '2747d4b501ba58';
        var MAGIC_KEY2 = '6ae212f2ab55e';

        var USER_INFO = {};

        //Meeting List page
        //日历控件
        $("#from-date").calendricalDate({usa:true});

        $("#to-date").calendricalDate({usa:true});

        initMeetingList();

        $("#meetingid").keydown(function(event){
            if(event.which == 13 || event.keyCode == 13){
                joinMeeting($(this).val());
            }
        });

        $(".setting-btn").click(function(){
            $(".settings-navigation").show();
        });

        $(".close-settings").click(function(){
            $(".settings-navigation").hide();
        });

        $('.filter-icon').click(function(){
            $('.filter-meeting').toggle();
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
            initMeetingList();
            $('.filter-meeting').hide();
            $('.no-meeting-content .no-meeting-text').text('No search result found');
        });

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

        $('a.search').click(function(){
            initMeetingList();
        });
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
        function initMeetingList(){       

            var jsonInput = {      
              action: 'searchMeetings',
              offset:0,
              limit:10,
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
                        if(data.meetings.length <= 0){
                            $(".no-meeting-content .calendar_bg").text((new Date()).getDate());
                            $(".no-meeting-content").show();
                        }else{
                            $(".no-meeting-content").hide();
                        }
                        $(".meeting-list").find("ul").find("li").not("li.meeting-item-template").remove();
                        for(var m in data.meetings){
                            var meetingTemplate = $("li.meeting-item-template").clone();
                            meetingTemplate.show();
                            meetingTemplate.removeClass("meeting-item-template");
                            meetingTemplate.addClass("meeting-item");
                            meetingTemplate.find(".small-view").show();
                            meetingTemplate.find(".meeting-title h3").text(data.meetings[m].subject);
                            meetingTemplate.find(".meeting-host span").eq(0).text('ID: '+data.meetings[m].meetingId);
                            meetingTemplate.find(".meeting-host span").eq(1).text('H: '+data.meetings[m].userName);
                            meetingTemplate.find(".meeting-time span").eq(0).text(timeStamp2DateString(data.meetings[m].startTime));
                            meetingTemplate.find(".meeting-time span").eq(1).text(timeStamp2TimeString(data.meetings[m].startTime));
                        

                            meetingTemplate.find("a.show-details").attr('data',data.meetings[m].meetingSn);
                            meetingTemplate.find("a.show-details").attr('data-time',data.meetings[m].startTime);
                            meetingTemplate.find("a.show-details").bind('click',function(){
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

                            });
                            meetingTemplate.find("a.start-meeting").attr('data',data.meetings[m].meetingId);
                            meetingTemplate.find("a.start-meeting").bind('click',function(){
                                joinMeeting($(this).attr('data'));
                            });
                            
                            //Details
                            meetingTemplate.find(".view-details .details-id").text('ID: '+data.meetings[m].meetingId);
                            meetingTemplate.find(".view-details .details-time span").eq(0).text(timeStamp2DateString(data.meetings[m].startTime));
                            meetingTemplate.find(".view-details .details-time span").eq(1).text(timeStamp2TimeString(data.meetings[m].startTime));
                            meetingTemplate.find(".view-details .details-subject h3").text(data.meetings[m].subject);
                            meetingTemplate.find(".view-details .details-des h4").text(data.meetings[m].description);

                            meetingTemplate.find("a.close-details").bind('click',function(){
                                $(this).parent().parent().parent(".view-details").hide();
                                $(this).parent().parent().parent(".view-details").prev(".small-view").show();
                            }); 

                            $(".meeting-list").find("ul").append(meetingTemplate);

                        }
                    } else {
                        alert("System error. Error code:" + returnCode);
                    }
                },
                error: function(data) {                    
                    // console.log('fail');
                }
            });
        };
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
        }
        //Account info 
        
        initAccountInfo();

        var $firstName = $(".first-name");
        var $lastName = $(".last-name");
        var $phoneNumber = $(".phone-number");
        var $selectTimezone = $(".select-timezone");
        var $password = $(".password");
        var $newPassword = $(".new-password");
        var $onfirmPassword = $(".confirm-password");
        var $changePassword = $(".change-password");
        var $hidePassword = $(".hide-password");
        var $saveAccount = $(".save-account");

        function initAccountInfo(){            
            var jsonInput = {      
              action: 'getUserInfo'
            }; 
            $.ajax({
                type: "GET",
                //url: API_ROOT + '/corpuser.do?json='+ encodeURIComponent(JSON.stringify(jsonInput)),
                url: 'http://localhost:88/api/values?user=1&param=' + encodeURIComponent(JSON.stringify(jsonInput)),
                success: function(data) {     
                    USER_INFO = data = JSON.parse(data);
                    var returnCode = data.returnCode;
                    if (returnCode == 0) {
                        var nameSplit = data.name.split(' ');
                        $firstName.val(nameSplit[0]);
                        $lastName.val(nameSplit[1]);
                        $phoneNumber.val(data.phone);
                        $selectTimezone.val(data.timeZone);
                    } else {
                        alert("System error. Error code:" + returnCode);
                    }
                },
                error: function(data) {                    
                    console.log('fail');
                }
            });
        };

        $changePassword.click(function(){
            $($password).removeAttr("disabled");
            $(".password-box").show();
            $(this).hide();
            $($hidePassword).show();
        });

        $hidePassword.click(function(){
            $($password).attr("disabled","disabled");
            $(".password-box").hide();
            $(this).hide();
            $($changePassword).show();
        });

        $saveAccount.bind('click', saveAccountInfo);

        function saveAccountInfo(){            
            var jsonInput = {      
              action: 'updateUser',
              name: $firstName.val() + ' ' + $lastName.val(),
              phone: $phoneNumber.val(),
              timeZone: $selectTimezone.find("option:selected").eq(0).val()
            }; 
            if($firstName.val() == '' || $lastName.val() == ''){
                alert('Please enter your name. ');
                return;
            }
            if(!$password.is(':disabled')){
                if($password.val() == ''){
                    alert('Please enter your new passwords.');
                    return;
                }
                if($newPassword.val() != $onfirmPassword.val()){
                    alert('New passwords do not match.');
                    return;
                }
                jsonInput.original = $password.val();
                jsonInput.password = $newPassword.val();
            }
            $.ajax({
                type: "GET",
                //url: API_ROOT + '/corpuser.do?json='+encodeURIComponent(JSON.stringify(jsonInput)),
                url: 'http://localhost:88/api/values?user=1&param=' + encodeURIComponent(JSON.stringify(jsonInput)),
                success: function(data) {     
                    data = JSON.parse(data);
                    var returnCode = data.returnCode;
                    if (returnCode == 0) {
                        alert('Thank you, your profile has been updated.');
                    } else if(returnCode == -3){
                        alert(data.message);
                    } else {
                        alert("System error. Error code:" + returnCode);
                    }
                },
                error: function(data) {                    
                    console.log('fail');
                }
            });
        };


    });
})(jQuery);

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