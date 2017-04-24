const _ = require('underscore');
const serialport = require('serialport');
var Readline = serialport.parsers.Readline;

var portName = '/dev/ttyACM0';
var sp       = new serialport(portName, {
    baudRate: 115200
});
var parser   = sp.pipe(new Readline());

function getDataString() {
  var time = new Date().getTime();
  var datestr = new Date(time - 0*36000000).toString().replace(/T/, ' ').replace(/Z/, '');
  return datestr;
}

var currentTemp = {};
var currentBrightness = {};
parser.on('data', (input) => {
  var reading = dataToObject(input);
  if (!validateInputObj(reading)) return;
  if (reading.type === 'temperature'){
    currentTemp[reading.id] = {value: reading.value};
  }
  if (reading.type === 'brightness'){
    currentBrightness[reading.id] = {value: reading.value};
  }

});

var validateInputObj = (obj) => {
  if (!obj.type || !obj.id){
    console.log(`Data is not valid: ${obj}`);
    return false;
  }
  if (obj.type === 'temperature'){
    _.each(['value'], (key) => {
      if (!obj[key]) return false;
    }); 
  }
  if (obj.type === 'brightness'){
    _.each(['value'], (key) =>{
      if (!obj[key]) return false;
    });
  }
  return true;
};

var dataToObject = (input) => {
  var data = {};
  _.each(input.split(','), (kv)=>{
      var kv_list = kv.split(' ');
      if (kv_list.length !== 2) return;
      data[kv_list[0]] = kv_list[1].replace('\r','');
    });
  data.time = getDataString();
  return data;
};

var getCurrentTemp = (id) => {
  return currentTemp[id];
}

var getCurrentBrightness = (id) => {
  return currentBrightness[id];
}

module.exports = {
   currentTemp,
   getCurrentTemp,
   currentBrightness,
   getCurrentBrightness
};
