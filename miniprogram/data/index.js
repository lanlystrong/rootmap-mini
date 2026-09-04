// miniprogram/data/index.js
const roots = require('./roots');
const affixes = require('./affixes');
const familySpect = require('./families/family-spect');
const familyVis = require('./families/family-vis');
const familyDict = require('./families/family-dict');
const familyScrib = require('./families/family-scrib');
const familyPort = require('./families/family-port');
const familyDuc = require('./families/family-duc');
const familyMit = require('./families/family-mit');
const familyStruct = require('./families/family-struct');
const familyTract = require('./families/family-tract');
const familyVert = require('./families/family-vert');
module.exports = {
  roots,
  affixes,
  words: [
    ...familySpect,
    ...familyVis,
    ...familyDict,
    ...familyScrib,
    ...familyPort,
    ...familyDuc,
    ...familyMit,
    ...familyStruct,
    ...familyTract,
    ...familyVert,
  ],
};
