
const TRIAL_PERIOD_DAYS = 31;


var ga_service = analytics.getService('Telify');
var ga_tracker = ga_service.getTracker('UA-91091505-1');



chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.message == 'pageBlacklisted') {
		ga_tracker.sendEvent("page", "blacklisted");
	}
	if (request.message == 'parseNumberCount') {
		ga_tracker.sendEvent("parse", "number", "count", request.count);
	}
	if (request.message == 'reparseNumberCount') {
		ga_tracker.sendEvent("reparse", "number", "count", request.count);
	}

	if (request.message == 'setBadgeText') {
		chrome.browserAction.setBadgeText({"text":request.text, "tabId":sender.tab.id});
	}
	if (request.message == 'setBadgeBackgroundColor') {
		chrome.browserAction.setBadgeBackgroundColor({"color":request.text, "tabId":sender.tab.id});
	}
	if (request.message == 'setBadgeTooltip') {
		chrome.browserAction.setTitle({"title":request.text, "tabId":sender.tab.id});
	}

	if (request.message == 'createTab') {
		chrome.tabs.create({
			'url': request.url,
			'active': request.active
		}, function (tab) {
			console.log("tab created: "+request.url);
		});
	}
	if (request.message == 'openWindow') {
		chrome.windows.create({
			'url': request.url,
			'focused': request.active
		}, function() {
			console.log("window created: "+request.url);
		});
	}
});


function checkLicense(license)
{
	if (license.result && license.accessLevel == "FULL") {
	  //console.log("Fully paid & properly licensed.");
	  return "FULL";
	} else if (license.result && license.accessLevel == "FREE_TRIAL") {
	  var daysAgoLicenseIssued = Date.now() - parseInt(license.createdTime, 10);
	  daysAgoLicenseIssued = daysAgoLicenseIssued / 1000 / 60 / 60 / 24;
    console.log("Installed "+daysAgoLicenseIssued+" days ago");
	  if (daysAgoLicenseIssued <= TRIAL_PERIOD_DAYS) {
	    //console.log("Free trial, still within trial period");
	    return "FREE_TRIAL";
	  } else {
	    //console.log("Free trial, trial period expired.");
	    return "FREE_TRIAL_EXPIRED";
	  }
	}
  console.log("No license ever issued.");
  return "NONE";
}


chrome.storage.sync.get(pref_default, function(item) {
	pref = item;

	if (pref.use_analytics)	{
		ga_tracker.sendAppView('AppStart');
		ga_service.getConfig().addCallback(function(config) {config.setTrackingPermitted(true);});
	} else {
		ga_service.getConfig().addCallback(function(config) {config.setTrackingPermitted(false);});
	}

	var daysAgoLicenseRead = (Date.now() - pref.license.lastRead) / 1000 / 60 / 60 / 24;
	if (daysAgoLicenseRead > 7 || pref.license.accessLevel != "FULL") {
		chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
			//console.log(token);
			var CWS_LICENSE_API_URL = 'https://www.googleapis.com/chromewebstore/v1.1/userlicenses/';
			var req = new XMLHttpRequest();
			req.open('GET', CWS_LICENSE_API_URL + chrome.runtime.id);
			req.setRequestHeader('Authorization', 'Bearer ' + token);
			req.onreadystatechange = function() {
			  if (req.readyState == 4) {
			  	//console.log(req.responseText);
			    var license = JSON.parse(req.responseText);
			    license.lastRead = Date.now();
			    license.status = checkLicense(license);
			    pref.license = license;
			    chrome.storage.sync.set(pref);
			  }
			}
			req.send();
		});
	} else {
	  pref.license.status = checkLicense(pref.license);
	  chrome.storage.sync.set(pref);
	}
});

