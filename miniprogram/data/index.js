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
const familyForm = require('./families/family-form');
const familyPress = require('./families/family-press');
const familyGrad = require('./families/family-grad');
const familyCed = require('./families/family-ced');
const familyPend = require('./families/family-pend');
const familyPos = require('./families/family-pos');
const familyTend = require('./families/family-tend');
const familyCept = require('./families/family-cept');
const familyVen = require('./families/family-ven');
const familyPel = require('./families/family-pel');
const familyVal = require('./families/family-val');
const familyPhon = require('./families/family-phon');
const familyGraph = require('./families/family-graph');
const familyLog = require('./families/family-log');
const familyLuc = require('./families/family-luc');
const familyMan = require('./families/family-man');
const familyMob = require('./families/family-mob');
const familyNov = require('./families/family-nov');
const familyNorm = require('./families/family-norm');
const familyNumer = require('./families/family-numer');
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
    ...familyForm,
    ...familyPress,
    ...familyGrad,
    ...familyCed,
    ...familyPend,
    ...familyPos,
    ...familyTend,
    ...familyCept,
    ...familyVen,
    ...familyPel,
    ...familyVal,
    ...familyPhon,
    ...familyGraph,
    ...familyLog,
    ...familyLuc,
    ...familyMan,
    ...familyMob,
    ...familyNov,
    ...familyNorm,
    ...familyNumer,
  ],
};
