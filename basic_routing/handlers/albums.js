var express = require( "./helpers.js" ),
	async   = require( "async" ),
	helpers = require('./helpers.js')
	fs      = require( "fs" );

exports.version = "0.1.0";

exports.list_all = function( req, res ) {
	load_album_list( function( err, list ) {
		if( err ) {
			helpers.send_failure( res, 500, helpers.make_error( "no album" ) );
			return;
		}
		helpers.send_success( res, { albums: list } );

	} );
}

exports.album_by_name = function( req, res ) {
	var params = req.query;
	//console.log( params )
	var page_num   = parseInt(params.page,10) || 0;
	var page_size  = parseInt(params.size,10) || 1000;
	var album_name = req.params.album_name;

	load_album( album_name, page_num, page_size, function( err, album_contents ) {
		if( err && err.message === "no_such_album" ) {
			helpers.send_failure( res, 404, err );
		}
		else if( err  ) {
			helpers.send_failure( res, 500, err );
		}
		helpers.send_success( res, { album_data: album_contents } );
	} );
}

function load_album_list( callback ) {
	fs.readdir( "albums/", function( err, directories ) {
		if( err ) {
			callback( helpers.make_error( "file_error", JSON.stringify( err) ) , null );
			return;
		}
		var only_dirs = [];
		async.forEach( directories,
			function( directory, cb ){
				fs.stat( "albums/" + directory, function( err, stats ) {
					if( err ) {
						cb( helpers.make_error("file_error", JSON.stringify(err)));
						return;
					}
					if( stats.isDirectory() === true ) {
						only_dirs.push( {
							"name": directory 
						} );
					}
					cb( null );
				} )
			},
			function( err ) {
				callback( err, err ? null: only_dirs ); 
			}
		);
	} )
}

function load_album( album, page, size, callback ) {
	fs.readdir( "albums/" + album + "/", function( err, list ) {
		if( err ) {
			if (err.code == "ENOENT") {
                callback(helpers.no_such_album());
            } 
            else {
                callback(helpers.make_error("file_error",
                                            JSON.stringify(err)));
            }
			return;
		}
		var only_files = [];
		async.forEach(
            list,
            function (element, cb) {
                fs.stat(
                    "albums/" + album + "/" + element,
                    function (err, stats) {
                        if (err) {
                            cb(helpers.make_error("file_error",
                                                  JSON.stringify(err)));
                            return;
                        }
                        if (stats.isFile()) {
                            var obj = { filename: element,
                                        desc: element };
                            only_files.push(obj);
                        }
                        cb(null);
                    } );
                },
                function (err) {
	                if (err) {
	                    callback(err);
	                } else {
	                    var ps = size;
	                    var photos = only_files.splice(page * ps, ps);
	                    var obj = { short_name: album,
	                                photos: photos };
	                    callback(null, obj);
	                }
	            }                  
        );
	} );
}
