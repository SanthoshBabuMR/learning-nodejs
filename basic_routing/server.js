/* request router */

var express = require( "express" );
var app     = express();
var fs      = require( "fs" );
var path    = require( "path" );

var album_hdlr = require( "./handlers/albums.js");
var page_hdrl  = require( "./handlers/pages.js");
var helpers    = require( "./handlers/helpers.js");

app.use(express.static(__dirname));

/* respond with JSON */
app.get( "/v1/albums.json", album_hdlr.list_all );
app.get( "/v1/albums/:album_name.json", album_hdlr.album_by_name );


/* handle virtual pages */
app.get( "/pages/:page_name/:sub_page", page_hdrl.generate );
app.get( "/pages/:page_name", page_hdrl.generate );


/* handle real content/data eg: text, media */
/*
app.get( "/contents/:filename", function( req, res ) {
    serve_static_file( "contents/" + req.params.filename, res );
} );

app.get( "/albums/:album_name/:filename", function( req, res ) {
    serve_static_file( "albums/" + req.params.album_name + "/" + req.params.filename, res)
} );


app.get( "/templates/:template_name", function( req, res ) {
    serve_static_file( "templates/" + req.params.template_name, res );
} );*/

app.get( "*", four_oh_four );

function four_oh_four( req, res ) {
    res.writeHead( 404, { "Content-Type": "application/json" } );
    res.end( JSON.stringify( helpers.invalid_resource()) + "\n" );
}

function serve_static_file( file, res ) {
    fs.exists( file, function( exists ) {
        if( exists === undefined || exists === false ) {
            res.writeHead( 404, { "Content-Type": "application/json" } );
            var out = {
                error: "not_found",
                message: "'" + file + "' not found"
            };
            res.end( JSON.stringify( out ) + "\n" );
        }
        var rs = fs.createReadStream( file );
        rs.on( "error", function() {
            res.end();
        } );
        var ct = content_type_for_file( file );
        res.writeHead( 200, { "Content-Type": ct } );
        rs.pipe( res );
    } );
}

function content_type_for_file (file) {
    var ext = path.extname(file);
    switch (ext.toLowerCase()) {
        case '.html': return "text/html";
        case ".js": return "text/javascript";
        case ".css": return 'text/css';
        case '.jpg': case '.jpeg': return 'image/jpeg';
        default: return 'text/plain';
    }
}

app.listen( 9234 );
