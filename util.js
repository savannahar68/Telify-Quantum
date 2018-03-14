
const digits_min = 7;
const digits_base_min = 7;
const digits_max = 16;



function parseColor(text)
{
	var exp, res, color;

	if (text == null) return null;

	exp = /^rgb *\( *(\d{1,3}) *, *(\d{1,3}) *, *(\d{1,3}) *\)$/;
	res = exp.exec(text);
	if (res) {
		color = new Array(parseInt(res[1]), parseInt(res[2]), parseInt(res[3]));
		for (var i=0; i<3; i++) {
			if (color[i] < 0) color[i] = 0;
			if (color[i] > 255) color[i] = 255;
		}
		return color;
	}

	exp = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i;
	res = exp.exec(text);
	if (res) {
		color = new Array(parseInt(res[1], 16), parseInt(res[2], 16), parseInt(res[3], 16));
		return color;
	}

	exp = /^#?([\da-f])([\da-f])([\da-f])$/i;
	res = exp.exec(text);
	if (res) {
		color = new Array(parseInt(res[1], 16), parseInt(res[2], 16), parseInt(res[3], 16));
		for (var i=0; i<3; i++) color[i] = color[i]*16+color[i];
		return color;
	}

	return null;
};


function color2hex(color)
{
	var hex;

	if (color == null || color.length != 3) return "";
	for (var i=0, hex=""; i<3; i++) {
		var d = "0"+Math.floor(color[i]).toString(16);
		hex += d.substr(d.length - 2, 2);
	}
	return hex;
};


function replaceRefs(string, nr, param)
{
	var index;
	while ((index = string.indexOf("$"+nr)) >= 0 && string.charAt(index-1) != '\\') {
		string = string.substr(0, index) + param + string.substr(index+2);
	}
	return string;
};




var token_href = "+0123456789";

function stripNumber(phonenr)
{
	var newnr = "";
	for (var i=0; i<phonenr.length; i++) {
		var c = phonenr.charAt(i);
		if (token_href.indexOf(c) >= 0) newnr += c;
	}
	return newnr.substr(0, digits_max);
};


var code2ndd_hashtable = null;

function create_code2ndd_hashtable()
{
	code2ndd_hashtable = new objTelifyHashtable();
	for (var i=0; i<telify_country_data.length; i++) {
		if (telify_country_data[i][0] == "") continue;
		code2ndd_hashtable.put(telify_country_data[i][0], telify_country_data[i][3]);
	}
};


function prefixNumber(cc, nr, sep)
{
	if (cc == null || cc == "") return stripNumber(nr);
	if (code2ndd_hashtable == null) create_code2ndd_hashtable();
	var ndd = code2ndd_hashtable.get(cc);
	if ((ndd.length > 0) && (nr.substr(0, ndd.length) == ndd)) nr = nr.substr(ndd.length);
	return stripNumber(cc) + sep + stripNumber(nr);
};


function stripNDDFromNumber(cc, nr)
{
	if (cc == null || cc == "") return stripNumber(nr);
	if (code2ndd_hashtable == null) create_code2ndd_hashtable();
	var ndd = code2ndd_hashtable.get(cc);
	if ((ndd.length > 0) && (nr.substr(0, ndd.length) == ndd)) nr = nr.substr(ndd.length);
	return stripNumber(nr);
};


// ---------

var tld_hashtable = null;

function create_tld_hashtable()
{
	tld_hashtable = new objTelifyHashtable();
	for (var i=0; i<telify_country_data.length; i++) {
		if (telify_country_data[i][2] == "") continue;
		var tld_list = telify_country_data[i][2].toLowerCase().split(",");
		for (var j=0; j<tld_list.length; j++) {
			tld_list[j] = trim(tld_list[j]);
			tld_hashtable.put(tld_list[j], telify_country_data[i][0]);
		}
	}
};


function tld2cc(tld)
{
	if (tld_hashtable == null) create_tld_hashtable();
	return tld_hashtable.get(tld);
};


// ---------

var cc_hashtable = null;


function create_cc_hashtable()
{
	cc_hashtable = new objTelifyHashtable();
	for (var i=0; i<telify_country_data.length; i++) {
		if (telify_country_data[i][0] == "") continue;
		cc_hashtable.put(telify_country_data[i][0], true);
	}
};


function isCCValid(cc)
{
	if (cc_hashtable == null) create_cc_hashtable();
	return cc_hashtable.get(cc) === true ? true : false;
}


// ---------

var code2name_hashtable =  null;

function create_code2name_hashtable()
{
	this.code2name_hashtable = new objTelifyHashtable();
	for (var i=0; i<telify_country_data.length; i++) {
		if (telify_country_data[i][0] == "") continue;
		var name = telify_country_data[i][1];
		var prev = this.code2name_hashtable.get(telify_country_data[i][0]);
		if (prev) name = prev + ", " + name;
		this.code2name_hashtable.put(telify_country_data[i][0], name);
	}
};


function getCountryListString(cc, nr)
{
	if (code2name_hashtable == null) create_code2name_hashtable();
	if (cc == null || cc == "") return "";
	for (var i=0; i<telify_exception.length; i++) {
		if (cc == telify_exception[i][0]) {
			for (var j=0; j<telify_exception[i][1].length; j++) {
				var area = telify_exception[i][1][j][0];
				if (nr.substr(0, area.length) == area) {
					var name = telify_exception[i][1][j][2];
					if (name[0] == ':') {
						return code2name_hashtable.get(cc) + " (" + name.substr(1) + ")";
					}
					return name;
				}
			}
		}
	}
	return code2name_hashtable.get(cc);
};


