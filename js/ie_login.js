/* ===========================
 * jQuery No Conflict
 * ==========================*/
(function($) {

    $(document).ready(function() {
        footerYear();
        login_animation();
        fnLoginForm();
        fnRegisterForm();
        fnJoinForm();
        fnForgotPwd();
        fnChangePwd();
        fnAccountVarify();
        // Test if need to jump to Join form
        var showJoinForm = fnActivateInputForm();

        if (Detect.browser != 'Explorer') {
          if (!Modernizr.localstorage) {
            location.replace('../../outdated_browser.html');
          }
        } else {
          if (Detect.version > 8) {
            if (!Modernizr.localstorage) {
              location.replace('../../outdated_browser.html');
            }
          }
        }

        //Style IE
        if (Detect.browser == 'Explorer') {
            $('head link').after('<link type="text/css" rel="stylesheet" href="../../css/ie/ie.css">');
        }
        
        restoreTest();


		var oBox = document.getElementById("src-circle");
    	var oBar = document.getElementById("src-circle");

    	startDrag(oBar, oBox,function(left,top){
    		if(left>90 && left < 120){
				$('#testH2C').hide();
	            var b = $('#signup').data(MAGIC_KEY2);
	            b.appendTo('#signup');
	            $('#signup').data(MAGIC_KEY, true);
	            $('#signup').removeData(MAGIC_KEY2);
	            setTimeout(function() {
	                $('#signup .green_btn').addClass('bounceIn animated').css({color:'white'});    	                
	            }, 200);

    		}
    		
    	});

        // $( "#testH2C .src" ).draggable({
        //   axis: "x",
        //   revert: function() { return true;}
        // });
        // $( "#testH2C .dest" ).droppable({
        //   drop: function( event, ui ) {
        //     $('#testH2C').hide();
        //     var b = $('#signup').data(MAGIC_KEY2);
        //     b.appendTo('#signup');
        //     $('#signup').data(MAGIC_KEY, true);
        //     $('#signup').removeData(MAGIC_KEY2);
        //     setTimeout(function() {
        //         $('#signup .green_btn').addClass('bounceIn animated').css({color:'white'});    
        //     }, 200);
            
        //   }
        // });
        $('#signup .password, #signup .password2, #login .password, #change_pwd .pwdFormat').keypress(function(key) {
            if (key.charCode == 32) { // no space allowed
                return false;
            }
        });
        $('#signup .password, #signup .password2, #login .password, #change_pwd .pwdFormat').bind('cut copy paste', function(e) {
            e.preventDefault();
        });
    });
})(jQuery);

/* ========================
*  Function
*  ======================== */

var API_ROOT = getGlobalPath('api');
var DASHBOARD_ROOT = getGlobalPath('dashboard');
var MAGIC_KEY = '2747d4b501ba58';
var MAGIC_KEY2 = '6ae212f2ab55e';

function restoreTest() {
  $("#testH2C .src").css('top', 'initial');
  $('#testH2C').show();
  $('#signup').data(MAGIC_KEY, false);
  if (!$('#signup').data(MAGIC_KEY2)) {
    var b = $('.signup_btn,.successMsg');
    b.detach();
    $('#signup').data(MAGIC_KEY2, b);
  }
}

function fnAccountVarify() {
    var token = window.location.href.split('&token=');   
    // console.log(token[0].split('&')[0].split('?')[1]);
    if(token[0].split('&')[0].split('?')[1] == 'goto=login') {
        // console.log("token: " + token[1]);
        // console.log("email: " + email[0]);
        if (token[1]) {
            var email = window.location.href.split('&email=')[1].split('&');
            var jsonInput = {
                'action': 'verifyUserSignup',
                'email': email[0],
                'token': token[1]
            },
            requestData = {"json":JSON.stringify(jsonInput)};

            $.ajax({
                type: "POST",
                url: API_ROOT + '/message.do',
                dataType: 'json',
                data :requestData,
                success: function(data) {
                    var returnCode = data.returnCode;
                    var locale = window.location.href.split('/');
                    var localeIndex = locale.indexOf('home') + 1; // Get locale from URL
                    // console.log(locale[localeIndex]);
                    if (returnCode == 0) {
                        $('#login .email').val(email[0]);
                        fnJoinErrorMsg(null, null, localizedStrings.acctActivated);
                    } 
                    if (returnCode == -3) {
                        $('#login .email').val(email[0]);
                        fnJoinErrorMsg(null, null, localizedStrings.acctAlreadyActivated);
                    }
                    if (returnCode == -5) {
                        fnJoinErrorMsg(null, null, localizedStrings.expiredLink);
                    }
                },
                error: function(data) {
                    alert(localizedStrings.unexpectedErr);
                }

            });

        }
    }
}

