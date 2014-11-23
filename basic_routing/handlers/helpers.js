exports.version = '0.1.0';

exports.make_error = function(err, msg) {
    var e = new Error(msg);
    e.code = err;
    return e;
}

exports.send_failure = function ( res, code, err ) {
	var code = code || err.code;
	res.writeHead( code, { "Content-Type": "application/json" } );
	res.end( JSON.stringify( { error: code, message: err.message } ) + "\n" );
}

exports.send_success = function ( res, data ) {
	res.writeHead( 200, { "Content-Type": "application/json" } );
	res.end( JSON.stringify( { error: null, data: data}) + "\n" );
}

exports.invalid_resource = function() {
    return exports.make_error("invalid_resource",
                              "the requested resource does not exist.");
}

exports.no_such_album = function() {
    return exports.make_error("no_such_album",
                              "The specified album does not exist");
}