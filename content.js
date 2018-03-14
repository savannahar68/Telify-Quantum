
var telify_number_list = [];

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === "getNumberList") {
			sendResponse(telify_number_list);
    }
    if (request.message === "scrollIntoView") {
    	//$( "#"+request.id )[0].scrollIntoView();
    	let ofs = $( "#"+request.id ).offset();
    	$('html, body').animate({
				scrollTop: ofs.top - $( window ).height() / 3
			}, 500, "swing", function() {
	    	$( "#"+request.id ).contextMenu();
			});
    }
  }
);



var hilite_color = new Array(0,0,255);
var hilite_bgcolor = new Array(255,255,0);

// special chars
var sc_nbsp = String.fromCharCode(0xa0);

// chars which look like dashes
var token_dash =
	String.fromCharCode(0x2013) +
	String.fromCharCode(0x2014) +
	String.fromCharCode(0x2212);

var exclPatternList = [
	/^\d{2}\.\d{2} *(-|–) *\d{2}\.\d{2}$/,	// time range e.g. 08.00 - 17.00
	/^\d{2}\/\d{2}\/\d{2}$/,	// date e.g. 09/03/09
	/^\d{2}\/\d{2} *(-|–) *\d{2}\/\d{2}$/,	// date range e.g. 01/05 - 05/06
	/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,	// ip address
	/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3} *\/ *(8|16|24)$/,	// ip address with subnet
	/^[0-3]?[0-9][\/\.-][0-3]?[0-9][\/\.-](19|20)\d{2} *(-|–) *\d{2}\.\d{2}$/,	// date and time e.g. 09.03.2009 - 17.59
	/^\d{2}[\.\:]\d{2} +[0-3]?[0-9][\/\.-][0-3]?[0-9][\/\.-](19|20)?\d{2}$/,	// date and time e.g. 17:59 09/03/2009
	/^[0-3]?[0-9][\/\.-] *[0-3]?[0-9][\/\.-] *(19|20)\d{2}$/,	// date e.g. 09/03/2009, 09.03.2009, 09-03-2009
	/^[0-3]?[0-9]\.?[\/-][0-3]?[0-9]\. *[0-1]?[0-9]\. *(19|20)\d{2}$/,	// two days e.g. 20/21.5.2010
	/^[0-3]?[0-9][\/\.-][0-3]?[0-9]\.? *(-|–) *[0-3]?[0-9][\/\.-][0-3]?[0-9]\.?$/,	// date range days
	/^[0-3]?[0-9][\/\.-][0-3]?[0-9][\/\.-]? *(-|–) *[0-3]?[0-9][\/\.-][0-3]?[0-9][\/\.-]\d{2}$/,	// date range short
	/^[0-3]?[0-9][\/\.-][0-3]?[0-9][\/\.-]\d{2} *(-|–) *[0-3]?[0-9][\/\.-][0-3]?[0-9][\/\.-]\d{2}$/,	// date range short
	/^[0-3]?[0-9][\/\.-][0-3]?[0-9][\/\.-] *(-|–) *[0-3]?[0-9][\/\.-][0-3]?[0-9][\/\.-](19|20)\d{2}$/,	// date range medium
	/^([0-3]?[0-9][\/\.-])?[0-3]?[0-9][\/\.-](19|20)\d{2} *(-|–) *([0-3]?[0-9][\/\.-])?[0-3]?[0-9][\/\.-](19|20)\d{2}$/,	// date range long
	/^[0-9]([ \.\,]000)+$/,	// just a big number
	/^000.+$/,	// starting with more than 2 zeroes
	/^[0-1]+$/,	// bit pattern
	/^0\.\d+$/, // e.g. 0.12345678
	/^[0-1]-\d{5}-\d{3}-\d{1}$/,	// ISBN
	/^0-[0-1]\d{1}-\d{6}-\d{1}$/,	// ISBN
	/^0-[2-6]\d{2}-\d{5}-\d{1}$/,	// ISBN
	/^0-[7-8]\d{3}-\d{4}-\d{1}$/,	// ISBN
	/^0-8\d{4}-\d{3}-\d{1}$/,	// ISBN
	/^0-9\d{5}-\d{2}-\d{1}$/,	// ISBN
	/^0-9\d{6}-\d{1}-\d{1}$/,	// ISBN
	/^1\.\d{3}\.\d{3}$/,	// number with decimal separator
];

