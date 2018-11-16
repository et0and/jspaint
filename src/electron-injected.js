// Electron-specific code injected into the renderer process
// to provide integrations, for the desktop app

// so libraries don't get confused and export to `module` instead of the window
global.module = undefined;

// (TODO: stop trying to shim saveAs; instead make a wrapper. This approach won't make sense
// once allowing the user to choose a file type in the save dialog, because we don't want to take and convert a blob,
// we want to simply encode the correct file type from the image data directly)
var dialog = require("electron").remote.dialog;
var fs = require("fs");
window.saveAs = function(blob, fileName){
	var fileWriter = {}; // not gonna be going with this approach so let's not bother with events
	var splitByDots = fileName.split(/\./g);
	var extension = splitByDots[splitByDots.length - 1].toLowerCase();
	var filterName = {
		"jpg": "JPEG",
		// "jpeg": "JPEG",
		// "gif": "GIF",
		"tif": "TIFF",
		// "png": "PNG",
		// "apng": "Animated PNG",
	}[extension] || extension.toUpperCase();
	var filterExtensions = {
		// "Monochrome Bitmap": ["bmp", "dib"],
		// "16 Color Bitmap": ["bmp", "dib"],
		// "256 Color Bitmap": ["bmp", "dib"],
		// "24-bit Bitmap": ["bmp", "dib"],
		"JPEG": ["jpg", "jpeg", "jpe", "jfif"],
		// "GIF": ["gif"],
		"TIFF": ["tif", "tiff"],
		// "PNG": ["png"],
		// "Animated PNG": ["apng"] // also "png"...
	}[filterName] || [extension];
	// TODO: pass BrowserWindow to make dialog modal?
	// TODO: pass defaultPath of last opened file (w/ different file name)?
	// also maybe sanitize fileName?
	dialog.showSaveDialog({
		// title: "Save As",
		defaultPath: fileName,
		// TODO: show multiple possible file types to save as
		// and then use the resulting filePath to determine the file type to save as
		filters: [{name: filterName, extensions: filterExtensions}]
	}, function(filePath) {
		if(!filePath){
			return; // user canceled
		}
		
		blob_to_buffer(blob, function(err, buffer){
			if(err){
				return show_error_message("Failed to save! (Technically, failed to convert a Blob to a Buffer.)", err);
			}
			fs.writeFile(filePath, buffer, function(err){
				if(err){
					return show_error_message("Failed to save file!", err);
				}
			});
		});
	});
	return fileWriter; // not doing events, but we can prevent an error
};
