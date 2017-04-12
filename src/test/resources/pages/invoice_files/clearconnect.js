/* General ClearConnect Service Call File  */
/* Version 0.1 Developed by AS */
/* 13/05/2013 */

function clearConnectCall(callFile, jsonData, callBack) {

    var pageCall = 'https://www.teammed.com.au/shop/cgi-bin/'+callFile+'.cgi'; // Set Page to Call
    //var pageCall = '/cgi-bin/'+callFile+'.cgi'; // Set Page to Call
    //console.log(pageCall);

	var stringData = JSON.stringify(jsonData); // Set JSON data to string

    jQuery.ajax({

        type: "POST",

        url: pageCall,

		dataType: "json",

        data: jsonData,

        success: function(data) {
            data.id = jsonData.stk_id1;
			data.qty = jsonData.stk_qua1;
			if(data.ErrorReturn != undefined) {
				var error = data.ErrorReturn;
				if(error.indexOf('(1000)') != -1) { // Check is not a random error
					window.location = '?page=expire';
					return;
				}
			}
			callBack(data);
		},

        error: function(request, status, error) {

			data = {ccReturn: "error", errorMsg: "Connection Error", ReturnedVars: "true"}

			callBack(error);

		},

    });

}

function createCookie(name,value,hours) {

	if (hours) {

		var date = new Date();

		date.setTime(date.getTime()+(hours*60*60*1000));

		var expires = "; expires="+date.toGMTString();

	}

	else var expires = "";

	document.cookie = name+"="+value+expires+"; path=/";

}

function readCookie(name) {

	var nameEQ = name + "=";

	var ca = document.cookie.split(';');
    //alert(ca);
	for(var i=0;i < ca.length;i++) {

		var c = ca[i];

		while (c.charAt(0)==' ') c = c.substring(1,c.length);

		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);

	}

	return null;
}

function eraseCookie(name) {

	createCookie(name,"",0);

}
