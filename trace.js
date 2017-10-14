const trace = require('.');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const dbDir = 'db';

if (process.argv.length < 3) {
  console.error('Usage: node main.js [hostname]');
  process.exit(1);
}

const target = process.argv[2];

traceHost(target, (err, res) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});

function traceHost (target, cb) {
console.error('[*] Tracing', target);
trace.route(target, (err, res) => {
  if (err) {
    throw err;
  }
  const report = {
    target: target,
    timestamp: Date.now(),
    trace: res
  };
  saveReport(report, cb);
});
}

function saveReport(obj, cb) {
  const dir = path.join(dbDir, obj.target);
  mkdirp(path.join(dbDir, obj.target), (err) => {
    if (err) {
      return cb(err);
    }
    fs.writeFile(path.join(dir, obj.target + '-' + obj.timestamp + '.json'), JSON.stringify(obj), err => {
      cb(err);
    })
  });
}
