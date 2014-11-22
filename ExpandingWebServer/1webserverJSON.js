var http = require( "http" );
var url  = require( "url" );
var fs   = require( "fs" );
var path = require( "path" );

function load_album_list( callback ) {
	fs.readdir( "albums/", function( err, directories ) {
		if( err ) {
			callback( err, null );
			return;
		}
		var only_dirs = [];
		(function iterator( index ) {
			if( index === directories.length ) {
				callback( null, only_dirs );
				return;		
			}
			fs.stat( "albums/" + directories[index], function( err, stats ) {
				if( err ) {
					callback( err, null);
					return;
				}
				if( stats.isDirectory() === true ) {
					only_dirs.push( directories[index] );
				}
				iterator( index + 1);	
			} );			
		})( 0 );
		
	} )
}

function load_album( req, callback ) {
	var album = path.basename( req.url ).replace( path.extname( req.url ),"");
	fs.readdir( "albums/" + album + "/", function( err, list ) {
		if( err ) {
			callback( err, null );
			return;
		}
		callback( null, list )
	} );
}

function handle_album_list( req, res ) {
	load_album_list( function( err, list ) {
		if( err !== undefined ) {
			handle_error( err, res );
		}
		handle_success( list, res );

	} );
}

function handle_album( req, res ) {
	load_album( req, function( err, list ) {
		if( err !== undefined ) {
			handle_error( err, res );
		}
		handle_success( list, res );
	} );
}

function handle_incoming_request( req, res ) {
	console.log( "INCOMING REQUEST ");
	console.log( "url    : " + req.url );
	console.log( "method : " + req.method );
	if( req.url === "/albums.json" ) {
		handle_album_list( req, res );
	}
	else if ( req.url.match(/\/albums\/.*\.json/) !== null ) {
		handle_album( req, res );
	}
	else {
		var output = {
			error: "",
			data: ""
		};
		output = {
			error: null,
			data: "Invalid Request"
		}
		res.writeHead( 200, {
			"Content-Type": "application/json"
		} );
		res.end( JSON.stringify( output ) + "\n" );
	}
}

function handle_error( err, res ) {
	if( err ) {
		var packet = {
			error: err,
			data: null
		}
		res.writeHead( 404, {
			"Content-Type": "application/json"
		} );
		res.end( JSON.stringify( packet ) + "\n" );
	}
}
function handle_success( data, res ) {
	if( data ) {
		var packet = {
			error: null,
			data: data
		}
		res.writeHead( 200, {
			"Content-Type": "application/json"
		} );
		res.end( JSON.stringify( packet ) + "\n" );
	}
}

http.createServer( handle_incoming_request ).listen( 9234 ); 