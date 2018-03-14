
function getFlagFromNr(cc, nr)
{
	for (var i=0; i<telify_exception.length; i++) {
		if (cc == telify_exception[i][0]) {
			for (var j=0; j<telify_exception[i][1].length; j++) {
				var area = telify_exception[i][1][j][0];
				if (nr.substr(0, area.length) == area) {
					return telify_exception[i][1][j][1];
				}
			}
		}
	}
	return cc.substr(1);
};



function getFlagCode(cc, nr)
{
	if (cc == "") return "empty";
	for (var i=0; i<telify_country_data.length; i++) {
		if (telify_country_data[i][0] == cc) {
			return getFlagFromNr(cc, nr);
		}
	}
	return "empty";
}
