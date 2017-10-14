const fs = require('fs');
const exec = require('child_process').exec;

function tracerouteParse (text) {
  const lines = text.split('\n');
  const routes = [];
  let oldIndex = 1;
  for (let line of lines) {
    if (line.indexOf('traceroute to') === 0) {
      continue;
    }
    let index = +line.substring(0, 4).trim();
    if (!index) {
      index = oldIndex;
    } else {
      oldIndex = index;
    }
    if (index < 1) {
      continue;
    }
    const obj = {};
    if (line.indexOf('* * *') !== -1) {
      if (!routes[oldIndex - 1]) {
        routes[oldIndex - 1] = [];
      }
      continue;
    }
    line = line.replace(/ \* \*$/, '');
    line = line.replace(/ \*$/, '');
    // 1  192.168.1.1 (192.168.1.1)  2.389 ms  19.990 ms  1.713 ms
    const regex = /^(.*) ([^\s]*) \((.*)\) (.*) ms (.*) ms (.*) ms$/;
    let res = line.match(regex);
    if (!res) {
      //    192.168.1.1 (192.168.1.1)  2.389 ms
      const regex = /^(.*) ([^\s]*) \((.*)\) (.*) ms (.*) ms$/;
      res = line.match(regex);
      if (res) {
        res[6] = res[5];
      } else {
        //    192.168.1.1 (192.168.1.1)  2.389 ms
        const regex = /^(.*) ([^\s]*) \((.*)\) (.*) ms$/;
        res = line.match(regex);
        if (res) {
          res[5] = res[4];
          res[6] = res[4];
        }
      }
    }
    if (res) {
      obj.name = res[2].trim();
      obj.addr = res[3].trim();
      obj.ping = ((+res[4].trim() + +res[5].trim() + +res[6].trim()) / 3) | 0;
      if (routes[oldIndex - 1]) {
        routes[oldIndex - 1].push(obj);
      } else {
        routes[oldIndex - 1] = [obj];
      }
    } else {
      if (line) {
        console.log('ERROR', line);
      }
    }
  }
  return routes;
}

function traceroute (target, cb) {
  const cmd = ['traceroute', target];
  exec('traceroute ' + target, function callback (error, stdout, stderr) {
    cb(null, tracerouteParse(stdout.toString()));
  });
}

function parseRoute (target, cb) {
  fs.readFile(target, (err, stdout) => {
    cb(null, tracerouteParse(stdout.toString()));
  });
}

module.exports = {
  route: traceroute,
  parse: parseRoute
};
