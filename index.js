var fs = require('fs'),
    xml2js = require('xml2js');

var parser = new xml2js.Parser();
parser.addListener('end', function(result) {
    fs.writeFile(__dirname + '/foo.json', JSON.stringify(result, null, "\t"), function(err, data) {
        if(!err) {
            console.log('Converted and saved in foo.json!');
        }        
    });
});

fs.readFile(__dirname + '/foo.xml', {encoding: 'utf-8'}, function(err, data) {
    var json;
    if(!err) {
        json = parser.parseString(data);        
    }
});