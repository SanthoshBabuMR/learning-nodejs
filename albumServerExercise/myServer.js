var http = require( "http" ),
	url  = require( "url" ),
	fs   = require( "fs" ),
	qs   = require( "querystring" );

function handle_albums_list( req, res ) {
	var album = req.url.replace( /(?:\/)|(?:\.json)/g,"" );
	load_album_list( album, function( err, list ) {
		if( err !== undefined && err !== null ) {
			send_failure( res, 404, err || "No Matching Album" );
		}
		var data = {
			album_list : list
		}
		send_success( res, data )
	} );
}

function load_album_list( album, callback ) {
	fs.readdir( album, function( err, data) {
		if( err ) {
			callback( err );
			return;
		}
		var only_dirs = [];
		(function iterator( index ) {
			if( index === data.length ) {
				callback( null, only_dirs );
				return;
			}
			fs.stat( album + "/" + data[index], function( err, s ) {
				if( err ) {
					callback( err );
					return;
				}
				if( s.isDirectory() === true ) {
					only_dirs.push( data[index] );
				}
				iterator( index + 1 );
			} );			
		})( 0 );		
	} )
}

function load_album( albumName, page, page_size, callback ) {
	fs.readdir( "albums/" + albumName, function( err, list ){
		if( err ) {
			callback( err );
			return;
		}
		var output = {
			album: albumName,
			details: []
		};

		(function iterator( index ) {
			if( index === list.length ) {
				if( page !== undefined && page_size !== undefined ) {
					page = parseInt( page, 10 );
					page_size = parseInt( page_size, 10 );
					console.log( page * page_size )
					console.log( ( page*page_size ) + page_size)
					output.details = output.details.slice( page*page_size, ( page*page_size ) + page_size );
				}
				callback( null, output );
			}
			fs.stat( "albums/" + albumName + "/" + list[index] , function( err, stat ) {
				if( err ) {
					callback( err );
					return;
				}
				if( stat.isFile() === true ) {
					output.details.push({
						name: list[index],
						desc: list[index]
					})
				}
				iterator( index + 1 );
			} );			
		})( 0 );		
	} )
}

function rename_album( album, name, callback ) {
	fs.rename( "albums/" + album, "albums/" + name, callback );
}

function handle_album( req, res ) {
	var albumName = req.url.replace(/(\/albums\/)|(\.json(?:.)*)/g,"");
	load_album( albumName, req.parsedUrl.query.page, req.parsedUrl.query.page_size,  function( err, data ) {
		if( err ) {
			send_failure( res, 404, err || "No such album" )
		}
		send_success( res, data );
	} );
}

function handle_album_rename( req, res ) {
	var coreUrl = url.parse( req.url ).pathname;
	var parts = coreUrl.split("/");
	if( parts.length !== 4 ){
		send_failure( res, 404, "invalid request");
		return;
	}
	var albumName = parts[2];
	var json_body = "";
	req.on( "readable", function() {
		var data = req.read();
		if( typeof data === "string" ) {
			json_body = json_body + data;
		}
		if( typeof data === "object" && data instanceof Buffer ){
			json_body = json_body + data.toString( "utf-8" ); 
		}
	} );
	req.on( "end", function() {
		if( json_body ) {
			try {
				var json = JSON.parse( json_body );
			}
			catch( e ) {
				callback( {
					error: "invalid_json",
					message: "The body is not a valid json"
				} )
			}
		}
		else {
			callback( {
				error: "no_body",
				message: "We did not receive any JSON"
			} )
		}
		rename_album( albumName, json.album_name, function( err, data ) {
			if( err ) {
				send_failure( res, 404, err );
				return
			}
			send_success( res, "renamed album" );
		} );
	} );

	
}

function handleReqRes( req, res ) {
	var method = req.method;
	var reqUrl = req.url;
	req.parsedUrl = url.parse(req.url, true);
	var coreUrl = req.parsedUrl.pathname;
	console.log( method + " " + reqUrl );
	if( coreUrl === "/albums.json" && req.method.toLowerCase() === "get" ) {
		handle_albums_list( req, res );
	}
	else if( coreUrl.match(/\/albums\/.*\.json(?:.*)*/g) && req.method.toLowerCase() === "get" ) {
		handle_album( req, res );
	}
	else if( coreUrl.match(/.*rename\.json/g) && req.method.toLowerCase() === "post" ) {
		handle_album_rename( req, res );
	}
	else {
		send_failure( res, 404, "Invalid Request" );
	}
}

function send_failure( res, code, data ) {
	res.writeHead( code, 
	{
		"content-type": "application/json"
	} );
	res.end( JSON.stringify( {
				error: data
			} ) + "\n"
	);	
}

function send_success( res, data ) {
	res.writeHead( 200, 
	{
		"content-type": "application/json"
	} );
	res.end( JSON.stringify( {
				error: null,
				data: data
			} ) + "\n"
	);
}

http.createServer( handleReqRes ).listen( 9234 );