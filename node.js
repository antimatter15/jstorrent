var bencode = require('./bencoding'),
    sha1 = require('./sha1'), //maybe later use the native node.js crypto lib
    fs = require('fs'),
    url = require('url'),
    http = require('http'),
    querystring = require('querystring'),
    sys = require('sys');
    
var torrentdata = '';
    
fs.readFile('./ubuntu-9.10-server-i386.iso.torrent', 'binary', function(err, data){
  if(err) throw err;
  sys.puts(typeof data);
  torrentdata = data;
  var torrent = bencode.decode(data);
  sys.puts(torrent.announce)
  requestTracker(torrent)

});


var peerid = ('-JS0001-'+Math.random().toString(36).substr(3)
                       +Math.random().toString(36).substr(3))
              .substr(0, 20);

function hash(str){
  return sha1.rstr_sha1(str);
}

function checkBinary(str){
  for(var i = 0; i < str.length; i++){
    if(str[i].charCodeAt(0) > 255) return false;
  }
  return true;
}

function requestTracker(torrent){
  var info = bencode.encode(torrent.info);

  sys.puts(torrentdata.indexOf(info))
  
  var infohash = hash(info); //yaay
  var turl = url.parse(torrent.announce);
  var tracker = http.createClient(turl.port||80, turl.hostname);
  sys.puts(infohash+'infohash');
  
  var obj = {
    info_hash: '__magic_info_hash__',
    peer_id: peerid,
    port: 6882,
    uploaded: 0,
    downloaded: 0,
    left: torrent.info.length,
    compact: 0,
    event: 'started'
  };
  
  var nurl = turl.pathname+'?'+querystring.stringify(obj).replace('__magic_info_hash__',escape(infohash));
  
  sys.puts(nurl);
  var request = tracker.request('GET', nurl, {});
  request.end();
  request.addListener('response', function (response) {
    sys.puts('STATUS: ' + response.statusCode);
    sys.puts('HEADERS: ' + JSON.stringify(response.headers));
    response.setEncoding('binary');
    var everything = '';
    response.addListener('data', function (chunk) {
      sys.puts('BODY: ' + chunk);
      everything += chunk;
    });
    response.addListener('end', function(){
      var data = bencode.decode(everything);
      sys.puts(JSON.stringify(data));
    })
  });
}
