

function startsWith(s, pattern) {
	return s.substring(0, pattern.length) == pattern;
}


function create_id() {
	return "id" + Math.floor((1 + Math.random()) * 0x100000000).toString(16).substring(1);
}


function usesHttp(url) {
	return startsWith(url, "http://") || startsWith(url, "https://");
}


function trim(s)
{
  s = s.replace(/^\s*(.*)/, "$1");
  s = s.replace(/(.*?)\s*$/, "$1");
  return s;
};
