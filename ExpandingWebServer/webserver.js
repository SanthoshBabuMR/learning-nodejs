var http = require( "http" ),
	fs   = require( "fs" ),
	path = require( "path" );

function handleIncomingRequest( req, res ) {
	if( req.method.toLowerCase() === "get" && req.url.substring(0,8) === "/content" ) {
		serveStaticFile( req.url.substring(9), res)
	} else {
		res.writeHead( 404,
							{
								"Content-Type": "application/json"	
							}
		);
		var err = {
			error: "not_found",
			message: "'" + req.url + "' not found"
		}
		res.end( JSON.stringify( err ) + "\n" );
	}
}

function serveStaticFile( file, res ) {
	var rs = fs.createReadStream( file );
	var ct = content_type_for_path( file );
	res.writeHead( 200,
					{
						"Content-Type": ct
					}
	);
	/*rs.on( "readable", function() {
		var d = rs.read();
		if( d ) {
			if( typeof d === "string" ) {
				res.write( d )
			}
			else if( typeof d === "object" && d instanceof Buffer ) {
				res.write( d.toString( "utf-8" ) );
			}
		}
	} );
	rs.on( "end", function() {
		res.end();
	})*/
	rs.on( "error", function() {
		res.writeHead( 404,
							{
								"Content-Type": "application/json"	
							}
		);
		var err = {
			error: "not_found",
			message: "resource not found"
		}
		res.end( JSON.stringify( err ) + "\n" );
	} );
	rs.pipe( res );
} 

function content_type_for_path( file ) {
	var ext = path.extname( file );
	switch( ext ) {
		case '.html': return "text/html";
		case '.css': return "text/css";
		case '.javascript': return "text/javascript";
		case '.json': return "application/json";
		case '.jpg': case '.jpeg': return "image/jpeg";
		default: return "text/plain";
	}
}

http.createServer( handleIncomingRequest ).listen( 9234 );
