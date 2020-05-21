#! /usr/bin/env node

const compressor = require('node-minify');

const { program } = require('commander');
const glob = require("glob");
const fse = require('fs-extra')
const path = require('path')

program
  .requiredOption('-c, --configFile <type>', 'add the path to your config file', null)
  .option('-i, --ignore <type>', 'add the list of directories to ignore', 'node_modules,build_scripts')
  .parse(process.argv);

const jsFilesRegEx = `**/zapp_default/**/+(*.js|*.css|*.html|*.svg|*.png|*.gif|*.ttf)`;
const configDest = 'pbbacustomconfig.js';
const distDirName = "build/";

// cleanup the build folder
fse.removeSync(distDirName);

// copy configuration file to the root directory
// as this is what the pbba library expects to find in the root directory
try {
  fse.copySync(program.configFile, configDest);
  console.log(`${program.configFile} was copied to ${configDest}`);
} catch (err) {
  console.error(err)
}

// minify & uglify library *.js files
glob(jsFilesRegEx, function (error, files) {
  if (error) throw error;

  files.forEach(file => {
    const extension = path.extname(file)
    let myCompressor;

    // Remove the parent "zapp_default" from file path
    let destination = file.replace("zapp_default/", "")

    switch (extension) {
      case '.js':
        myCompressor = 'uglifyjs';
        break;

      case '.css':
        myCompressor = 'clean-css';
        break;

      case '.html':
        myCompressor = 'html-minifier';
        break;

      default:
        myCompressor = null;
    }

    if (myCompressor) {
      try {
        compressor.minify({ compressor: myCompressor, input: file, output: `${distDirName}${destination}` });
        console.log(`${file} minified and copied to ${distDirName}${destination}`);
      } catch (err) {
        console.error(err)
      }
    } else {
      try {
        fse.copySync(file, `${distDirName}${destination}`);
        console.log(`${file} was copied to ${distDirName}${destination}`);
      } catch (err) {
        console.error(err)
      }
    }
  });
});