// list of special local phone number patterns and their corresponding country code
// here be dragons: always add [^\d]* at end of pattern
var inclLocalList = [
	[/^[1-9]\d{2}[ /\.-][1-9]\d{2}[ /\.-]\d{4}[^\d]*$/, "+1"],	// US
	[/^\([1-9]\d{2}\) [1-9]\d{2}[ /\.-]\d{4}[^\d]*$/, "+1"],	// US
	[/^0[1-9][ \.]\d{2}[ \.]\d{2}[ \.]\d{2}[ \.]\d{2}[^\d]*$/, "+33"],	// France
	[/^0[ \.]800[ \.]\d{2}[ \.]\d{2}[ \.]\d{2}[^\d]*$/, "+33"],	// France
];

var token_trigger = "+(0123456789";
var token_part = " -/()[].\r\n"
	+ String.fromCharCode(0xa0) // sc_nbsp
	+ String.fromCharCode(0x2013) + String.fromCharCode(0x2014) +	String.fromCharCode(0x2212); // token_dash
var token_start = "+(0";
var token_sep = " -/(.";
var token_disallowed_post = ":-²³°$€£¥";
var token_disallowed_prev = "/-,.$€£¥";

var string_disallowed_post = [
	"km²", "Hz", "kHz", "Uhr", "Bytes", "kB", "MB", "km/h", "²", "³", "°", "mph", "$", "€", "£", "¥"
];


var excludedTags = ["applet","map","select","script","textarea","datalist","time"];
var excludedAtts = [
	["contenteditable", "true"],
	["class", "telifyContextMenu"]
];


var cancelParse = false;
var startParse = 0;
var max_parse_time = 5000;


var basechar_tab = [
	String.fromCharCode(0xa0) +
	String.fromCharCode(0x2013) +
	String.fromCharCode(0x2014) +
	String.fromCharCode(0x2212),
	" ---"
];

const STATE_PRE = 1;


function basechar(c)
{
	var index = basechar_tab[0].indexOf(c);
	if (index >= 0) c = basechar_tab[1].charAt(index);
	return c;
};


function reject(str, reason)
{
	if (pref.debug == 0) return;
	var msg = "Telify: reject '"+str+"' reason: "+reason;
	console.log(msg);
};


function accept(str, reason)
{
	if (pref.debug == 0) return;
	var msg = "Telify: accept '"+str+"' reason: "+reason;
	console.log(msg);
};


function isdigit(c)
{
	return ("0123456789".indexOf(c) >= 0);
};


function stripNumber(phonenr)
{
	var token_href = "+0123456789";
	var newnr = "";
	for (var i=0; i<phonenr.length; i++) {
		var c = phonenr.charAt(i);
		if (token_href.indexOf(c) >= 0) newnr += c;
	}
	return newnr.substr(0, digits_max);
};


function countDigits(text)
{
	var count = 0;
	for (var i=0; i<text.length; i++) {
		var c = text.charAt(i);
		if (c >= '0' && c <= '9') count++;
	}
	return count;
};


function getNodeDocument(node)
{
	node = node.parentNode;
	if (node == null) return null;
	if (node.nodeType == Node.DOCUMENT_NODE) return node;
	return getNodeDocument(node);
};


function formatPhoneNr(phonenr)
{
	var substList = [
		["  ", " "],	// double spaces to single space
		[this.sc_nbsp, " "],	// non-breaking space to plain old space
		["+ ", "+"],	// remove space after +
		["--", "-"],	// double dashes to single dash
		["(0)", " "],	// remove optional area code prefix
		["[0]", " "],	// remove optional area code prefix
		["-/", "/"],
		["/-", "/"],
		["( ", "("],
		[" )", ")"],
		["\r", " "],
		["\n", " "],
	];

	// replace dash-like chars with dashes
	for (var i=0; i<phonenr.length; i++) {
		var c = phonenr.charAt(i);
		if (this.token_dash.indexOf(c) >= 0) {
			phonenr = phonenr.substr(0, i) + "-" + phonenr.substr(i+1);
		}
	}

	const MAXLOOP = 100; // safety bailout
	var nChanged;

	nChanged = 1;
	for (var j=0; nChanged > 0 && j < MAXLOOP; j++) {
		nChanged = 0;
		for (var i=0; i<substList.length; i++) {
			var index;
			while ((index = phonenr.indexOf(substList[i][0])) >= 0) {
				phonenr = phonenr.substr(0, index) + substList[i][1] + phonenr.substr(index+substList[i][0].length);
				nChanged++;
			}
		}
	}

	return phonenr;
};


