#!node

import { default as ts2gas } from "ts2gas";
import fs from 'fs';
import path from 'path';

// Write a function to return all files with .ts extension in the current directory.
function getFilesWithExtension(dir, extension) {
    var files = fs.readdirSync(dir);
    var result = [];
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (path.extname(file) === extension) {
            result.push(path.join(dir, file));
        }
    }
    return result;
}

// Make a new directory called build if it does not exist.
if (!fs.existsSync('build')) {
    fs.mkdirSync('build');
}

// Delete all files in build.
var existingFiles = fs.readdirSync('build');
for (var file of existingFiles) {
    // Delete file.
    fs.unlinkSync(path.join('build', file));
}

var tsFiles = getFilesWithExtension('.', '.ts');
for (var file of tsFiles) {
    // read file contents into a string.
    var contents = fs.readFileSync(file, 'utf8');
    var output = ts2gas(contents);
    // Write output under 'build' directory and replace extension to .gs
    fs.writeFileSync(path.join('build', path.basename(file.replace(".ts", ".gs"))), output);
}

var htmlFiles = getFilesWithExtension('.', '.html');
for (var file of htmlFiles) {
    fs.copyFileSync(file, path.join('build', path.basename(file)));
}