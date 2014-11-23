var express = require( "express" );
var app     = express();

app.get( "/", function( req, res ) {
	res.end( "Hello World" + "\n" );
} );

app.get( "/:what", function( req, res ) {
	res.end( "you request was for : " + req.params.what + "\n" );
} );

app.listen( 9234 );