function onClick(e)
{
	var nr = this.getAttribute("nr");
	var nr_parts = splitPhoneNr(nr);
	if (nr_parts[0]) {
		updateDialHistory(nr_parts[0]);
	}
	var href = this.getAttribute("href");
	if (usesHttp(href)) {
		dialNumber(nr);
		e.preventDefault();
	}
};


function telifyTextNode(node, state, hasNoContent)
{
	if (node == null || node.data == null) return 0;
	var text = node.data;
	var len = text.length;
	if (len < digits_min) return 0;
	var hlFactor = 0.25;
	var blank_count = 0;
	var parentTag = "";

	if (node.parentNode.nodeType == Node.ELEMENT_NODE) {
		parentTag = node.parentNode.tagName.toLowerCase();
	}

	for (var i=0; i<len; i++) {
		var c = text.charAt(i);

		if (token_trigger.indexOf(c) < 0) continue;

		c = basechar(c);

		var str = "" + c;
		var strlen = 1;
		var last_c = c;
		var ndigits = (isdigit(c) ? 1 : 0);
		var index;

		// gather allowed chars
		while (strlen < len-i) {
			c = text.charAt(i+strlen);
			c = basechar(c);
			if (c == " ") {
				blank_count++;
				if (blank_count == 3 && parentTag == "pre") break;
			} else {
				blank_count = 0;
			}
			if ((c == '+' && ndigits == 0) || (token_part.indexOf(c) >= 0)) {
				if ((state & STATE_PRE) && (c == '\r' || c == '\n')) break;
				if (c == last_c && c!=' ') break;
			} else {
				if (!isdigit(c)) break;
				ndigits++;
			}
			str += c;
			strlen++;
			last_c = c;
		}

		// check against digit count min value
		if (ndigits < digits_min) {
			//reject(str, "less than "+digits_min+" digits");
			i += strlen - 1; continue;
		}

		// check allowed prev token
		if (i > 0) {
			var prev_c = text.charAt(i-1);
			if (token_disallowed_prev.indexOf(prev_c) >= 0) {
				reject(str, "unallowed previous token ('"+prev_c+"')");
				i += strlen - 1; continue;
			}
			if ((prev_c >= 'a' && prev_c <= "z") || (prev_c >= 'A' && prev_c <= "Z")) {
				reject(str, "unallowed previous token ('"+prev_c+"')");
				i += strlen - 1; continue;
			}
		}

		// check if phone number starts with country code
		var posscc = null;
		for (var j=0; j<telify_country_data.length; j++) {
			var cclen = telify_country_data[j][0].length;
			if (cclen < 2 || cclen > 4) continue;
			var pattern = telify_country_data[j][0].substr(1);
			var plen = pattern.length;
			if (str.substr(0, plen) != pattern) continue;
			var c = str.charAt(plen);
			if (token_sep.indexOf(c) < 0) continue;
			posscc = "+"+pattern;
			accept(str, "starts with country code "+pattern+" ("+telify_country_data[j][1]+")");
			break;
		}

		// check against special local patterns
		var pattcc = null;
		for (var j=0; j<inclLocalList.length; j++) {
			var res = inclLocalList[j][0].exec(str);
			if (res) {
				pattcc = inclLocalList[j][1];
				accept(str, "matches local pattern with index "+j);
				break;
			}
		}

		// check if phone number starts with allowed token
		if (pattcc == null && posscc == null && token_start.indexOf(str.charAt(0)) < 0) {
			reject(str, "unallowed start token (reject list)");
			i += strlen - 1;
			continue;
		}

		// trim chars at end of string up to an unmatched opening bracket
		index = -1;
		for (var j=strlen-1; j>=0; j--) {
			c = str.charAt(j);
			if (c == ')' || c == ']') break;
			if (c == '(' || c == '[') {index = j; break;}
		}
		if (index == 0) continue;
		if (index > 0) {
			str = str.substr(0, index);
			strlen = str.length;
		}

		var digitCount = countDigits(str);

		// check against base digits count min value
		if (posscc && (digitCount - posscc.length + 1 < digits_base_min)) {
			reject(str, "less than "+digits_base_min+" digits after country code");
			i += strlen - 1; continue;
		}

		// check against digit count max value (after we have removed unnecessary digits)
		if (digitCount > digits_max) {
			reject(str, "more than "+digits_max+" digits");
			i += strlen - 1; continue;
		}

		// trim non-digit chars at end of string
		while (str.length > 0) {
			c = str.charAt(str.length-1);
			if (!isdigit(c)) {
				str = str.substr(0, str.length-1);
				strlen--;
			} else break;
		}

		// check for unallowed post token
		// caveat: post_c is also used in the next check
		var post_c = text.charAt(i+strlen);
		if (post_c) {
			if (token_disallowed_post.indexOf(post_c) >= 0) {
				reject(str, "unallowed post token ('"+post_c+"')");
				i += strlen - 1; continue;
			}
			if ((post_c >= 'a' && post_c <= "z") || (post_c >= 'A' && post_c <= "Z")) {
				reject(str, "unallowed post token ('"+post_c+"')");
				i += strlen - 1; continue;
			}
		}

		// check for unallowed post strings (dimensions, units, etc.)
		var post_s = null;
		for (var j=0; j<string_disallowed_post.length; j++) {
			var postlen = string_disallowed_post[j].length;
			if (text.substr(i+strlen+1, postlen) == string_disallowed_post[j]) {
				if (post_c == ' ' || post_c == sc_nbsp) {
					post_s = string_disallowed_post[j];
					break;
				}
			}
		}
		if (post_s) {
			reject(str, "unallowed post string ('"+post_s+"')");
			i += strlen - 1; continue;
		}

		// check if this is just a number in braces
		// first check for unnecessary opening braces
		if (str.substr(0, 1) == "(" && str.indexOf(")") < 0) {
			str = str.substr(1);
			i++;
			strlen--;
			// now check if it still starts with allowed token
			if (token_start.indexOf(str.charAt(0)) < 0) {
				reject(str, "unallowed start token (after brace removal)");
				i += strlen - 1; continue;
			}
		}

		// check against blacklisted patterns (date, time ranges etc.)
		index = -1;
		for (var j=0; j<exclPatternList.length; j++) {
			var res = exclPatternList[j].exec(str);
			if (res) {index = j; break;}
		}
		if (index >= 0) {
			reject(str, "blacklisted pattern #"+index);
			i += strlen - 1;
			continue;
		}

		// ----------------------------------------------------------------

		var display = formatPhoneNr(str);
		var href = stripNumber(display);
		//if (posscc) href = "+"+href;
		//if (pattcc) href = pattcc + href;

		hlFactor = pref.highlight / 100;

		// insert link into DOM

		if (hasNoContent) {
			//var node_prev = document.createTextNode(text.substr(0, i));
			//var node_after = document.createTextNode(text.substr(i+strlen));
		} else {
			var node_prev = document.createTextNode(text.substr(0, i));
			var node_after = document.createTextNode(text.substr(i+strlen));
		}

		if (hasNoContent) {
			var node_anchor = document.createElementNS("http://www.w3.org/1999/xhtml", "html:a");
		} else {
			var node_anchor = document.createElement("a");
		}

		if (hlFactor > 0.0 && !hasNoContent) {
			var style = "color:rgba(0,0,238,1.0);background-color:rgba(255,255,0,"+hlFactor+");-border-radius:3px";
			style = style + ";cursor:pointer";
			node_anchor.setAttribute("style", style);
		} else {
			node_anchor.setAttribute("style", "cursor:pointer");
		}

		node_anchor.setAttribute("title", "Use as phone number");
		node_anchor.setAttribute("class", "telified");
		if (posscc) node_anchor.setAttribute("posscc", posscc);
		if (pattcc) node_anchor.setAttribute("pattcc", pattcc);
		var tld = getHostTLD();
		if (tld) node_anchor.setAttribute("tld", tld);
		node_anchor.setAttribute("nr", href);
		var url = createDialURL(href);
		node_anchor.setAttribute("href", url);
		var id = create_id();
		node_anchor.setAttribute("id", id);
		//node_anchor.addEventListener("click", onClick, false);

		if (hasNoContent) {
			//var node_text = document.createTextNode(str);
			var display = text;
		} else {
			var display = str;
		}
		var node_text = document.createTextNode(display);
		node_anchor.appendChild(node_text);

		var list_index = -1;
		for (var j=0; j<telify_number_list.length; j++) {
			if (telify_number_list[j].nr == href) {
				list_index = j;
				break;
			}
		}
		if (list_index < 0) {
			telify_number_list.push({nr: href, url: url, text: display, id: id, posscc: posscc, pattcc: pattcc, tld: tld});
		}

		var parentNode = node.parentNode;
		if (hasNoContent) {
			parentNode.replaceChild(node_anchor, node);
		} else {
			parentNode.replaceChild(node_after, node);
			parentNode.insertBefore(node_anchor, node_after);
			parentNode.insertBefore(node_prev, node_anchor);
		}

		return 1;
	}

	return 0;
}






