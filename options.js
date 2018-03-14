
var	custom_url = "";
var custom_param = {};
var custom_opentype = {};


function update_custom() {
	var hreftype = document.getElementById('hreftype').value;
	if (hreftype < HREFTYPE_TEMPLATE) {
		$( ".custom" ).css("display", "none");
	} else {
		$( ".custom" ).css("display", "");

		if (hreftype == HREFTYPE_USER) {
			var template = custom_url;
		} else {
			var template = customTmpl[hreftype - HREFTYPE_TEMPLATE][0];
		}
		var url = replaceRefs(template, 0, "[phonenr]");
		var label = "tmpl" + hreftype;

		var params = custom_param[label];
		if (params === undefined) {
			params = ["", "", ""];
		}
		for (var i=0; i<NUM_CUSTOM_PARAMS; i++) {
			url = replaceRefs(url, i+1, params[i]);
		}
		document.getElementById('template').value = template;
		document.getElementById('template').disabled = (hreftype != HREFTYPE_USER);
		document.getElementById('example').value = url;
		for (var i=0; i<NUM_CUSTOM_PARAMS; i++) {
			document.getElementById('tmpl_arg'+(i+1)).value = params[i];
		}
		if (hreftype == HREFTYPE_USER) {
			for (var i=0; i<NUM_CUSTOM_PARAMS; i++) {
				document.getElementById('tmpl_label'+(i+1)).innerText = "Parameter #"+(i+1);
			}
		} else {
			for (var i=0; i<NUM_CUSTOM_PARAMS; i++) {
				document.getElementById('tmpl_label'+(i+1)).innerText = customTmpl[hreftype - HREFTYPE_TEMPLATE][1][i];
			}
		}
		var opentype = custom_opentype[label];
		if (opentype === undefined) {
			opentype = OPENTYPE_SILENT;
		}
		document.getElementById('custom_opentype').value = opentype;
		document.getElementById('custom_opentype').disabled = (usesHttp(url) == false);
	}
}


function apply_custom() {
	var hreftype = document.getElementById('hreftype').value;
	if (hreftype < HREFTYPE_TEMPLATE) return;
	var label = "tmpl" + hreftype;
	custom_param[label] = [
		document.getElementById('tmpl_arg1').value,
		document.getElementById('tmpl_arg2').value,
		document.getElementById('tmpl_arg3').value
	];
	custom_opentype[label] = document.getElementById('custom_opentype').value,
	console.log(custom_param);
	if (hreftype == HREFTYPE_USER) {
		custom_url = document.getElementById('template').value;
	}
}


function update_example() {
	var template = document.getElementById('template').value;
	var url = replaceRefs(template, 0, "[phonenr]");
	for (var i=0; i<NUM_CUSTOM_PARAMS; i++) {
		var param = document.getElementById('tmpl_arg'+(i+1)).value
		url = replaceRefs(url, i+1, param);
	}
	document.getElementById('example').value = url;
	document.getElementById('custom_opentype').disabled = (usesHttp(url) == false);
}




function save_options(close_after_save) {
  var hreftype = document.getElementById('hreftype').value;
  //var dialcc = document.getElementById('dialcc').value;
  //var dialwocc = document.getElementById('dialwocc').value;
  var highlight = document.getElementById('highlight').value;
  var num_history = document.getElementById('num_history').value;
  var idd_prefix = document.getElementById('idd_prefix').value;
  var suppress_cc = document.getElementById('suppress_cc').value;
  var rewrite_voip_urls = document.getElementById('rewrite_voip_urls').value;
  var reparse_dynamic = document.getElementById('reparse_dynamic').value;
  var use_analytics = document.getElementById('use_analytics').value;
  apply_custom();
  chrome.storage.sync.set({
    hreftype: hreftype,
    //dialcc: dialcc,
    //dialwocc: dialwocc,
    highlight: highlight,
    num_history: num_history,
    idd_prefix: idd_prefix,
    suppress_cc: suppress_cc,
    custom_url: custom_url,
    custom_param: custom_param,
    custom_opentype: custom_opentype,
    rewrite_voip_urls: rewrite_voip_urls,
    reparse_dynamic: reparse_dynamic,
    use_analytics: use_analytics,
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved';
    setTimeout(function() {
      status.textContent = '';
      if (close_after_save) {
      	window.close();
      }
    }, 750);
  });
}


function restore_options() {
  chrome.storage.sync.get(pref_default, function(items) {
  	console.log(items);
    document.getElementById('hreftype').value = items.hreftype;
    //document.getElementById('dialcc').value = items.dialcc;
    //document.getElementById('dialwocc').value = items.dialwocc;
    document.getElementById('highlight').value = items.highlight;
    document.getElementById('num_history').value = items.num_history;
    document.getElementById('idd_prefix').value = items.idd_prefix;
    document.getElementById('suppress_cc').value = items.suppress_cc;
    document.getElementById('rewrite_voip_urls').value = items.rewrite_voip_urls;
    document.getElementById('reparse_dynamic').value = items.reparse_dynamic;
    document.getElementById('use_analytics').value = items.use_analytics;
    custom_url = items.custom_url;
    custom_param = items.custom_param;
    custom_opentype = items.custom_opentype;
    update_custom();
  });
}

function close_options() {
	window.close();
}


document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('btn_save').addEventListener('click', function() {save_options(true);});
document.getElementById('btn_apply').addEventListener('click', function() {save_options(false);});
document.getElementById('btn_cancel').addEventListener('click', close_options);

document.getElementById('hreftype').addEventListener('change', update_custom);

document.getElementById('template').addEventListener('keyup', update_example);

document.getElementById('tmpl_arg1').addEventListener('keyup', update_example);
document.getElementById('tmpl_arg2').addEventListener('keyup', update_example);
document.getElementById('tmpl_arg3').addEventListener('keyup', update_example);