function fnLoginForm() {
    var self = $('#login'),
        email, el_email = self.find('input[name=email]'),
        pwd, el_pwd = self.find('input[name=pwd]');

    // === Validate Form : Deselect Check ===
    el_email.blur(function(){
        ($(this).val().length == 0)?showError($(this)):isValidateEmail($(this));
    })

    el_pwd.blur(function(){
        ($(this).val().length < 5)?showError($(this)):hideError($(this));
    })

    // === Validate Form : Press Button ===
    self.submit(function(evt){
        evt.preventDefault();
        $('.form_container .error_msg p').hide();

        (el_email.val().length == 0)?email = showError(el_email):email = isValidateEmail(el_email);
        (el_pwd.val().length < 5)?pwd = showError(el_pwd):pwd = hideError(el_pwd);

        (email == true && pwd == true)?fnLoginServices(el_email, el_pwd):fnLoginErrorMsg(el_pwd, el_email);
    });
}

function fnLoginServices(el_email, el_pwd){
    var jsonInput = {
        "email": el_email.val(),
        "password": el_pwd.val()
    },
    requestData = {"json": JSON.stringify(jsonInput), action: 'authUser' };

    //console.log(JSON.stringify(jsonInput));

    $.ajax({
        type: "POST",
        url: API_ROOT + '/corplogin.do',
        dataType: 'json',
        data :requestData,
        success: function(data) {
            var returnCode = data.returnCode;
            if (returnCode == 0) {
                // alert("logo version: " + data.logo);
                // console.log("material size authorized: " + data.uploadLimit);
                //console.log("Login with user ID: " + data.userId);
                fnSaveUserContext(data);
                window.location.href = '../../';
            } else {
                //console.log("API failed with error code=" + returnCode);
                fnLoginErrorMsg(el_pwd, el_email);
            }
        },
        error: function(data) {
            fnLoginErrorMsg(el_pwd, el_email);
            console.log('fail');
        }
    });
}

function fnLoginErrorMsg(el_pwd, el_email){
    showError(el_pwd);
    showError(el_email);
    $('.form_container .error_msg  p').fadeIn().text(localizedStrings.loginFailed);
    $('.login_btn').addClass('failure');
    setTimeout(function() {
        $('.login_btn').removeClass('failure');
        $('.form_container .error_msg  p').fadeOut();
    }, 2000);
}

function fnForgotPwd(){
    var self = $('#forgot_pwd'),
        email, el_email = self.find('input[name=email]');

    // === Validate Form : Deselect Check ===
    el_email.blur(function(){
        ($(this).val().length == 0)?showError($(this)):isValidateEmail($(this));
    })

    // === Validate Form : Press Button ===
    self.submit(function(evt){
        evt.preventDefault();
        $('.form_container .error_msg p').hide();

        (el_email.val().length == 0)?email = showError(el_email):email = isValidateEmail(el_email);

        if(email == true){
            //Forgot Services
            fnForgotPwdService(el_email);
        }else{
            fnForgotPwdErrorMsg(el_email);
        }
    });
}

function fnForgotPwdService(el_email){
    var jsonInput = {
            "action": "forgotPwd",
            "email": el_email.val(),
            "locale": localStorage.newLang
        };
    var requestData = {"json":JSON.stringify(jsonInput)};

    $.ajax({
        type: "POST",
        url: API_ROOT + '/message.do',
        dataType: 'json',
        data :requestData,
        success: function(data) {
            var returnCode = data.returnCode;
            if (returnCode == 0) {
                // Show Thank you
                fnForgotPwdSuccessMsg(el_email);
            } else {
                // show error
                if (returnCode == -2) {
                    fnForgotPwdEmailErrorMsg(el_email);
                } else {
                    fnForgotPwdErrorMsg(el_email);
                }
            }
        },
        error: function(data) {
            fnForgotPwdErrorMsg(el_email);
        }
    });
}

