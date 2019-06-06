const fs = require('fs');

let queryQueue = [];
let currentFile;
let data = {};

let currentLabel = '';
let buffer = {};

function displayQuery() {
  if (queryQueue.length == 0) {
    module.exports.readlineMode = false;
    return true;
  }

  const query = queryQueue.shift();
  currentLabel = query.label;
  process.stdout.write(query.message + ': ');
}

function addToQueue(message, label) {
  queryQueue.push({
    message,
    label
  });

  module.exports.readlineMode = true;
}

module.exports = {
  readlineMode: false,
  push(contents) {
    buffer[currentLabel] = contents;
    if (displayQuery()) {
      process.stdout.write('> ');
    }
  },
  initFile(name) {
    if (currentFile) this.saveFile();
    currentFile = name + '.json';
    data = { content: [] };

    console.log('File initialized with success!');

    addToQueue('Search name', 'name');
    addToQueue('Extra lines', 'extra');
    displayQuery();
  },
  saveFile() {
    if (!fs.existsSync('output')) fs.mkdirSync('output');
    fs.writeFileSync('output/' + currentFile, JSON.stringify(data));
  }
};
