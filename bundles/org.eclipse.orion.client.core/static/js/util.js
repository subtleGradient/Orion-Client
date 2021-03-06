/*******************************************************************************
 * Copyright (c) 2009, 2010 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors: IBM Corporation - initial API and implementation
 *******************************************************************************/
 
"use strict";
 
dojo.require("dojo.hash");

// FIXME this doesn't really belong here anymore, it belongs in the glue.
// However there were timing problems when moving it over, will figure it
// out later.
dojo.addOnLoad(function () {
	dojo.xhrGet({
		url: "/auth2",
		handleAs: 'javascript',
        sync:true,
        headers: {
			"Orion-Version" : "1"
		}
	});
});

/**
 * @namespace The global container for eclipse APIs.
 */ 
var eclipse = eclipse || {};

/**
 * Utility methods
 * @namespace eclipse.util holds stateless utility methods.
 */
 
eclipse.util = eclipse.util || {};

eclipse.util.getPositionInfo = 
	function(fileString) {
		var filePath, start, end, line, offset, length;
		// most likely this is just the hash portion of a URL.  In case not...
		var hashSegments = fileString.split('#');
		var postHash = hashSegments[hashSegments.length - 1];
		var querySegments = postHash.split('?');
		filePath = eclipse.util.makeRelative(querySegments[0]);
		if (querySegments.length > 1) {
			var segments = querySegments[1].split('&');
			for (var i = 0; i < segments.length; i++) {
				var subsegments = segments[i].split('=');
				if (subsegments.length > 1) {
					switch (subsegments[0]) {
					case 'char':
						var positions = subsegments[1].split(',');
						if (line === undefined) {
							start = parseInt(positions[0]);
							if (positions.length > 1) {
								end = parseInt(positions[1]);
							}
						} else {
							offset = positions[0];
							if (positions.length > 1) {
								length = parseInt(positions[1] - offset);
							}
						}
						break;
					case 'line':
						var positions = subsegments[1].split(',');
						line = parseInt(positions[0]);
						break;
					default:
						// ignore anything unrecognized
						break;
					}
				}  // ignore any unrecognized segments without '='
			}
		}
		return {"filePath": filePath, "start": start, "end": end, "line": line, "offset": offset, "length": length};
	};
	   	
/**
 * Construct a URL hash that represents the given file path at the given position,
 * with the specified selection range. 
 * @param {String} path of the file on the server
 * @param {Number} starting position within the content of the file
 * @param {Number} ending position of selection within the content of the file
 * @param {Number} line number within the content of the file, used only when no start is specified
 * @param {Number} offset within the line number, used only when line is specified
 * @param {Number} length of the selection, used to compute the ending point from a start or line offset
 */
eclipse.util.hashFromPosition = function(filePath, start, end, line, offset, length) {
	if (typeof(start) === "number") {
		var hash = '#' + filePath + "?char=" + start;
		if (typeof(end) === "number") {
			hash = hash + "," + end;
		} else if (typeof(length) === "number") {
			hash = hash +  "," + (start + length);
		}
		return hash;
	}
	if (typeof(line) === "number") {
		var hash = '#' + filePath + "?line=" + line;
		if (typeof(offset) === "number") {
			hash = hash + "&char=" + offset;
			if (typeof(length) === "number") {
				hash = hash + "," + (offset + length);
			}
		}
		return hash;
	}
	return "#"+filePath;
};
	
eclipse.util.makeRelative = function(location) {
	if (!location) {
		return location;
	}
	var nonHash = window.location.href.split('#')[0];
	var hostName = nonHash.substring(0, nonHash.length - window.location.pathname.length);
	if (location.indexOf(hostName) === 0) {
		return location.substring(hostName.length);
	}
	return location;
};

eclipse.util.makeFullPath = function(location) {
	if (!location) {
		return location;
	}
	var nonHash = window.location.href.split('#')[0];
	var hostName = nonHash.substring(0, nonHash.length - window.location.pathname.length);
	return (hostName + location);
};

/**
 * Determines if the path represents the workspace root
 */
eclipse.util.isAtRoot = function(path) {
	var relative = this.makeRelative(path);
	// TODO better way?
	// I thought it should be the line below but is actually the root of all workspaces
	//  return relative == '/file/';
	return relative.indexOf('/workspace') === 0;
};


eclipse.util.processNavigatorParent = function(parentItem, jsonData) {
	var fileChildren = jsonData.Children;
	parentItem.children = [];
	for (var e in fileChildren) {
		var child = fileChildren[e];
		child.parent=parentItem;
		parentItem.children.push(child);
	}
	// not ideal, but for now, sort here so it's done in one place.
	// this should really be something pluggable that the UI defines
	parentItem.children = parentItem.children.sort(function(a, b) {
		var isDir1 = a.Directory;
		var isDir2 = b.Directory;
		if (isDir1 !== isDir2) {
			return isDir1 ? -1 : 1;
		}
		var n1 = a.Name && a.Name.toLowerCase();
		var n2 = b.Name && b.Name.toLowerCase();
		if (n1 < n2) { return -1; }
		if (n1 > n2) { return 1; }
		return 0;
	}); 
}