// for debugging purpose
function fnForgotPwdSuccessMsg(){
    $('#forgot_pwd p[name=forgotPwdDesc]').hide();
    $('#forgot_pwd p[name=forgotPwdNext]').show();
    $('#forgot_pwd .send_btn').hide();
}


function fnForgotPwdEmailErrorMsg(el_email){
    showError(el_email);
    $('.form_container .error_msg  p').fadeIn().text(localizedStrings.invalidEmail);
}

function fnForgotPwdErrorMsg(el_email, text){
    showError(el_email);
    $('.form_container .error_msg  p').fadeIn().text(localizedStrings.invalidPwd);
}



function fnChangePwd(){
    var self = $('#change_pwd'),
        userId, el_userId = self.find('input[name=userId]'),
        token, el_token = self.find('input[name=token]'),
        pwd, el_pwd = self.find('input[name=pwd]'),
        pwd2, el_pwd2 = self.find('input[name=confirmPwd]');

    // === Validate Form : Deselect Check ===
    el_pwd.blur(function(){
        ($(this).val().length < 5)?showError($(this)):hideError($(this));
    })

    el_pwd2.blur(function(){
        ($(this).val().length < 5)?showError($(this)):hideError($(this));
    })

    // === Validate Form : Press Button ===
    self.submit(function(evt){
        evt.preventDefault();
        $('.form_container .error_msg p').hide();

        (el_pwd.val().length < 5)?pwd = showError(el_pwd):pwd = hideError(el_pwd);
        (el_pwd2.val().length < 5)?pwd2 = showError(el_pwd2):pwd2 = hideError(el_pwd2);

        if (!pwd || !pwd2) {
            fnChangePwdInvalidErrorMsg(el_pwd, el_pwd2);
            return;
        }

        if (el_pwd.val() != el_pwd2.val()) {
            fnChangePwdMatchErrorMsg(el_pwd,el_pwd2);
            return;
        }

        if (el_userId.val().length == 0 || el_token.val().length == 0) {
            fnChangePwdInvalidInputErrorMsg();
            return;
        }

        fnChangePwdService(el_userId, el_token, el_pwd, el_pwd2);
    });
}

function fnChangePwdService(el_userId, el_token, el_pwd, el_pwd2){
    var jsonInput = {
            "action": "changePwd",
            "userId": el_userId.val(),
            "token": el_token.val(),
            "password": el_pwd.val()
        };
    var requestData = {"json":JSON.stringify(jsonInput)};

    $.ajax({
        type: "POST",
        url: API_ROOT + '/message.do',
        dataType: 'json',
        data :requestData,
        success: function(data) {
            var returnCode = data.returnCode;
            if (returnCode == 0) {
                // Show Thank you
                fnChangePwdSuccessMsg();
                setTimeout(function() {
                    var localeLang = localStorage.newLang;
                    window.location.href="../..//home/" + localeLang + "/login.html?goto=login";    
                }, 1000);
                
            } else if(returnCode == -3) {
                fnChangePwdExpireMsg();
            } else {
                // show error
                fnChangePwdErrorMsg(el_pwd, el_pwd2);
            }
        },
        error: function(data) {
            fnChangePwdErrorMsg(el_pwd, el_pwd2);
        }
    });
}

// for debugging purpose
function fnChangePwdSuccessMsg(){
    $('.form_container .error_msg  p').fadeIn().text(localizedStrings.pwdChanged);

}

function fnChangePwdInvalidInputErrorMsg(){
    $('.form_container .error_msg  p').fadeIn().text(localizedStrings.invalidInput);
}

function fnChangePwdInvalidErrorMsg(el_pwd, el_confirmPwd){
    showError(el_pwd);
    showError(el_confirmPwd);
    $('.form_container .error_msg  p').fadeIn().text(localizedStrings.pwdTooShort);
}

function fnChangePwdMatchErrorMsg(el_pwd, el_confirmPwd){
    showError(el_pwd);
    showError(el_confirmPwd);
    $('.form_container .error_msg  p').fadeIn().text(localizedStrings.pwdNotMatch);
}

function fnChangePwdErrorMsg(el_pwd, el_confirmPwd){
    showError(el_pwd);
    showError(el_confirmPwd);
    $('.form_container .error_msg  p').fadeIn().text(localizedStrings.reqErr);
}