// ---------

function createDialURL(nr)
{
	var url;

	if (pref.suppress_cc.length > 0) {
		if (nr.substr(0, pref.suppress_cc.length) == pref.suppress_cc) {
			if (code2ndd_hashtable == null) create_code2ndd_hashtable();
			var ndd = code2ndd_hashtable.get(pref.suppress_cc);
			nr = ndd + nr.substr(pref.suppress_cc.length);
		}
	}
	if (nr.charAt(0) == '+') {
		if (pref.idd_prefix.length > 0) {
			nr = pref.idd_prefix + nr.substr(1);
		}	else if (pref.hreftype >= HREFTYPE_TEMPLATE && pref.escape_plus) {
			nr = "%2B" + nr.substr(1);
		}
	}
	if (pref.hreftype >= HREFTYPE_TEMPLATE) {
		if (pref.hreftype == HREFTYPE_USER) {
			url = pref.custom_url;
		} else {
			url = customTmpl[pref.hreftype - HREFTYPE_TEMPLATE][0];
		}
		url = replaceRefs(url, 0, nr);
		var label = "tmpl" + pref.hreftype;
		var params = pref.custom_param[label];
		if (params === undefined) {
			params = ["", "", ""];
		}
		for (var i=0; i<NUM_CUSTOM_PARAMS; i++) {
			url = replaceRefs(url, i+1, params[i]);
		}
	} else {
		//url = objTelifyPrefs.protoList[objTelifyPrefs.hrefType]+":"+nr;
		url = protoTmpl[pref.hreftype];
		url = replaceRefs(url, 0, nr);
	}
	return url;
};


function splitPhoneNr(nr)
{
	var index = -1;
	var maxlen = 0;
	var idd_list = ["00", "011"];
	var oldnr = nr;

	if (nr.charAt(0) != '+') {
		for (var i=0; i<idd_list.length; i++) {
			if (nr.substr(0, idd_list[i].length) == idd_list[i]) {
				nr = "+" + nr.substr(idd_list[i].length);
				break;
			}
		}
	}
	if (nr.charAt(0) != '+') return [null, oldnr];
	for (var i=0; i<telify_country_data.length; i++) {
		if (nr.substr(0, telify_country_data[i][0].length) == telify_country_data[i][0]) {
			if (telify_country_data[i][0].length > maxlen) {
				index = i;
				maxlen = telify_country_data[i][0].length;
			}
		}
	}
	if (index >= 0) {
		var cc = telify_country_data[index][0];
		return [cc, nr.substr(cc.length)];
	}
	return [null, oldnr];
};


function encode(str) {
  var buf = [];
  for (var i=str.length-1;i>=0;i--) {
    buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
  }
  return buf.join('');
};


function dialNumber(nr)
{
	if (pref.hrefType < HREFTYPE_TEMPLATE) return;

	var url = createDialURL(nr);

	var label = "tmpl" + pref.hreftype;
	var opentype = pref.custom_opentype[label];
	if (opentype === undefined) {
		opentype = OPENTYPE_SILENT;
	}

	if (opentype == OPENTYPE_SILENT) {
		if (startsWith(url, "http:") && document.location.protocol == "https:") {
			opentype = OPENTYPE_TAB_FOCUS;
		}
	}

	if (opentype == OPENTYPE_WINDOW) {
    chrome.runtime.sendMessage({
    	'message': 'openWindow',
    	'url': url,
			'active': true
    });
	} else if (opentype == OPENTYPE_TAB_BG) {
    chrome.runtime.sendMessage({
    	'message': 'createTab',
    	'url': url,
			'active': false
    });
	} else if (opentype == OPENTYPE_TAB_FOCUS) {
    chrome.runtime.sendMessage({
    	'message': 'createTab',
    	'url': url,
			'active': true
    });
	} else {
		var requ = new XMLHttpRequest();
		requ.addEventListener('error', function(e) {
	    console.log("error:", e);
			telifyMessageBox("Dial Error", "Error opening URL<br><tt>"+url.replace("/", "&zwnj;/")+"</tt>", TMBTYPE_ERROR);
		});
		try {
			requ.open("GET", url, true);
			requ.send(null);
		} catch (e) {
			console.log("name: "+e.name+" message:"+e.message+" description:"+e.description);
		}
	}

};

// -------------




function getFlagFromNr(code, nr)
{
	for (var i=0; i<telify_exception.length; i++) {
		if (code == telify_exception[i][0]) {
			for (var j=0; j<telify_exception[i][1].length; j++) {
				var area = telify_exception[i][1][j][0];
				if (nr.substr(0, area.length) == area) {
					return telify_exception[i][1][j][1];
				}
			}
		}
	}
	return code.substr(1);
};


function getHost(doc)
{
	try {
		return doc.location.host.toLowerCase();
	} catch (e) {
		return null;
	}
};


function getHostTLD()
{
	var host = getHost(document);
	if (host) {
		var index = host.lastIndexOf('.');
		if (index >= 0) {
			var tld = host.substr(index+1);
			if (tld.length) return tld;
		}
	}
	return null;
};


var voipProtoList = [
	"tel:",
	"callto:",
	"skype:",
	"sip:",
	"phone:"
];

function isVoIPURL(url) {
	if (url == null) return false;
	for (var i=0; i<voipProtoList.length; i++) {
		if (url.substring(0, voipProtoList[i].length) == voipProtoList[i]) {
			return true;
		}
	}
	return false;
}

