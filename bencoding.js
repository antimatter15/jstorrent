//based totally on the original python BitTorrent bencode.py

function bdecode(x){
  function decode_int(x, f){
    f++;
    newf = x.indexOf('e', f);
    n = parseInt(x.substring(f, newf));
    if(x[f] == '-'){
      if(x[f+1] == '0')
        throw "ValueError";
    }else if(x[f] == '0' && newf != f+1)
      throw "ValueError";
    return [n, newf+1]
  }

  function decode_string(x, f){
    colon = x.indexOf(':', f);
    n = parseInt(x.substring(f, colon));
    if(x[f] == '0' && colon != f+1){
      throw "ValueError";
    }
    colon++;
    return [x.substring(colon, colon+n), colon+n]
  }

  function decode_list(x, f){
    var r = [];
    f++;
    while(x[f] != 'e'){
      var tuple = decode_func[x[f]](x, f);
      var v = tuple[0];
      f = tuple[1];
      r.push(v);
    }
    return [r, f + 1];
  }

  function decode_dict(x, f){
    var r = {};
    f++;
    while(x[f] != 'e'){
      var tuple = decode_string(x, f);
      var k = tuple[0];
      f = tuple[1];
      tuple = decode_func[x[f]](x, f);
      r[k] = tuple[0];
      f = tuple[1];
    }
    return [r, f+1]
  }

  var decode_func = {}
  decode_func['l'] = decode_list
  decode_func['d'] = decode_dict
  decode_func['i'] = decode_int
  decode_func['0'] = decode_string
  decode_func['1'] = decode_string
  decode_func['2'] = decode_string
  decode_func['3'] = decode_string
  decode_func['4'] = decode_string
  decode_func['5'] = decode_string
  decode_func['6'] = decode_string
  decode_func['7'] = decode_string
  decode_func['8'] = decode_string
  decode_func['9'] = decode_string
  try{
      var tuple = decode_func[x[0]](x, 0);
      var r = tuple[0];
      var l = tuple[1];
  }catch(err){
    throw "Not a valid bencoded string"
  }
  if(l != x.length){
    console.log(l, r, x);
    throw("invalid bencoded value (data after valid prefix)")
  }
  return r
}


function bencode(x){
  function type(o){
    //js sucks at telling if something's an array
    if(Object.prototype.toString.call(o) == '[object Array]'){
      return 'array'
    }
    return typeof o;
  }

  
  r = []
  
  function encode_int(x){
    r = r.concat(['i', x.toString(), 'e']);
  }
  
  function encode_bool(x){
    encode_int(+x);
  }
  
  function encode_string(x){
    r = r.concat([x.length.toString(), ':', x])
  }
  
  function encode_list(x){
    r.push('l');
    for(var l = x.length, i = 0; i < l; i++){
      encode_func[type(x[i])](x[i]);
    }
    r.push('e');
  }
  
  function encode_dict(x){
    r.push('d');
    var ilist = [];
    for(var i in x){
      ilist.push(i);
    }
    ilist.sort();
    for(var l = ilist.length, i = 0; i < l; i++){
      var k = ilist[i], v = x[k];
      r = r.concat([k.length.toString(), ':', k]);
      console.log(v);
      encode_func[type(v)](v);
    }
    r.push('e');
  }

  encode_func = {};
  encode_func.number = encode_int;
  encode_func.array = encode_list;
  encode_func.object = encode_dict;
  encode_func.string = encode_string;
  encode_func['boolean'] = encode_bool;

  encode_func[type(x)](x, r)
  return r.join('')
}