function fnChangePwdExpireMsg(){
    $('.form_container .error_msg  p').fadeIn().text(localizedStrings.pwdExpire);
}


function fnCleanMeetingID(original) {
    var cleaned = original.split("-").join(""); // remove hyphens
    if (cleaned.length > 0) {
        if (cleaned.length > 9) {
            cleaned = cleaned.substring(0,9);
        }
        cleaned = cleaned.match(new RegExp('.{1,3}', 'g')).join("-");
    }
    return cleaned;
}


function fnJoinForm(){
    var self = $('#join_meeting'),
        email, el_email = self.find('input[name=email]'),
        meetingID, el_meetingID = self.find('input[name=meetingID]');

    // === Validate Form : Deselect Check ===
    el_email.blur(function(){
        ($(this).val().length == 0)?showError($(this)):isValidateEmail($(this));
    })

    el_meetingID.keypress(function(evt){
        return isNumberKey(evt);
    });

    el_meetingID.keyup(function() {
        var cleaned = fnCleanMeetingID($(this).val());
        $(this).val(cleaned);
    });

    el_meetingID.blur(function(){
        ($(this).val().length < 9)?showError($(this)):hideError($(this));
    })

    // === Validate Form : Press Button ===
    self.submit(function(evt){
        evt.preventDefault();
        $('.form_container .error_msg p').hide();

        (el_email.val().length == 0)?email = showError(el_email):email = isValidateEmail(el_email);
        
        (el_meetingID.val().length < 9)?meetingID = showError(el_meetingID):meetingID = hideError(el_meetingID);

        if (el_meetingID.val().length == 0) {
            fnJoinErrorMsg(el_email, el_meetingID, localizedStrings.meetingIDMissing)
            showError(el_meetingID);
            return;
        } else {
            hideError(el_meetingID);
        }

        (email == true && meetingID == true)?fnJoinService(el_email, el_meetingID):fnJoinErrorMsg(el_email, el_meetingID, (!email ? localizedStrings.invalidEmail : localizedStrings.invalidMeetingID));
    });

    //meetingJoin();
}

function fnJoinService(el_email, el_meetingID){
    // TutorMeet Dashboard Params
	var paddingX = 5;
	var paddingY = 50;
    var winWidth = screen.width - 2 * paddingX;
    var winHeight = screen.height - paddingY;

    var dashboardUri = DASHBOARD_ROOT + '/tutormeet.html?data=';
    var dashboardParam = 'width='+winWidth +', height='+winHeight + ',top=0,left=' + paddingX + ',toolbar=no,menubar=no,scrollbars=yes,resizable=yes,status=no';

    var jsonInput = {
            "action": "joinMeetingByEmail",
            "email": el_email.val(),
            "meetingId": el_meetingID.val().replace(/-/g, '')
        };
    var requestData = {"json":JSON.stringify(jsonInput)};

    $.ajax({
        type: "POST",
        url: API_ROOT +'/message.do',
        dataType: 'json',
        data :requestData,
        success: function(data) {
            var returnCode = data.returnCode;
            if (returnCode == 0) {
                var meetingUri = data.meetingUri;
                var dashboardWin = window.open(dashboardUri + meetingUri,
                    "TutorMeet_Enterprise", dashboardParam);
	    //dashboardWin.moveTo(0,0);
	    window.opener = top;

                if (Detect.browser != 'Explorer') {
                    if (window.focus) { dashboardWin.focus(); }
                }
            } else {
                // show error
                if (returnCode == -3) {
                    fnJoinErrorMsg(el_email, el_meetingID, localizedStrings.meetingEnded)
                } else if (returnCode == -4) {
                    //alert("The meeting ID is invalid. Please check your record");
                    fnJoinErrorMsg(el_email, el_meetingID, localizedStrings.invalidMeetingID);
                } else {
                    //alert("System error. Error code:" + returnCode);
                    fnJoinErrorMsg(el_email, el_meetingID, null);
                }
            }
        },
        error: function(data) {
            fnJoinErrorMsg(el_email, el_meetingID, null)
        }
    });
}

