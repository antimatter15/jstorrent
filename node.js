var bencode = require('./bencoding'),
    fs = require('fs'),
    sys = require('sys');
    
fs.readFile('./ubuntu-9.10-server-i386.iso.torrent', 'binary', function(err, data){
  if(err) throw err;
  sys.puts(typeof data);
  var torrent = bencode.decode(data);
  sys.puts(torrent.announce)
  sys.puts('whoot');
});
