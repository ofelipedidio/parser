const {
  Conditional,
  Text,
  Placeholder,
  List,
  DynamicBreakline,
  StructureBlock
} = require('./classes');

let main = true;

/**
 * @param {String} str
 */
function parse(str) {
  console.log('\x1b[31mStarted parsing string "' + str + '"\x1b[0m');
  const structures = [];
  let resultStr = '';

  let onmain = main;
  // main = false;

  let pos = 0;

  let token = '';
  let labelText = '';
  let contentText = '';
  let functionsText = '';

  let text = true;
  let placeholder = false;
  let conditional = false;
  let db = false;
  let block = false;

  let label = false;
  let content = false;
  let functions = false;
  let literal = false;

  let potentialLast = false;
  let first = false;
  let last = false;

  function dispatch() {
    if (text) {
      if (token.length > 0) structures.push(new Text(token));
    } else if (placeholder) {
      if (labelText.length > 0)
        structures.push(
          new Placeholder(labelText, parse(contentText), functionsText)
        );
      else console.error('bruuh');
    } else if (conditional) {
      if (labelText.length > 0)
        structures.push(new Conditional(labelText, parse(contentText)));
      else console.error('bruuuh');
    } else if (db) {
      structures.push(new DynamicBreakline(parse(contentText), first, last));
    } else if (block) {
      if (labelText.length > 0)
        structures.push(new StructureBlock(labelText, parse(contentText)));
      else console.error('bruuuuh');
    } else console.error('bruh');
  }

  function clear() {
    token = '';
    labelText = '';
    contentText = '';
    functionsText = '';

    text = false;
    placeholder = false;
    conditional = false;
    db = false;
    block = false;

    label = false;
    content = false;
    functions = false;
    literal = false;

    potentialLast = false;
    first = false;
    last = false;
  }

  for (let i = 0; i < str.length; i++) {
    const c = str[i];

    // all content types
    if (placeholder || conditional || db || block) {
      token += c;
    }

    if (literal) {
      resultStr += '\x1b[101m' + c + '\x1b[0m';
      if(onmain) console.log(c, 'L');

      if (content) contentText += '\\' + c;
      else if (c == 'n') token += '\n';
      else token += c;

      literal = false;
    } else if (c == '\\') {
      resultStr += '\x1b[101m' + c + '\x1b[0m';
      literal = true;
    } else if (content) {
      resultStr += '\x1b[46m' + c + '\x1b[0m';
      if(onmain) console.log(c, '0', pos);

      if (db && c == '.' && (pos == 1 || pos == 0)) {
        if(onmain) console.log('db = true');

        if (contentText.length == 0) first = true;
        else if (potentialLast) contentText += '.';
        else potentialLast = true;

        console.log(first, last, potentialLast);
        

        if(onmain) console.log(first, last, potentialLast);
      } else if (placeholder && c == '>') {
        content = false;
        functions = true;
      } else {
        if (potentialLast && db && c == '$') last = true;

        if (c == '{' || c == '[' || c == '&' || c == '(') {
          pos++;
          if (pos > 0) contentText += c;
        } else if (c == '}' || c == ']' || c == '$' || c == ')') {
          if (pos > 1) contentText += c;
          pos--;
          console.log(first, last, potentialLast);

          if (pos == 0) {
            dispatch();
            clear();
            text = true;
          }
        } else contentText += c;
      }
    } else if (placeholder && c == '}') {
      resultStr += '\x1b[45m' + c + '\x1b[0m';
      if(onmain) console.log(c, '1', pos);
      pos--;

      if (pos == 0) {
        dispatch();
        clear();
        text = true;
      }
    } else if (conditional && c == ']') {
      resultStr += '\x1b[45m' + c + '\x1b[0m';
      if(onmain) console.log(c, '2', pos);
      pos--;

      if (pos == 0) {
        dispatch();
        clear();
        text = true;
      }
    } else if (db && c == '$') {
      resultStr += '\x1b[45m' + c + '\x1b[0m';
      if(onmain) console.log(c, '3', pos);
      pos--;

      if (pos == 0) {
        dispatch();
        clear();
        text = true;
      }
    } else if (block && c == ')') {
      resultStr += '\x1b[45m' + c + '\x1b[0m';
      if(onmain) console.log(c, '4', pos);
      pos--;

      if (pos == 0) {
        dispatch();
        clear();
        text = true;
      }
    } else if (label) {
      resultStr += '\x1b[44m' + c + '\x1b[0m';
      if(onmain) console.log(c, '5', pos);
      if (/[A-Za-z0-9]/.test(c)) labelText += c;
      else if (c == ':') {
        label = false;
        content = true;
      } else if(onmain) console.error('foo');
    } else if (functions) {
      resultStr += '\x1b[43m' + c + '\x1b[0m';
      if(onmain) console.log(c, '6', pos);
      if (/[A-Za-z0-9,]/.test(c)) labelText += c;
      else if(onmain) console.error('foo');
    } else if (c == '{') {
      resultStr += '\x1b[42m' + c + '\x1b[0m';
      if(onmain) console.log(c, '7', pos);
      pos++;
      dispatch();
      clear();
      token += c;
      placeholder = true;
      label = true;
    } else if (c == '[') {
      resultStr += '\x1b[42m' + c + '\x1b[0m';
      if(onmain) console.log(c, '8', pos);
      pos++;
      dispatch();
      clear();
      token += c;
      conditional = true;
      label = true;
    } else if (c == '&') {
      resultStr += '\x1b[42m' + c + '\x1b[0m';
      if(onmain) console.log(c, '9', pos);
      pos++;
      dispatch();
      clear();
      token += c;
      db = true;
      content = true;
    } else if (c == '(') {
      resultStr += '\x1b[42m' + c + '\x1b[0m';
      if(onmain) console.log(c, '10', pos);
      pos++;
      dispatch();
      clear();
      token += c;
      block = true;
      label = true;
    } else if(c == '.' && db) {
      if(potentialLast) token += c;
      else potentialLast = true;
    } else {
      resultStr += '\x1b[41m' + c + '\x1b[0m';
      if(onmain) console.log(c, '11', pos);
      token += c;
    }
  }

  dispatch();

  if(onmain) console.log('\x1b[32mDone!\x1b[0m');
  if(onmain) console.log(resultStr);
  return new List(structures);
}

module.exports = parse;
