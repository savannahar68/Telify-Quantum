

const TMBID_IMAGE = create_id();
const TMBID_MESSAGE = create_id();

const TMBTYPE_INFO = 1,
TMBTYPE_WARNING = 2,
TMBTYPE_ERROR = 3;

var telifyMessageBoxDialogText =
'<table>'
+'<tr>'
+'<td class="col1"><img id="' + TMBID_IMAGE + '" src="images/icon48.png"></td>'
+'<td class="col2"><span id="' + TMBID_MESSAGE + '" class="message">message text</span></td>'
+'</tr>'
+'</table>'
+'<div id="buttonset">'
+'<a id="btn_ok" href="#" class="ui-button ui-corner-all ui-widget">OK</a>'
+'</div>';



function telifyMessageBoxInit(message, msgtype)
{
	switch (msgtype) {
		case TMBTYPE_INFO:
			var img_name = 'info48.png';
			break;
		case TMBTYPE_WARNING:
			var img_name = 'warn48.png';
			break;
		case TMBTYPE_ERROR:
			var img_name = 'error48.png';
			break;
		default:
			var img_name = 'info48.png';
			break;
	}
	document.getElementById(TMBID_IMAGE).src = chrome.extension.getURL('images/'+img_name);
	document.getElementById(TMBID_MESSAGE).innerHTML = message;

	$( "#btn_ok" ).click(function() {
		$( "#telifyMessageBoxDialog" ).dialog( 'close' );
	});
}



function telifyMessageBox(title, message, msgtype)
{
	if ($("div#telifyMessageBox").length == 0) {
		$("body").append("<div id='telifyMessageBox' class='telifyLocalNamespace'></div>");
	}

	return $('<div id="telifyMessageBoxDialog">' + telifyMessageBoxDialogText + '</div>')
	.dialog({
		appendTo: '#telifyMessageBox',
		width: 'auto',
		height: 'auto',
		show: true,
		hide: 'drop',
		draggable: true,
		resizable: false,
		modal: true,
		title: title,
		open: function() {
			telifyMessageBoxInit(message, msgtype);
		},
		close: function() {
			$( this ).dialog( 'destroy' );
			$("div#telifyMessageBox").remove();
		}
	});
}