function fnJoinErrorMsg(el_email, el_meetingID, text){
    if (el_email == null && el_meetingID == null) {
        $('.form_container .error_msg  p').fadeIn().text(text);
        return;
    }
    if(text == null){
        showError(el_meetingID);
        showError(el_email);
        text = localizedStrings.invalidMeetingID
    }
    $('.form_container .error_msg  p').fadeIn().text(text);

    $('.join_btn').addClass('failure');
    setTimeout(function() {
        $('.join_btn').removeClass('failure');
        $('.form_container .error_msg  p').fadeOut();
    }, 2000);
}

function fnActivateInputForm() {
    var i,
    	gotoLabel='goto',
    	loginValue='login',
    	signUpValue='signup',
    	joinValue='join_meeting',
        gotoValue='',
        meetingLabel = 'join',
        meetingValue = '',
        emailLabel = 'email',
        emailValue = '',
        changePwdLabel = 'change',
        changePwdValue = '',
        userIdLabel = 'userId',
        userIdValue = '',
        tokenLabel = 'token',
        tokenValue = '',
        query = window.location.search.substring(1),
        vars = query.split('&');

    for (i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (pair[0] == gotoLabel) {
        	gotoValue = pair[1];
        } if (pair[0] == meetingLabel) {
            meetingValue = decodeURIComponent(pair[1]);
        } else if (pair[0] == emailLabel) {
            emailValue = decodeURIComponent(pair[1]);
        } else if (pair[0] == changePwdLabel) {
            changePwdValue = decodeURIComponent(pair[1]);
        } else if (pair[0] == userIdLabel) {
            userIdValue = decodeURIComponent(pair[1]);
        } else if (pair[0] == tokenLabel) {
            tokenValue = decodeURIComponent(pair[1]);
        }
    }

    if (Detect.browser == 'Explorer' && Detect.version < 9) {
      if (!meetingValue)
        gotoValue = joinValue;
    }

	if (gotoValue) {
		if (gotoValue == joinValue) {
		    // Activate Join Form
            var joinEl = $('.main_nav li[data-type=join_meeting]');
            fnNav_arrow(true, true, joinEl);
            $('.main_nav li').removeClass('active');
            joinEl.addClass('active');
            $('.form_container form').hide();
        	$('.form_container #join_meeting').fadeIn();
        	return true;
		} else if (gotoValue == signUpValue) {
		    // Activate SignUp Form
            var signupEl = $('.main_nav li[data-type=signup]');
            fnNav_arrow(true, true, signupEl);
            $('.main_nav li').removeClass('active');
            signupEl.addClass('active');
            $('.form_container form').hide();
        	$('.form_container #signup').fadeIn();
			return true;
		} else if (gotoValue == loginValue) {
		    // Activate Login Form
            var loginEl = $('.main_nav li[data-type=login]');
            fnNav_arrow(true, true, loginEl);
            $('.main_nav li').removeClass('active');
            loginEl.addClass('active');
            $('.form_container form').hide();
        	$('.form_container #login').fadeIn();
			return true;
		}		
    } else if (meetingValue) {
        // Activate Join Form
        var joinEl = $('.main_nav li[data-type=join_meeting]');
        fnNav_arrow(true, true, joinEl);
        $('.main_nav li').removeClass('active');
        $('.main_nav li[data-type=join_meeting]').addClass('active');
        $('.form_container form').hide();
        if (meetingValue && isValidateMeetingId(meetingValue))
            var cleaned = fnCleanMeetingID(meetingValue);
            $('.form_container #join_meeting input[name=meetingID]').val(cleaned);
        if (emailValue)
            $('.form_container #join_meeting input[name=email]').val(emailValue);
        $('.form_container #join_meeting').fadeIn();
        return true;
    } else if (changePwdValue == 'pwd') {
        // Activate Change Pwd Form
        if (userIdValue)
            $('.form_container #change_pwd input[name=userId]').val(userIdValue);
        if (tokenValue)
            $('.form_container #change_pwd input[name=token]').val(tokenValue);

        $('.main_nav li').removeClass('active');
        $('.form_container form').hide();
        $('.form_container #change_pwd').fadeIn();
        return true;
    }
    return false;
}

function maskInputValidation(input) {
    var cleaned = input;
    cleaned = cleaned.replace(/[<>]/g, '');
    return cleaned;
}