function recurseNode(node, state, depth)
{
	//console.log("recurseNode depth="+depth+" node="+node+" type="+node.nodeType);

	if (cancelParse) return 0;
	var duration = (new Date()).getTime() - startParse;
	if (duration >= max_parse_time) {
		cancelParse = true;
		return 0;
	}
	if (node == null) return 0; // safety

	if (node.nodeType == Node.TEXT_NODE) {
		try {
			if (!$(node.parentNode).is(':visible')) return 0;
		} catch (e) {
			console.log(e);
			return 0;
		}
		return telifyTextNode(node, state, false);
	} else {
		var nChanged = 0;
		if (node.nodeType == Node.ELEMENT_NODE) {
			let tagName = node.tagName.toLowerCase();
			if (excludedTags.indexOf(tagName) >= 0) return 0;
			for (var n=0; n<excludedAtts.length; n++) {
				if (excludedAtts[n][0] == "class") {
					let nodeclass = node.getAttribute("class");
					if (nodeclass && nodeclass.includes(excludedAtts[n][1])) return 0;
				} else {
					let attrib = node.getAttribute(excludedAtts[n][0]);
					if (attrib && attrib == excludedAtts[n][1]) {
						return 0;
					}
				}
			}
			if (tagName == 'pre') state |= STATE_PRE;
			if (tagName == 'a') {
				if (pref.rewrite_voip_urls == 0) return 0;
				if (node.childNodes.length != 1) return 0;
				let nodeclass = node.getAttribute("class");
				if (nodeclass && nodeclass.includes("telified")) return 0;
				let href = node.getAttribute("href");
				if (href && isVoIPURL(href)) {
					console.log("rewrite candidate "+href);
					let child = node.childNodes[0];
/*
					if (child.nodeType == Node.TEXT_NODE) {
						node.parentNode.replaceChild(child, node);
						return telifyTextNode(child, state, false);
					}
*/
					let count = recurseNode(child, state, depth+1);
					if (count > 0) {
						node.setAttribute("href", "#");
					}
					console.log("count = "+count);
					return count;
				}
				if (node.hasAttribute("data-pstn-out-call-url")) {
					console.log("data-number="+node.getAttribute("data-number"));
					var child = node.childNodes[0];
					if (child.nodeType == Node.TEXT_NODE) {
						node.parentNode.replaceChild(child, node);
						return telifyTextNode(child, state, false);
					}
				}
				return 0;
			}
		}
		for (var i=0; i<node.childNodes.length; i++) {
			nChanged += recurseNode(node.childNodes[i], state, depth+1);
			if (cancelParse) return nChanged;
		}


/*
		if (node.contentDocument) {
			nChanged += recurseNode(node.contentDocument.body, state, depth+1);
			//node.contentDocument.addEventListener("click", objTelify.onClick, false);
			var host = objTelifyUtil.getHost(node.contentDocument);
			if (host && objTelifyPrefs.excludedDynamicHosts.indexOf(host) < 0) {
				try {
					if (node.contentDocument.observer == undefined) {
						node.contentDocument.observer = new MutationObserver(function(mutations){objTelify.onDOMModified(null)});
						node.contentDocument.observer.observe(node.contentDocument, {subtree: true});
					}
				} catch (e) {
					node.contentDocument.addEventListener("DOMSubtreeModified", objTelify.onDOMModified, false);
				}
			}
		}
*/
	}

	return nChanged;
}


