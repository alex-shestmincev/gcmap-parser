var http = require('http');
var cheerio = require('cheerio');
var Iconv  = require('iconv').Iconv;
var iconv = new Iconv('ISO-8859-1','UTF-8');


loadHtml = function(response,callback) {
  var chunks = [];
  var totallength = 0;

  response.on('data', function (chunk) {
    chunks.push(chunk);
    totallength += chunk.length;
  });

  response.on('end', function () {
    var results = new Buffer(totallength);
    var pos = 0;
    for (var i = 0; i < chunks.length; i++) {
      chunks[i].copy(results, pos);
      pos += chunks[i].length;
    }
    var converted = iconv.convert(results);
    var res = getObj(converted.toString('utf8'));
    callback(res);
  });
}

function getObj(html){
  var  $ = cheerio.load(html);
  var res = {};

  $('tr[valign=top] td').each(function(i, elem) {
    var text = $(this).text().trim();
    if (text === "Name:"){
      res.name = $(this).next().text();
    }else if(text === "Latitude:"){
      res.latitude = $(this).next().text();
    }else if(text === "Longitude:"){
      res.longitude = $(this).next().text();
    }else if(text === "Time Zone:"){
      res.timezone = $(this).next().text();
    }
  });

  return res;
}

function parser(key,callback){
  if (typeof key !== 'string' || key.length !== 3){
    throw new Error("Bad key");
  }

  http.get('http://www.gcmap.com/airport/' + key, function(response){
    loadHtml(response,callback);
  }).end();
}

exports.parse = parser;