function fnRegisterForm() {
    var self = $('#signup'),
        fname, el_fname = self.find('input[name=fname]'),
        lname, el_lname = self.find('input[name=lname]'),
        // phone, el_phone = self.find('input[name=phone]'),
        email, el_email = self.find('input[name=email]'),
        pwd, el_pwd = self.find('input[name=pwd]'),
        pwd2, el_pwd2 = self.find('input[name=confirmPwd]');


    // === Validate Form : Deselect Check ===
    el_fname.blur(function(){
        ($(this).val().trim().length == 0)?showError($(this)):hideError($(this));
    })

    el_lname.blur(function(){
        ($(this).val().trim().length == 0)?showError($(this)):hideError($(this));
    })

    // el_phone.blur(function(){
    //     var isValid = $("#mobile-number").intlTelInput("isValidNumber");
    //     (!isValid)?showError($(this)):hideError($(this));
    // })

    el_email.blur(function(){
        ($(this).val().trim().length == 0)?showError($(this)):isValidateEmail($(this));
    })

    el_pwd.blur(function(){
        ($(this).val().length < 5)?showError($(this)):hideError($(this));
    })

    el_pwd2.blur(function(){
        ($(this).val().length < 5)?showError($(this)):hideError($(this));
    })
    // === Validate Form : Press Button ===
    self.submit(function(evt){
        evt.preventDefault();
        $('.form_container .error_msg p').hide();

        (el_fname.val().trim().length == 0)?fname = showError(el_fname):fname = hideError(el_fname);
        (el_lname.val().trim().length == 0)?lname = showError(el_lname):lname = hideError(el_lname);

        if (!fname || !lname) {
            fnRegisterNameErrorMsg(el_fname, el_lname);
            return;
        }

        if (el_fname.val().trim() == "First Name" || el_lname.val().trim() == "Last Name") {
            fnRegisterNameErrorMsg(el_fname, el_lname);
            return;
        }

        if (el_fname.val().trim() == "名字" || el_lname.val().trim() == "姓氏") {
            fnRegisterNameErrorMsg(el_fname, el_lname);
            return;
        }

        // var isValidNumber = el_phone.length == 1 ? el_phone.intlTelInput("isValidNumber") : true;
        // if (! isValidNumber) {
        //     fnRegisterPhoneErrorMsg(el_phone);
        //     return;
        // }

        (el_email.val().trim().length == 0)?email = showError(el_email):email = isValidateEmail(el_email);
        if (!email) {
            fnRegisterEmailErrorMsg(el_email);
            return;
        }

        (el_pwd.val().length < 5 || el_pwd.val().length > 20)?pwd = showError(el_pwd):pwd = hideError(el_pwd);
        (el_pwd2.val().length < 5 || el_pwd2.val().length > 20)?pwd2 = showError(el_pwd2):pwd2 = hideError(el_pwd2);

        if (!pwd || !pwd2) {
            fnRegisterPwdInvalidErrorMsg(el_pwd, el_pwd2);
            return;
        }

        if (el_pwd.val() != el_pwd2.val()) {
            fnRegisterPwdMatchErrorMsg(el_pwd,el_pwd2);
            return;
        }

        fnRegisterService(el_fname, el_lname, el_email, el_pwd, el_pwd2);
    
    });

}

function fnRegisterService(el_fname, el_lname, el_email, el_pwd, el_pwd2){

    if (!$('#signup').data(MAGIC_KEY)) {
      restoreTest();
      return;
    }
    var name = el_fname.val() + " " + el_lname.val(),
        jsonInput = {
            "action": "userSignup",
            "email": el_email.val(),
            "name": name,
            "password": el_pwd.val(),
            "locale":localStorage.newLang
        },
        requestData = {"json":JSON.stringify(jsonInput)};

    $.ajax({
        type: "POST",
        url: API_ROOT + '/message.do',
        dataType: 'json',
        data :requestData,
        success: function(data) {
            var returnCode = data.returnCode;
            if (returnCode == 0) {
                // console.log(el_email.val());
                $('.signup_btn').addClass('success');
                $('.signup_btn').html(localizedStrings.emailSent);
                $('.successMsg').addClass('show');
                $('.successEmail').html(el_email.val());
                $('#signup').closest('form').find('input[type=text], input[type=email], input[type=password]').val("");
                $('#signup button[type=submit]').bind('click', function(e) {
                    e.preventDefault();
                });
            } else {
                if (returnCode == -3) {
                    fnRegisterAlreadyExistErrorMsg(el_email);
                } else {
                    // console.log("API failed with error code=" + returnCode);
                    fnRegisterErrorMsg(el_fname, el_lname, el_email, el_pwd, el_pwd2);
                }
            }
        },
        error: function(data) {
            console.log("API Failed");
            fnRegisterErrorMsg(el_fname, el_lname, el_email, el_pwd, el_pwd2);
        }
    });
}

