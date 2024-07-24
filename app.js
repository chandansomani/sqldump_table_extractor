const fs = require('fs');
const my = require('./mylib.js');

const srcfilePath =  './data/database_backup_tbls.sql'
const dumpFilePath = './output/output.txt';
const tempFilePath = './temp/temp.dat';

function parseSQLDump(srcfilePath) {
    my.removeComments(srcfilePath, tempFilePath);  
    const sqlWithoutComments = fs.readFileSync(tempFilePath, 'utf8');
  
    const statements = my.parse(sqlWithoutComments);
    const cleanedContent = statements.join('\n');
    fs.writeFileSync(dumpFilePath, cleanedContent, 'utf8');
  }

parseSQLDump(srcfilePath);
