/*global __dirname */
var fs = require('fs'),
    xml2js = require('xml2js'),
    DOMParser = new (require('xmldom')).DOMParser;
var document;
var parser = new xml2js.Parser();

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