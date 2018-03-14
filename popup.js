
var blacklist;
var host;

document.getElementById("btn_open_options").addEventListener("click", function() {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL('options.html'));
  }
});


chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
}, function(array_of_Tabs) {
    var tab = array_of_Tabs[0];
    host = tab.url.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];    /* */

    chrome.storage.sync.get({blacklist: []}, function(item) {
    	blacklist = item.blacklist;
    	var btn = document.getElementById("btn_toggle_blacklist");
    	var icon = document.getElementById("img_toggle_blacklist");
    	var index = blacklist.indexOf(host);
    	if (index >= 0) {
		    btn.innerText = "Enable on this site";
		    icon.src = "images/icon_enabled.png";
		    btn.addEventListener("click", function() {
		    	blacklist.splice(index, 1);
		    	chrome.storage.sync.set({blacklist: blacklist}, function() {});
		    	window.close();
		    	chrome.tabs.reload(tab.id);
				});
		  } else {
		    btn.innerText = "Disable on this site";
		    icon.src = "images/icon_disabled.png";
		    btn.addEventListener("click", function() {
		    	blacklist.push(host);
		    	chrome.storage.sync.set({blacklist: blacklist}, function() {});
		    	window.close();
		    	chrome.tabs.reload(tab.id);
				});
		  }
    });

		chrome.tabs.sendMessage(tab.id, {"message": "getNumberList"}, function(response) {
				if (response === undefined || response.length == 0) return;
				document.getElementById("table_sep").removeAttribute("style");
				var popup_table = document.getElementById("popup_table");
				for (var i=0; i<response.length; i++) {
					var node = document.createElement("tr");
					var td = document.createElement("td");
					node.appendChild(td);
					td = document.createElement("td");
					var a = document.createElement("a");
					a.setAttribute("href", response[i].url);
					a.setAttribute("id", response[i].id);
					var text = document.createTextNode(response[i].text);
					a.appendChild(text);
					a.addEventListener("click", function(event) {
						var id = event.target.getAttribute("id");
						chrome.tabs.sendMessage(tab.id, {"message": "scrollIntoView", "id": id});
						window.close();
					}, true);
					td.appendChild(a);
					node.appendChild(td);
					popup_table.appendChild(node);
				}
			}
		);
});

