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

// app.use(bodyParser.urlencoded());
// app.use(bodyParser.json());
app.use('/public', express.static('assets'));

app.get('/', bodyParser({limit:'1000mb'}), function(req, res) {
    var filePath = path.join(__dirname, '/index.html');
    var stat = fs.statSync(filePath);
    res.writeHead(200, {
        'Content-Type': 'text/html',
        'Content-Length': stat.size 
    });
    fs.createReadStream(__dirname + '/index.html').pipe(res);
});

app.post('/find', bodyParser({limit:'1000mb'}), function(req, res) {
    var ret = '';
    var docin = DOMParser.parseFromString(req.body.inxmlstring);
    var docout = DOMParser.parseFromString(req.body.outxmlstring);
    var nodesByNameIn = xpath.select(req.body.searchterm, docin);
    var nodesByNameOut = xpath.select(req.body.searchterm, docout);
    var columnNamesArray = [];
    
    if (req.body.format === 'xml') {
        ret = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" + "<content>";
        ret += nodesByNameIn.toString();
        ret += nodesByNameOut.toString();
        ret += "</content>";
        
        res.writeHead(200, {
            'Content-Type': 'application/xml',
            'Content-Length': ret.length
        });
        
        res.end(ret);

    } else if (req.body.format === 'table') {
        columnNamesArray = getColumnNames(nodesByNameIn, nodesByNameOut);
        ret = '<html>';
        ret += getHeader();
        ret += '<body>';
        ret += '<h2>Booking State In</h2>';
        ret += '<br/>';
        ret += writeTable(columnNamesArray[1], nodesByNameIn);
        ret += '<h2>Booking State Out</h2>';
        ret += '<br/>';
        ret += writeTable(columnNamesArray[1], nodesByNameOut, columnNamesArray[0]);
        ret += '</body>';
        ret += '</html>';
        
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Content-Length': ret.length
        });
        
        res.end(ret);
    }    
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'));

function writeXML(res, xmlstring) {
    var sendDoc =  + xmlstring 
    res.writeHead(200, {
        'Content-Type': 'application/xml',
        'Content-Length': sendDoc.length
    });
    res.end(sendDoc);
}

function getHeader() {
    return "<head><link rel='stylesheet' type='text/css' href='/public/css/style.css' /></head>";
}
function writeTable(columnNamesArray, nodesByName, columnNamesArrayCompared) {
    var i, j;
    var ret = '';
    var col;
    var find;

    ret += "<table style='border-collapse: collapse;'>";
    ret += "<tr>";
    ret += "<th class='cell'>" + "Search term" + "</th>";

    for (col in columnNamesArray) {
        ret += "<th class='cell'>" + columnNamesArray[col] + "</th>";
    }
    ret += "</tr>";

    for (i = 0; i < nodesByName.length; i++) {
        ret += "<tr>";
        ret += "<th class='cell'>" + nodesByName[i].nodeName + "</th>";
        for (col in columnNamesArray) {
            find = getAttr(nodesByName[i].attributes, columnNamesArray[col]);
            if(columnNamesArrayCompared) {
                ret += "<td "
                    + (hasColumn(columnNamesArrayCompared, columnNamesArray[col])
                        ? "class='cell'>" : "class='cell different'>" )
                    + (find ? find : "") + "</td>";
            } else {
                ret += "<td class='cell'>" + (find ? find : "") + "</td>";
            }
        }
        ret += "</tr>";
    }
    ret += "</table>";

    return ret;
}

function hasColumn(columnNamesArray, columnName) {
    var i, len = columnNamesArray.length;
    for(i = 0; i < len; i++) {
        if(columnNamesArray[i] === columnName) {
            return true;
        }
    }
    return false;
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

function getColumnNames(nodesByNameIn, nodesByNameOut) {
    var columnNamesIn = {}, columnNamesOut = {};
    var columnNamesArrayIn = [];
    var columnNamesArrayOut = [];
    var i, j, col;
    
    for (i = 0; i < nodesByNameIn.length; i++) {
        for (j = 0; j < nodesByNameIn[i].attributes.length; j++) {
            columnNamesIn[nodesByNameIn[i].attributes[j].nodeName] = true;
        }
    }

    for (i = 0; i < nodesByNameOut.length; i++) {
        for (j = 0; j < nodesByNameOut[i].attributes.length; j++) {
            columnNamesOut[nodesByNameOut[i].attributes[j].nodeName] = true;
        }
    }

    for (col in columnNamesIn) {
        columnNamesArrayIn.push(col);
    }

    for (col in columnNamesOut) {
        columnNamesArrayOut.push(col);
    }
    
    return [columnNamesArrayIn.sort(), columnNamesArrayOut.sort()];
}