var telify_isparsingnow = false;
var telify_parsecount = 0;


function parsePage() {
	if (pref.blacklist.indexOf(document.location.host) >= 0) {
		console.log("host '"+document.location.host+"' is blacklisted");
    chrome.runtime.sendMessage({
    	'message': 'setBadgeText',
    	'text': 'X'
    });
    chrome.runtime.sendMessage({
    	'message': 'setBadgeBackgroundColor',
    	'text': '#800000'
    });
    chrome.runtime.sendMessage({
    	'message': 'setBadgeTooltip',
    	'text': "Disabled on this site"
    });
    chrome.runtime.sendMessage({
    	'message': 'pageBlacklisted'
    });
		return false;
	}
	telify_isparsingnow = true;
	telify_parsecount++;
	startParse = (new Date()).getTime();
	var nChanged = recurseNode(document, 0, 0);
	telify_isparsingnow = false;
	if (telify_number_list.length > 0) {
    chrome.runtime.sendMessage({
    	'message': 'setBadgeText',
    	'text': telify_number_list.length.toString()
    });
    chrome.runtime.sendMessage({
    	'message': 'setBadgeBackgroundColor',
    	'text': '#008000'
    });
    chrome.runtime.sendMessage({
    	'message': 'setBadgeTooltip',
    	'text': "Recognized "+telify_number_list.length.toString()+" phone number(s) on this page"
    });
  }
  chrome.runtime.sendMessage({
  	'message': (telify_parsecount == 1 ? 'parseNumberCount' : 'reparseNumberCount'),
  	'count': telify_number_list.length
  });
  return true;
}



