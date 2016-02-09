/*global __dirname */
var express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    fs = require('fs'),
    xml2js = require('xml2js'),
    DOMParser = new (require('xmldom')).DOMParser,
    parser = new xml2js.Parser(),
    document = null;

var app = express();

app.use(bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
})); 

app.get('/', function(req, res) {
    var filePath = path.join(__dirname, '/index.html');
    var stat = fs.statSync(filePath);
    res.writeHead(200, {
        'Content-Type': 'text/html',
        'Content-Length': stat.size
    });
    fs.createReadStream(__dirname + '/index.html').pipe(res);
});

app.post('/find', function(req, res) {
    var document = DOMParser.parseFromString(req.body.xmlstring);
    var nodesByName = document.getElementsByTagName(req.body.searchterm);
    var sendDoc = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
        + "<content>" + nodesByName.toString() + "</content>";    
        
    res.writeHead(200, {
        'Content-Type': 'application/xml',
        'Content-Length': sendDoc.length
    });
    res.end(sendDoc);
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'));


/*
parser.addListener('end', function(json) {
    var nodesByName = document.getElementsByTagName('PricingSolution');    
    
    fs.writeFile(
        __dirname + '/foo.json',
        JSON.stringify(json, null, "  "),
        function(err, data) {
            if(!err) {
                console.log('Converted and saved in foo.json!');
            }        
        }
    );
});

fs.readFile(
    __dirname + '/foo.xml',
    {encoding: 'utf-8'},
    function(err, data) {
        var json;
        if(!err) {
            document = DOMParser.parseFromString(data);        
            json = parser.parseString(data);
        }
    }
);
*/