function showSignupError() {
    $('.login_btn').addClass('failure');
    setTimeout(function() {
        $('.join_btn').removeClass('failure');
        $('.form_container .error_msg  p').fadeOut();
    }, 2000);
}

function fnRegisterNameErrorMsg(el_fname, el_lname){
    showError(el_fname);
    showError(el_lname);
    $('.form_container .error_msg  p').fadeIn().text(localizedStrings.needName);
    showSignupError();
}

// function fnRegisterPhoneErrorMsg(el_phone){
//     showError(el_phone);
//     $('.form_container .error_msg  p').fadeIn().text('*Please enter valid phone number.');
// }

function fnRegisterEmailErrorMsg(el_email){
    showError(el_email);
    $('.form_container .error_msg  p').fadeIn().text(localizedStrings.needEmail);
    showSignupError();
}

function fnRegisterPwdInvalidErrorMsg(el_pwd, el_confirmPwd){
    showError(el_pwd);
    showError(el_confirmPwd);
    $('.form_container .error_msg  p').fadeIn().text(localizedStrings.pwdLength);
    showSignupError();
}

function fnRegisterPwdMatchErrorMsg(el_pwd, el_confirmPwd){
    showError(el_pwd);
    showError(el_confirmPwd);
    $('.form_container .error_msg  p').fadeIn().text(localizedStrings.pwdNotMatch);
    showSignupError();
}

function fnRegisterAlreadyExistErrorMsg(el_phone){
    showError(el_phone);
    $('.form_container .error_msg  p').fadeIn().text(localizedStrings.emailExists);
    showSignupError();
}


function fnRegisterErrorMsg(el_fname, el_lname, el_email, el_pwd, el_confirmPwd){
    showError(el_fname);
    showError(el_lname);
    showError(el_email);
    showError(el_pwd);
    showError(el_confirmPwd);

    $('.form_container .error_msg  p').fadeIn().text(localizedStrings.signupFailed);
    showSignupError();
}








// === Global ===
function footerYear(){
    var cur_year = new Date().getFullYear();
    $('.main_footer .cur_year').text(cur_year);
}

function isValidateEmail(el){
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        email = el.val();
    email = email.replace(/^\s+|\s+$/g, "");

    (re.test(email))?hideError(el):showError(el);
    return re.test(email)
}


function isValidateMeetingId(value){
    var re = /^[0-9\-\_]+$/;
    return (re.test(value));
}

function isNumberKey(evt){
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode != 45 && charCode != 118 && charCode > 31
    && (charCode < 48 || charCode > 57)){
        return false;
    }else{
        return true;
    }
}

