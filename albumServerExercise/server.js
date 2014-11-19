var http = require( "http" ),
	fs = require( "fs" );


function handleIncomingRequest( req, res ) {
	console.log( "Incoming Request: " + req.method + " " + req.url );
	fs.readdir( "albums", function( err, files) {
		if( err ) {
			res.writeHead( 200, {
				"content-type": "application/json"
			} );
			res.end( JSON.stringify( {
				"error": err
			}) + "\n" );
			return;
		}		
		var dirList = [];
		( function iterator( index ) {
			if( index === files.length ) {
				res.writeHead( 200, {
					"content-type": "application/json"
				} );
				res.end( JSON.stringify( {
					"error": null,
					"data": dirList
				} ) + "\n" );
				return;
			}
			fs.stat( "albums/" + files[index], function( err, stats ) {
				if( err ) {
					console.log( "error" );
				}
				if( stats.isDirectory() ) {
					var obj = { 
						name: files[index]
					}
					dirList.push( obj );
				}
				iterator( index + 1 );
			} );			
		} )( 0 );

	} );
	
}

var s = http.createServer( handleIncomingRequest );
s.listen( 9234 );
