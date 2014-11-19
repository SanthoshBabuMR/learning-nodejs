var fs = require('fs'),
	album = require('./albums.js'),
	path = require('path');

exports.version = "1.0.0";
exports.create_album = function( path ) {
	return new Album(path);
}
exports.albums = function( root, callback ) {
	fs.readdir( root, function( err, files) {
		if( err ) {
			callback( err );
			return;
		}
		var album_list = [];
		(function iterator( index ) {
			fs.stat( root + "albums/" + files[index], function( err, stat) {
				if( err ){
					callback( err );
					return;
				}
				if( stat.isDirectory() === true ) {
					var p = root + "albums/" + files[index];
					album_list.push( album.create_album( p ) );
				}
				iterator( index + 1 );
			} )
		})(0)
	} );
};

function Album( album_path ) {
	this.name = path.basename( album_path );
	this.path = album_path;
}

Album.prototype.name = null;
Album.prototype.path = null;
Album.prototype._photos = null;


Album.prototype.photos = function( callback ) {
	if( this._photos !== null ) {
		callback( null, this._photos );
		return;
	}
	var self = this;
	fs.readdir( self.path, function( err, files ) {
		if( err ) {
			callback( err );
			return;
		}
		var only_files = [];
		(function iterator(index) {
			if( index === files.length ) {
				self._photos = only_files;
				callback( null, self._photos );
				return;
			}
			fs.stat( self.path + "/" + files[index], function( err, stats) {
				if( err ) {
					callback( err );
					return;
				}
				if( stats.isFile() === true ) {
					only_files.push( files[index] );
				}
				iterator( index + 1 );
			} );
		})(0);
	} );
}

