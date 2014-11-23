var express = require( "express" );
var app     = express()
				.use( express.bodyParser() )
				.use( express.cookieParser() );

app.get( "/cookie", function( req, res ) {
	res.cookie("pet", "Zimbu the Monkey", { expires: new Date(Date.now() + 86400000) });
	res.end(JSON.stringify(req.query) + "\n");
} );


app.get( "/:routeurl", function( req, res ) {
	console.log( "url route  (routeurl) : " + req.params.routeurl );
	console.log( "query params (search) : " + req.query.search );
	res.end();
} ); 

app.post("/:routeurl", function( req, res ) {
	console.log( req.body )
	console.log( "post data   (pwd)     : " + req.body.pwd );
	res.end();
} );

app.get( "*", function( req, res ) {
	console.log( "no request" )
	res.end();
} ); 

app.listen( 9234 );
