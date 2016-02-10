/*global __dirname, process */
var express = require('express'),
    bodyParser = require('body-parser'),
    xpath = require('xpath'),
    path = require('path'),
    fs = require('fs'),
    xml2js = require('xml2js'),
    DOMParser = new (require('xmldom')).DOMParser,
    parser = new xml2js.Parser();

var app = express();

app.use(bodyParser.json({limit: '1000mb'}));
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
    var doc = DOMParser.parseFromString(req.body.xmlstring);
    var nodesByName = xpath.select(req.body.searchterm, doc);
    if (req.body.format === 'xml') {
        writeXML(res, nodesByName.toString());
    } else if (req.body.format === 'table') {
        writeTable(res, nodesByName);
    }    
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'));

function writeXML(res, xmlstring) {
    var sendDoc = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + "<content>" + xmlstring + "</content>";
    res.writeHead(200, {
        'Content-Type': 'application/xml',
        'Content-Length': sendDoc.length
    });
    res.end(sendDoc);
}

function writeTable(res, nodesByName) {
    var i, j;
    var ret = "<html>";
    var columnNames = {};
    var col;
    var find;
    ret += "<head>"
    + "<style type='text/css'>"
    + ".cell { border: 1px #000 solid; padding: 5px 10px; }"
    + "</style>";
    ret += "</head>";

    for (i = 0; i < nodesByName.length; i++) {
        for (j = 0; j < nodesByName[i].attributes.length; j++) {
            columnNames[nodesByName[i].attributes[j].nodeName] = true;
        }
    }

    ret += "<body>";
    ret += "<table style='border-collapse: collapse;'>";
    ret += "<tr>";
    ret += "<th class='cell'>" + "Search term" + "</th>";
    for (col in columnNames) {
        ret += "<th class='cell'>" + col + "</th>";
    }
    ret += "</tr>";

    for (i = 0; i < nodesByName.length; i++) {
        ret += "<tr>";
        ret += "<th class='cell'>" + nodesByName[i].nodeName + "</th>";
        // for (j = 0; j < nodesByName[i].attributes.length; j++) {
        //     ret += "<td class='cell'>" + nodesByName[i].attributes[j].nodeValue + "</td>";
        // }
        for (col in columnNames) {
            find = getAttr(nodesByName[i].attributes, col);
            ret += "<td class='cell'>" + (find ? find : "") + "</td>";
        }
        ret += "</tr>";
    }
    ret += "</table>";
    ret += "</body>";
    ret += "</html>";
    
    res.writeHead(200, {
        'Content-Type': 'text/html',
        'Content-Length': ret.length
    });

    res.end(ret);
}

function getAttr(attributes, search) {
  var i;
  for(i = 0; i < attributes.length; i++) {
      if(attributes[i].nodeName === search) {
          return attributes[i].nodeValue;
      }
  }
  return null;
}