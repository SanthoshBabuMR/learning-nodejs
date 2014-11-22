var http = require( "http" );
var url  = require( "url" );
var fs   = require( "fs" );
var path = require( "path" );

function content_type( file ) {
	switch( path.extname( file ) ) {
		case ".jpg" : case ".jpeg": return "image/jpg";
		case ".html": case ".htm" : return "text/html";
		case ".css" : return "text/css";
		case ".js"  : return "text/javascript";
		default     : return "text/plain";
	}
}
 
function serve_static_file( file, res ) {
	var readStream = fs.createReadStream( file );
	var file_type = content_type( file );
	res.writeHead( 200, {
		"Content-Type": file_type
	} );
	readStream.on( "error", function( err ) {
		handle_error( err, res );
		return;
	} );
	readStream.on( "readable", function() {
		var d = readStream.read();
		res.write( d );
	} );
	readStream.on( "end", function() {
		console.log( file + " has been read. closing read stream" );
		res.end();
	} );
}

function handle_incoming_request( req, res ) {
	req.parsed_url = url.parse( req.url, true );
	var core_url = req.parsed_url.pathname;
	if( core_url === "/favicon.ico") {
		res.end();
	}
	else if( core_url.match( /\/contents\/.*/ ) !== null ) {
		serve_static_file( "."+core_url, res );
	}
	else {
		handle_error( "Invalid Request", res );
	}	
}

function handle_success( data, res ) {
	if( err ) {
		var output = {
			error: null,
			data: data
		}
		res.writeHead( 200, {
			"Content-Type": "application/json"
		} );
		res.end( JSON.stringify( output ) + "\n" );
	}
}

function handle_error( err, res ) {
	if( err ) {
		var output = {
			error: err,
			data: null
		}
		res.writeHead( 404, {
			"Content-Type": "application/json"
		} );
		res.end( JSON.stringify( output ) + "\n" );
	}
}

http.createServer( handle_incoming_request ).listen( 9234 );

var url  = require( "url" );