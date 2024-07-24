const fs = require('fs');

function parse(content) {
  const lines = content.split('\n');
  const tables = [];
  let currentStatement = '';
  let currentTableCols = [];
  let inCreateTableBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (inCreateTableBlock) {
      if (line.startsWith('KEY') || line.startsWith('CONSTRAINT') || line.startsWith('PRIMARY'))
        continue;

      if (!line.startsWith(')'))
        currentTableCols.push(extractColumnName(line));

      if (line.startsWith(')')) {
        inCreateTableBlock = false;
        tables.push(currentStatement + ' => ' + currentTableCols.join(", "));
        currentStatement = '';
        currentTableCols = [];
      }
    }
    else if (line.startsWith('CREATE TABLE')) {
      inCreateTableBlock = true;
      const tableName = extractTableName(line);
      currentStatement += tableName
    }
  }
  return tables;
}

const tableNameRegex = /CREATE TABLE\s+`(.+?)`\s*\(/;
function extractTableName(sql) {
  const match = tableNameRegex.exec(sql);
  if (match) {
    return match[1].trim();
  } else {
    return null;
  }
}

function extractColumnName(sql) {
  //let splits = sql.trim().split(' ');
  const splits = sql.replace(/^`([^`]+)`/, '$1').split(' ');
  if (splits[0]) {
    return splits[0];
  }
  else return null;
}

function removeComments(filePath, newFilePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const newLines = [];
  let inCommentBlock = false;  

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (inCommentBlock) {      
      if (line.endsWith('*/;\r')) {
        inCommentBlock = false;
      }
    } else {
      if (line.startsWith('--')) {
        continue;
      }
      else if (line.startsWith('/*') && line.endsWith('*/;\r')) {
        continue;
      }
      else if (line.startsWith('DROP ')) {
        continue;
      }
      else if (line.startsWith('/*') && !line.endsWith('*/;\r')) {
        inCommentBlock = true;
      }
      else {
        newLines.push(line);
      }
    }
  }

  const cleanedContent = newLines.join('\n');
  fs.writeFileSync(newFilePath, cleanedContent, 'utf8');
}

module.exports = { removeComments, parse };