const observer = new MutationObserver(function(mutations) {
	if (telify_isparsingnow) return;
	if (pref.debug) console.log("page changed, reparsing");
	parsePage();
});

const config = {
	attributes: true,
	childList: true,
	characterData: false
}

chrome.storage.sync.get(pref_default, function(item) {
	pref = item;
	pref.history = [];
	if (parsePage()) {
		if (pref.reparse_dynamic) {
			observer.observe(document.body, {childList: true});
		}
	}
});









/* context menu */


function createContextURL(cc, nr) {
	if (cc == null) cc = "";
	var dial = prefixNumber(cc, nr, "");
	return createDialURL(dial);
}

var localDisplayPatterns = [
	[/^\+1-([1-9]\d{2})(\d{3})(\d{4})$/, "+1 ($1) $2-$3"],	// US
	[/^\+33-(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})$/, "+33 $1 $2 $3 $4 $5"],	// France
	[/^\+44-20(\d{4})(\d{4})$/, "+44 20 $1 $2"],	// United Kingdom: London
	[/^\+49-30(\d+)$/, "+49 (30) $1"],	// Germany: Berlin
	[/^\+49-40(\d+)$/, "+49 (40) $1"],	// Germany: Hamburg
	[/^\+49-69(\d+)$/, "+49 (69) $1"],	// Germany: Frankfurt
	[/^\+49-89(\d+)$/, "+49 (89) $1"],	// Germany: Munich
	[/^\+49-911(\d+)$/, "+49 (911) $1"],	// Germany: Nuremberg
];


function createContextObject(cc, nr) {
	var url = createContextURL(cc, nr);
	var display = prefixNumber(cc, nr, "-");
	var dial = prefixNumber(cc, nr, "");
	for (var i=0; i<localDisplayPatterns.length; i++) {
		var local = display.replace(localDisplayPatterns[i][0], localDisplayPatterns[i][1]);
		if (local != display) {
			display = local;
			break;
		}
	}
	let countryname = getCountryListString(cc, stripNDDFromNumber(cc, nr));
	//console.log(display+" / "+local);
	let objtitle = "Dial this number";
	if (countryname) {
		objtitle += " in "+countryname;
	}
	if (usesHttp(url)) {
		return {
			name: "<span title='"+objtitle+"'>"+display+"</span>",
			isHtmlName: true,
			icon: getFlagCode(cc, nr),
			callback: function(key, opt) {
				updateDialHistory(cc);
				dialNumber(dial);
	    }
		};
	} else {
		return {
			name: "<a href='"+url+"' title='"+objtitle+"' class='telified'>"+display+"</a>",
			isHtmlName: true,
			icon: getFlagCode(cc, nr),
			//cc: cc,
			callback: function(key, opt) {
				updateDialHistory(cc);
	    }
		};
	}
}



