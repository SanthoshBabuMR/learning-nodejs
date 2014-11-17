require("http").createServer( function( req, res) {
	console.log( "-----");
	console.log( req );
	console.log( "-----");
	console.log( res );
	console.log( "-----");
	res.writeHead( 200, { "Content-Type": "application/json"  } );
	res.end( JSON.stringify( { error: null, data: "" } ) );
} ).listen( 9234 );