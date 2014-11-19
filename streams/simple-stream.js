var fs = require( "fs" );
var contents;

var rs = fs.createReadStream( "lace.mp4" );

rs.on( "readable", function() {
	var d = rs.read();
	var str;
	if( typeof d === "string") {
		str = d;
	}
	if( typeof d === "object" && d instanceof Buffer ) {
		str = d.toString("utf-8");
	}
	if( str ) {
		if( contents === undefined ) {
			contents = str;
		}
		else {
			contents = contents + str;
		}
	}
} );

rs.on( "end", function() {
	console.log( "read in file contents" );
	console.log( contents.toString( "utf-8" ) );
})