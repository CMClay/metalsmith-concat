'use strict';

var minimatch = require('minimatch');

/**
 * A Metalsmith plugin to concatenate files.
 */
module.exports = function plugin(options) {
  options = options || {};
  var validFileOption = (typeof options.files === 'string' || Array.isArray(options.files));
  options.files = (validFileOption) ? options.files : '**/*';

  if (typeof options.output === 'undefined') { throw new Error('Missing `output` option'); }
  options.keepConcatenated = (typeof options.keepConcatenated === 'boolean') ? options.keepConcatenated : false;

  /**
   *
   * @param {Object} files
   * @param {Metalsmith} metalsmith
   * @param {Function} done
   */
  return function(files, metalsmith, done) {
    if (Array.isArray(options.files))
      files[options.output] = { contents: concatArr(options, files) };
    else
      files[options.output] = { contents: concatObj(options, files) };
    addMetadata(options, files);
    return done();
  };
};

/**
 *  Concatinates file contents based on an Array of filepaths.
 */
function concatArr(options, files) {
  var concatenated = '';
  options.files.forEach(function(filename){
    if (!files[filename]) throw new Error(filename + ' does not exist');
    concatenated += files[filename].contents;
    if (!options.keepConcatenated) delete files[filename];
  });
  return concatenated;
}

/**
 *  Concatinates files that match a glob.
 */
function concatObj(options, files){
  var concatenated = '';
  Object.keys(files).forEach(function(filename) {
    if (!minimatch(filename, options.files)) { return; }
    concatenated += files[filename].contents;
    if (!options.keepConcatenated) delete files[filename];
  });
  return concatenated;
}

/**
 *  Add metadata to concatenated file
 */
function addMetadata(options, files){
  if(!options.metadata) return;
  var concatFile = files[options.output]
  var metadata = options.metadata;
  if (typeof metadata !== 'object') 
    throw new Error('Concat metadata must be an object');
  Object.keys(metadata).forEach(function(key){
    concatFile[key] = metadata[key];
  });
  return concatFile;
}
