

var duration;


var editNumberDialogText =
'<table>'
+'<tr id="telify_editline">'
+'<td class="telify_col1"><img id="telify_codeimg" src="flag/empty.png"></td>'
+'<td class="telify_col2"><input id="telify_cc" class="telify_cc" type="text"></td>'
+'<td class="telify_col3"><input id="telify_nr" class="telify_nr" type="text"></td>'
+'</tr>'
+'<tr id="telify_sep"><td colspan=3>&nbsp;</td></tr>'
+'<tr id="telify_header">'
+'<td class="telify_col1"></td>'
+'<td class="telify_col2">Code</td>'
+'<td class="telify_col3">Country</td>'
+'</tr>'
+'</table>'
+'<div id="telify_codepane" class="telify_codepane">'
+'<table id="telify_codetable" class="telify_codetable">'
+'</table>'
+'</div>'
+'<div id="telify_buttonset">'
+'<a id="telify_btn_dial" href="#" class="ui-button ui-corner-all ui-widget">Dial</a>'
+'<a id="telify_btn_cancel" href="#" class="ui-button ui-corner-all ui-widget">Cancel</a>'
+'</div>';



function updateDialURL() {
	var cc = document.getElementById("telify_cc").value;
	var nr = document.getElementById("telify_nr").value;
	var dial = prefixNumber(cc, nr, "");
	var url = createDialURL(dial);
	$( "#telify_btn_dial" ).attr("href", url);
}


function getFlagSrc(cc, nr)
{
	if (!isCCValid(cc)) return chrome.extension.getURL('flag/empty.png');
	return chrome.extension.getURL('flag/'+getFlagFromNr(cc, nr)+'.png');
}


function setListFocus(cc)
{
	var index = -1;
	var codetable = document.getElementById("telify_codetable");
	for (var i=0; i<telify_country_data.length; i++) {
		codetable.children[i].style = "";
		if (telify_country_data[i][0] == cc) {
			index = i;
		}
	}
	if (index < 0) return;
	var codepane = document.getElementById("telify_codepane");
	codepane.scrollTop = codepane.scrollHeight * index / telify_country_data.length;
	codetable.children[index].style = "background-color:#ddf;font-weight:bold";
	//console.log("setScrollPos("+cc+"): scroll="+node.scrollTop+"/"+node.scrollHeight+" index="+index+"/"+telify_country_data.length);
}


function telifyEditNumberInit(cc, nr)
{

	telify_country_data.sort(function (a, b) {
		return a[1] > b[1] ? 1 : -1;
	});

	var codetable = document.getElementById("telify_codetable");

	var flagdir = chrome.extension.getURL('flag/');

	for (var i=0; i<telify_country_data.length; i++) {
		var node = document.createElement("tr");
		var td0 = document.createElement("td");
		td0.setAttribute("class", "telify_col1");
		var img = document.createElement("img");

		if (telify_country_data[i][0] == "") {
			img.src = flagdir + "empty.png";
		} else {
			img.src = flagdir + telify_country_data[i][0].substr(1) + ".png";
		}

		td0.appendChild(img);
		var td1 = document.createElement("td");
		td1.setAttribute("class", "telify_col2");
		td1.appendChild(document.createTextNode(telify_country_data[i][0]));
		var td2 = document.createElement("td");
		td2.appendChild(document.createTextNode(telify_country_data[i][1]));
		td2.setAttribute("class", "telify_col3");
		node.appendChild(td0);
		node.appendChild(td1);
		node.appendChild(td2);
		codetable.appendChild(node);

		node.setAttribute("cc", telify_country_data[i][0]);
		node.addEventListener("click", function(event) {
			//console.log(event.target);
			var cc = event.currentTarget.getAttribute("cc");
			document.getElementById("telify_cc").value = cc;
			document.getElementById("telify_codeimg").src = getFlagSrc(cc, document.getElementById("telify_nr").value);
			setListFocus(cc);
		}, true);
	}

	document.getElementById("telify_cc").value = cc;
	document.getElementById("telify_nr").value = nr;
	document.getElementById("telify_codeimg").src = getFlagSrc(cc, nr);
	updateDialURL();

	setTimeout(function() {
		setListFocus(cc);
	}, 500);

	document.getElementById("telify_cc").addEventListener("keyup", function(event) {
		var node = document.getElementById("telify_cc");
		var cc = node.value;
		var sel = node.selectionStart;
		var newcc = "";
		for (var i=0; i<cc.length; i++) {
			var c = cc.charAt(i);
			if (c == '+' || (c >= '0' && c <= '9')) {
				newcc += c;
			} else {
				if (i < sel && sel > 0) sel--;
			}
		}
		if (newcc.length > 0 && newcc.charAt(0) != "+") {
			newcc = "+" + newcc;
			if (sel > 0) sel++;
		}
		if (cc != newcc) {
			node.value = newcc;
			node.setSelectionRange(sel, sel);
		}
		setListFocus(node.value);
		document.getElementById(ID_CODEIMG).src = getFlagSrc(document.getElementById("telify_cc").value, document.getElementById("telify_nr").value);
	}, true);

	$( "#telify_btn_dial" ).click(function(e) {
		//updateDialURL();
		var cc = document.getElementById("telify_cc").value;
		var nr = document.getElementById("telify_nr").value;
		if (cc) {
			updateDialHistory(cc);
		}
		var dial = prefixNumber(cc, nr, "");
		var url = createDialURL(dial);
		if (usesHttp(url)) {
			dialNumber(dial);
			e.preventDefault();
		} else {
			$( "#telify_btn_dial" ).attr("href", url);
		}
		$( "#telifyEditNumberDialog" ).dialog( 'close' );
	});

	$( "#telify_btn_cancel" ).click(function() {
		$( "#telifyEditNumberDialog" ).dialog( 'close' );
	});


}





function telifyEditNumber(cc, nr)
{
	duration = performance.now();

	if ($("div#telifyEditNumber").length == 0) {
		$("body").append("<div id='telifyEditNumber' class='telifyLocalNamespace'></div>");
	}

	return $('<div id="telifyEditNumberDialog">' + editNumberDialogText + '</div>')
	.dialog({
		appendTo: '#telifyEditNumber',
		width: 'auto',
		height: 'auto',
		show: true,
		hide: 'drop',
		draggable: true,
		resizable: false,
		modal: true,
		title: "Edit Number",
		closeText: "",
		open: function() {
			$(".ui-widget-overlay").css({background: "#000", opacity: 0.6});
			telifyEditNumberInit(cc, nr);
			duration = performance.now() - duration;
			//console.log("duration = " + duration);
		},
		close: function() {
			$(".ui-widget-overlay").css({background: '', opacity: ''});
			$( this ).dialog( 'destroy' );
			$("div#telifyEditNumber").remove();
		}
	});
}
