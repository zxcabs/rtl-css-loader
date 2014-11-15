/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var css = require("css");
var SourceNode = require("source-map").SourceNode;
var SourceMapConsumer = require("source-map").SourceMapConsumer;
var loaderUtils = require("loader-utils");

module.exports = function(content, map) {
	this.cacheable && this.cacheable();
	var result = [];
	var cssRequest = loaderUtils.getRemainingRequest(this);
	var query = loaderUtils.parseQuery(this.query);
	var root = query.root;
	var forceMinimize = query.minimize;
	var importLoaders = parseInt(query.importLoaders, 10) || 0;
	var minimize = typeof forceMinimize !== "undefined" ? !!forceMinimize : (this && this.minimize);
	var genSourceMap = query.sourceMap;

	var tree = css.parse(content, {
		source: cssRequest
	});

	var imports = extractImports(tree.stylesheet);
	annotateUrls(tree);

	imports.forEach(function(imp) {
		if(!loaderUtils.isUrlRequest(imp.url)) {
			result.push("exports.push([module.id, " + JSON.stringify("@import url(" + imp.url + ");") + ", " + JSON.stringify(imp.media.join("")) + "]);");
		} else {
			var importUrl = "-!" +
				this.loaders.slice(
					this.loaderIndex,
					this.loaderIndex + 1 + importLoaders
				).map(function(x) { return x.request; }).join("!") + "!" +
				loaderUtils.urlToRequest(imp.url);
			result.push("require(" + JSON.stringify(require.resolve("./mergeImport")) + ")(exports, require(" + JSON.stringify(importUrl) + "), " + JSON.stringify(imp.media.join(" ")) + ");");
		}
	}, this);


	var cssResult = css.stringify(tree, {
		compress: !!minimize,
		sourcemap: genSourceMap
	});
	var cssString = JSON.stringify(genSourceMap ? cssResult.code : cssResult);
	var uriRegExp = /%CSSURL\[%(.*?)%\]CSSURL%/g;
	cssString = cssString.replace(uriRegExp, function(str) {
		var match = /^%CSSURL\[%(["']?(.*?)["']?)%\]CSSURL%$/.exec(JSON.parse('"' + str + '"'));
		var url = loaderUtils.parseString(match[2]);
		if(!loaderUtils.isUrlRequest(match[2], root)) return JSON.stringify(match[1]).replace(/^"|"$/g, "");
		var idx = url.indexOf("?#");
		if(idx < 0) idx = url.indexOf("#");
		if(idx > 0) {
			// in cases like url('webfont.eot?#iefix')
			var request = url.substr(0, idx);
			return "\"+require(" + JSON.stringify(loaderUtils.urlToRequest(request, root)) + ")+\"" + url.substr(idx);
		} else if(idx === 0) {
			// only hash
			return JSON.stringify(match[1]).replace(/^"|"$/g, "");
		}
		return "\"+require(" + JSON.stringify(loaderUtils.urlToRequest(url, root)) + ")+\"";
	});
	if(genSourceMap) {
		var request = loaderUtils.getCurrentRequest(this);

		if(map) {
			var node = SourceNode.fromStringWithSourceMap(cssResult.code, new SourceMapConsumer(cssResult.map));
			node.applySourceMap(map);
			map = node.toStringWithSourceMap({
				file: request
			}).map.toString();
		} else {
			map = JSON.stringify(cssResult.map);
		}
		result.push("exports.push([module.id, " + cssString + ", \"\", " + map + "]);");
	} else {
		result.push("exports.push([module.id, " + cssString + ", \"\"]);");
	}
	return "exports = module.exports = require(" + JSON.stringify(require.resolve("./cssToString")) + ")();\n" +
		result.join("\n");
}

function parseImport(str) {
	var m = /^\s*url\s*\(([^\)]+|\s*"[^"]"\s*|\s*'[^']'\s*)\)\s*(.*)$/i.exec(str);
	if(!m) return;
	return {
		url: loaderUtils.parseString(m[1].trim()),
		media: m[2].split(/\s+/)
	};
}

function extractImports(tree) {
	var results = [];
	for(var i = 0; i < tree.rules.length; i++) {
		var rule = tree.rules[i];
		if(rule.type === "import") {
			var imp = parseImport(rule.import);
			if(!imp) continue;
			results.push(imp);
			tree.rules.splice(i, 1);
			i--;
		}
	}
	return results;
}

function annotateUrls(tree) {
	function iterateChildren(children) {
		for(var i = 0; i < children.length; i++) {
			annotateUrls(children[i]);
		}
	}
	switch(tree.type) {
	case "stylesheet": return iterateChildren(tree.stylesheet.rules);
	case "rule": return iterateChildren(tree.declarations);
	case "document": return iterateChildren(tree.rules);
	case "font-face": return iterateChildren(tree.declarations);
	case "host": return iterateChildren(tree.rules);
	case "keyframes": return iterateChildren(tree.keyframes);
	case "keyframe": return iterateChildren(tree.declarations);
	case "media": return iterateChildren(tree.rules);
	case "page": return iterateChildren(tree.declarations);
	case "supports": return iterateChildren(tree.rules);
	case "declaration":
		tree.value = tree.value.replace(/url\s*\(([^\)]+|\s*"[^"]"\s*|\s*'[^']'\s*)\)/ig, function(match) {
			var m = /^url\s*\(([^\)]+|\s*"[^"]"\s*|\s*'[^']'\s*)\)$/i.exec(match);
			return "url(%CSSURL[%" + m[1].trim() + "%]CSSURL%)";
		});
	}
}