function checkWordOnly(el){
    var letterOnly = /^[-a-zA-Z\s+\.+\']+$/;
    (el.val().match(letterOnly))?hideError(el):showError(el);
    return el.val().match(letterOnly);
}

function showError(el){
    el.css({border:'1px solid #a23122'});
    return false;
}

function hideError(el){
    el.css({border:'1px solid #fff'});
    return true;
}

// === Save Credential in Local Storage ===
function fnClearUserContext() {
    localStorage.removeItem('credentials');
}

function fnSaveUserContext(data) {
  var hashData = {};
  $.each(['userId', { src: 'name', dest: 'userName'},
          'email', 'accountType', 
          { src: 'accountSn', dest: 'accountId'}, 'avatar', 
          'isAdmin', 'isCtAdmin',
          'uploadLimit', 'attendeesLimit', 
          'logo', 'timeZone'], function(idx, key) {
    if ($.isPlainObject(key))
      hashData[key.dest] = data[key.src];
    else
      hashData[key] = data[key];
  });
  localStorage.setItem('credentials', JSON.stringify(hashData));
  localStorage.setItem('dataVersion', 3);
}


// === Animation ===
function login_animation(){
    var el = $('.form_container'),
    el_wrap = el.find('.form_wrap');

    //Place arrow onload
    fnNav_arrow(true, true, el.find('.main_nav li:first'));

    //Click event for forgot password
    el_wrap.find('#login .forgot').click(function(evt){
        evt.preventDefault();
        fnNav_arrow(false, false, null);
        el.find('.main_nav li').removeClass('active');
        $(this).closest('form').hide();
        el_wrap.find('#forgot_pwd').addClass('active').fadeIn();
    });

    //Main nav event
    el.find('.main_nav').find('li').click(function(evt){
        evt.preventDefault();
        var type  = $(this).data('type');

        switch(type){
            case 'login':
                if(!el.find('.main_nav li[data-type=signup]').hasClass('active') && !el.find('.main_nav li[data-type=login]').hasClass('active') && !el.find('.main_nav li[data-type=join_meeting]').hasClass('active')){
                    fnFormFadeIn(el_wrap, $(this));
                }else{
                    if(!$(this).hasClass('active')){
                        fnFormSlider(el, $(this))
                    }
                }
                break;
            case 'signup':
                restoreTest();
                if(!el.find('.main_nav li[data-type=signup]').hasClass('active') && !el.find('.main_nav li[data-type=login]').hasClass('active') && !el.find('.main_nav li[data-type=join_meeting]').hasClass('active')){
                    fnFormFadeIn(el_wrap, $(this));
                }else{
                    if(!$(this).hasClass('active')){
                        fnFormSlider(el, $(this));
                    }
                }

                break;
            case 'join_meeting':
                if(!el.find('.main_nav li[data-type=signup]').hasClass('active') && !el.find('.main_nav li[data-type=login]').hasClass('active') && !el.find('.main_nav li[data-type=join_meeting]').hasClass('active')){
                        fnFormFadeIn(el_wrap, $(this));
                    }else{
                        if(!$(this).hasClass('active')){
                            fnFormSlider(el, $(this));
                        }
                    }
                break;
            defualt:
                break;
        }
    });
}

function fnFormFadeIn(el_wrap, el){
    resetFields();
    fnNav_arrow(true, true, el);
    el.addClass('active');
    el_wrap.find('form').hide();
    el_wrap.find('#msg_wrap').hide();
    el_wrap.find('#'+el.data('type')).css({left:0}).fadeIn();
}

function fnFormSlider(el_wrap, el){
    var pos1, pos2,
        cur_active = el_wrap.find('.main_nav li.active').data('type'),
        new_active = el.data('type')
        list = ['login', 'signup', 'join_meeting'];

    resetFields();
    //fnNav_arrow(true, false, el);
    el_wrap.find('.main_nav li').removeClass('active');
    el.addClass('active');
    el_wrap.find('form:not(#login , #signup, #join_meeting)').hide();

    (list.indexOf(cur_active) > list.indexOf(new_active) )?pos1 = '105%': pos1 = '-105%';
    (list.indexOf(cur_active) < list.indexOf(new_active) )?pos2 = '105%': pos2 = '-105%';

    el_wrap.find('#'+new_active).css({display:'block'});

    // var tl_login = new TimelineLite(),
    //     speed = 0.5;

    // tl_login
    //     .to(el_wrap.find('#'+new_active), speed,{display:'block', left: '0' ,ease:Linear.easeNone}, "slide")
    //     .to(el_wrap.find('#'+cur_active), speed,{ left: pos1 ,ease:Linear.easeNone}, "slide");

    el_wrap.find('#'+new_active).show();
    el_wrap.find('#'+cur_active).hide();

    $("#src-circle").css({"left":"0px"});
}

function resetFields(){
    if(Detect.browser != 'Explorer' && Detect.version > 10){
        $('input').val('').css({border:'1px solid #fff'})
    }
    $('.form_container .error_msg  p').hide();
}

function fnNav_arrow(display, load, el){
    var main_nav = $('.form_container .main_nav');

    if(display == true){
        var first_li_offset = el.find('a').position().left,
            first_li_width = el.find('a').width(),
            center_arrrow = first_li_offset + (first_li_width/2 - 5);

        main_nav.find('ul').css({'background-image': "url('../../img/icon/arrow_tri_d_white.svg')"});

        if(load == true){
            main_nav.find('ul').css('background-position', center_arrrow+'px top');
        }else{
            //TweenMax.to(main_nav.find('ul'), .5, {backgroundPosition: center_arrrow+'px', ease:Linear.easeNone});
        }
    }else{
        main_nav.find('ul').css({'background-image': 'none'});
    }
}
