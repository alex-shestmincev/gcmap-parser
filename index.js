var http = require('http');
var cheerio = require('cheerio');

loadHtml = function(response,callback) {
  var str = '';

  response.on('data', function (chunk) {
    str += chunk;
  });

  response.on('end', function () {
    var res = getObj(str);
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