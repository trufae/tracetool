const fs = require('fs');
const path = require('path');

const dbDir = 'db';

function listTargets (cb) {
  fs.readdir(dbDir, null, cb);
}

function loadDatabase (target, cb) {
  if (!cb) {
    cb = target;
    target = null;
  }
  listTargets((err, res) => {
    if (err) {
      return cb(err);
    }
    const result = {};
    for (let r of res) {
      const dir = path.join(dbDir, r);
      const files = fs.readdirSync(dir);
      if (target && target !== r) {
        continue;
      }
      for (let log of files) {
        const file = path.join(dir, log);
        const obj = JSON.parse(fs.readFileSync(file));
        if (result[r]) {
          result[r].push(obj);
        } else {
          result[r] = [obj];
        }
      }
    }
    cb(null, result);
  });
}

function listTraces (target, cb) {
  loadDatabase(target, (err, res) => {
    if (err) {
      return cb(err);
    }
    const result = {
      ips: {},
      hosts: {},
      traces: []
    };
    for (let tar of Object.keys(res)) {
      if (target && target !== tar) {
        continue;
      }
      for (let t of res[tar]) {
        let index = 0;
        for (let hop of t.trace) {
          if (!hop) {
            hop = [];
          }
          for (let subHop of hop) {
            omPushUniq(result.traces, index, subHop.addr);
            if (result.ips[subHop.addr]) {
              result.ips[subHop.addr] ++;
            } else {
              result.ips[subHop.addr] = 1;
            }
            if (subHop.name != subHop.addr) {
              result.hosts[subHop.addr] = subHop.name;
            }
          }
          index++;
        }
      }
    }
    cb(null, result);
  });
}

const arg = process.argv[2];
const arg2 = process.argv[3];

switch (arg) {
  case '-t':
    listTraces(arg2, (err, res) => {
      if (err) {
        throw err;
      }
      console.log(JSON.stringify(res.traces, null, 2));
    });
    break;
  case '-a':
    listTraces(arg2, (err, res) => {
      if (err) {
        throw err;
      }
      console.log(JSON.stringify(Object.keys(res.ips), null, 2));
    });
    break;
  case '-h':
    listTraces(arg2, (err, res) => {
      if (err) {
        throw err;
      }
      for (let ip in res.ips) {
        const name = res.hosts[ip];
        if (name) {
          console.log(ip, '\t', name);
        }
      }
    });
    break;
  case '-w':
    listTraces(arg2, (err, res) => {
      if (err) {
        throw err;
      }
      for (let ip in res.ips) {
        const count = res.ips[ip] + 1;
        console.log(ip.padStart(20), Array(count).join('#'));
      }
    });
    break;
  case '-l':
    // length of paths for each trace for a specific host
    break;
  case '':
    console.log('Usage: query.js [-alh] [target]');
    break;
  default:
    listTargets((err, hosts) => {
      if (err) {
        throw err;
      }
      for (let host of hosts) {
        console.log(host);
      }
    });
    break;
}

/// ////////////////////

function omPushUniq (o, a, b) {
  if (!o) {
    return [a];
  }
  if (!b) {
    if (o.indexOf(a) === -1) {
      o.push(a);
    }
    return;
  }
  if (!o[a]) {
    o[a] = [b];
    return;
  }
  if (o[a].indexOf(b) !== -1) {
    return;
  }
  o[a].push(b);
}
