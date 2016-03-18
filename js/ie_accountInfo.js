/**
 * 	accountInfo page
 */
$(function() {
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