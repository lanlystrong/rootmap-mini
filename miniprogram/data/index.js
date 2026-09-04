// miniprogram/data/index.js
const roots = require('./roots');
const affixes = require('./affixes');
const familySpect = require('./families/family-spect');
module.exports = { roots, affixes, words: [...familySpect] };
