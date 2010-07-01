var bencode = require('./bencoding'),
    sha1 = require('./sha1'), //maybe later use the native node.js crypto lib
    fs = require('fs'),
    url = require('url'),
    net = require('net'),
    http = require('http'),
    querystring = require('querystring'),
    sys = require('sys');



var listen_port = 6882;
var torrentdata = '';
    
fs.readFile('./ajaxanimatorcrx.torrent', 'binary', function(err, data){
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
  
  var obj = {
    info_hash: '__magic_info_hash__', //hackish
    peer_id: peerid,
    port: listen_port,
    uploaded: 0,
    downloaded: 0,
    left: torrent.info.length,
    compact: 0,
    numwant: 20,
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
      var peers = [];
      if(typeof data.peers == 'string'){
        for(var i = 0; i < data.peers.length; i+= 6){
          var z = data.peers.substr(i, 6);
          var IP = z.substr(0,4).split('').map(function(e){
            return e.charCodeAt(0);
          }).join('.');
          
          var port = z.charCodeAt(4) * Math.pow(2,8) + z.charCodeAt(5); //aaaaaaaaaaarrrrghhhh is this right?
          peers.push({'peer id': '', ip: IP, port: port});
        }
      }else{
        peers = data.peers;
      }
      
      sys.puts(JSON.stringify(peers));
    })
  });
}


net.createServer(function (socket) {
  socket.setEncoding("binary");
  socket.addListener("connect", function () {
    socket.write("Echo server\r\n");
  });
  socket.addListener("data", function (data) {
    socket.write(data);
  });
  socket.addListener("end", function () {
    socket.end();
  });
}).listen(listen_port, "127.0.0.1");