$(function() {
	$.contextMenu({
		className: "telifyContextMenu",
		selector: '.telified',
		trigger: 'right',
		zIndex: 9999,
		//delay: 500,
		//autoHide: true,
		animation: {duration: 300, show: 'show', hide: 'hide'},
		position: function(opt, x, y) {
			if (x === undefined) {
	      opt.$menu.position({
	        my: 'left top',
	        at: 'left bottom',
	        of: opt.$trigger
	      });
	    } else {
	    	var dx = Math.floor(x - opt.$trigger.offset().left);
	    	var dy = Math.floor(y - opt.$trigger.offset().top);
/*
	    	console.log(opt);
	    	console.log(x, y);
	    	console.log(opt.$trigger.offset().left, opt.$trigger.offset().top);
	    	console.log('left+'+dx+' top+'+dy);
*/
	      opt.$menu.position({
	        my: 'left top',
	        at: 'left+'+dx+' top+'+dy,
	        of: opt.$trigger
	      });
	    }
    },
		build: function($trigger, e) {
			e.preventDefault();
			var nr = $trigger[0].getAttribute("nr");
			var nr_parts = splitPhoneNr(nr);
			//console.log("my object: %o", $trigger[0]);
			var obj = {
/*
				callback: function(key, options) {
					//console.log("callback: %o", obj.items[key].cc);
					updateDialHistory(obj.items[key].cc);

					console.log("key", key);
					console.log("options", options);

					var href = obj.items[key].url;
					if (usesHttp(href)) {
						dialNumber(obj.items[key].nr);
						alert(href);
						return false;
					}

					return true;
				},
*/
				items: {}
			};

			obj.items.main = createContextObject(nr_parts[0], nr_parts[1]);

			if (!nr_parts[0]) {

				var pattcc = $trigger[0].getAttribute("pattcc");
				if (pattcc == nr_parts[0]) pattcc = null;

				var posscc = $trigger[0].getAttribute("posscc");
				if (posscc == nr_parts[0] || posscc == pattcc) posscc = null;

				var tld = $trigger[0].getAttribute("tld");
				var tldcc = (tld ? tld2cc(tld) : null);
				if (tldcc == nr_parts[0] || tldcc == pattcc || tldcc == posscc) tldcc = null;

				if (pattcc || posscc || tldcc) {
					obj.items.sep_speculative = "---------";
				}

				if (pattcc) {
					obj.items.pattcc = createContextObject(pattcc, nr_parts[1]);
				}

				if (posscc) {
					var base = nr.substr(posscc.length-1);
					obj.items.posscc = createContextObject(posscc, base);
				}

				if (tldcc) {
					obj.items.tld = createContextObject(tldcc, nr_parts[1]);
				}

				if (pref.history.length > 0 && pref.num_history > 0) {
					obj.items.sep_history = "---------";
				}

				for (var i=0; i<pref.history.length && i<pref.num_history; i++) {
					var cc = pref.history[i];
					if (cc == nr_parts[0] || cc == pattcc || cc == posscc || cc == tldcc) continue;
					obj.items["hist"+i] = createContextObject(pref.history[i], nr_parts[1]);
				}

			}

			obj.items.sep_edit = "---------";
			obj.items.edit = {
				name: "Edit phone number",
				isHtmlName: true,
				callback: function(itemKey, opt) {
					telifyEditNumber(nr_parts[0], nr_parts[1]);
				},
				icon: "edit"
			};

			return obj;
		}
	});

	$('.telified').on('click', function(e) {
		var nr = this.getAttribute("nr");
		var nr_parts = splitPhoneNr(nr);
		if (nr_parts[0]) {
			updateDialHistory(nr_parts[0]);
		}
		var href = this.getAttribute("href");
		if (usesHttp(href)) {
			dialNumber(nr);
			e.preventDefault();
		}
	});

});
