const HREFTYPE_TEL = 0,
	HREFTYPE_CALLTO = 1,
	HREFTYPE_SKYPE = 2,
	HREFTYPE_SIP = 3,
	HREFTYPE_PHONE = 4,
	HREFTYPE_TKSUITE = 5,
	HREFTYPE_TEMPLATE = 100,
	HREFTYPE_USER = 199;

const OPENTYPE_SILENT = 0,
	OPENTYPE_WINDOW = 1,
	OPENTYPE_TAB_FOCUS = 2,
	OPENTYPE_TAB_BG = 3;


const NUM_CUSTOM_PARAMS = 3;
const MAX_NUM_HISTORY = 10;

var protoTmpl = [
	"tel:$0",
	"callto:$0",
	"skype:$0?call",
	"sip:$0",
	"phone:$0",
	"tksuite:$0?call"
];

var customTmpl = [
	// snom phones
	["http://$1/command.htm?number=$0&outgoing_uri=$2", ["Phone IP", "Outgoing URI", ""]],
	// CPBX
	["http://$1/api.php?number=$0&user=$2&key=$3", ["IP-Address Phoneserver", "Extension", "Security-Key"]]
];



var pref_default = {
	debug: 0,
	hreftype: HREFTYPE_SKYPE,
	dialcc: 1,
	dialwocc: 0,
	highlight: 25,
	num_history: 5,
	idd_prefix: "",
	suppress_cc: "",
	blacklist: [],
	history: [],
	custom_url: "",
	custom_param: {},
	custom_opentype: {},
	rewrite_voip_urls: 1,
	escape_plus: 1,
	reparse_dynamic: 1,
	use_analytics: 1,
	license: {
		"lastRead": 0,
		"result": false,
		"accessLevel": "NONE"
	}
};

var pref;


function updateDialHistory(cc)
{
	if (cc == null || cc == "") return;
	//console.log("updateDialHistory("+cc+")");
	var new_history = [cc];
	for (var i=0; i<pref.history.length; i++) {
		if (pref.history[i] == cc) continue;
		new_history.push(pref.history[i]);
	}
	new_history.slice(0, MAX_NUM_HISTORY);
  chrome.storage.sync.set({
    history: new_history
  }, function() {
  	pref.history = new_history;
  });
}

