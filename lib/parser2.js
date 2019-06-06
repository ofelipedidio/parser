const {
  Text,
  Placeholder,
  Conditional,
  DynamicBreakline,
  List,
  StructureBlock
} = require('./classes');

/**
 * @param {String} str
 */
function parse(str) {
  console.log('\x1b[31mStarted parsing string "' + str + '"\x1b[0m');

  const structures = [];

  const stack = [];

  let token = '';

  let labelText = '';
  let contentText = '';
  let functionsText = '';

  let text = true;
  let placeholder = false;
  let conditional = false;
  let dynamicBreakline = false;
  let block = false;

  let label = false;
  let content = false;
  let functions = false;
  let literal = false;

  let potentialLast = false;
  let first = false;
  let last = false;

  function pop() {
    if (stack.length > 0) {
      stack.pop();

      if (stack.length > 0) {
        clear();

        switch (stack[stack.length - 1]) {
          case 0:
            text = true;
            break;
          case 1:
            placeholder = true;
            content = true;
            break;
          case 2:
            conditional = true;
            content = true;
            break;
          case 3:
            dynamicBreakline = true;
            content = true;
            break;
          case 4:
            block = true;
            content = true;
            break;

          default:
            break;
        }
      }
    }
  }

  function dispatch() {
    if (token.length > 0) {
      if (text) structures.push(new Text(token));
      else if (placeholder && functionsText.length > 0)
        structures.push(
          new Placeholder(labelText, parse(contentText), functionsText)
        );
      else if (placeholder && labelText.length > 0)
        structures.push(new Placeholder(labelText, parse(contentText)));
      else if (conditional && labelText.length > 0)
        structures.push(new Conditional(labelText, parse(contentText)));
      else if (dynamicBreakline)
        structures.push(new DynamicBreakline(parse(contentText), first, last));
      else if (block && labelText.length > 0)
        structures.push(new StructureBlock(labelText, parse(contentText)));
      else console.error('bruuuuuuuuuh');

      pop();

      token = '';
      labelText = '';
      contentText = '';
      functionsText = '';
    }
  }

  function clear() {
    text = false;
    placeholder = false;
    conditional = false;
    dynamicBreakline = false;
    block = false;

    label = false;
    content = false;
    functions = false;

    potentialLast = false;
    first = false;
    last = false;
  }

  function moveToText() {
    clear();
    text = true;

    labelText = '';
    contentText = '';
    functionsText = '';
  }

  for (let c of str) {
    if (placeholder || conditional || dynamicBreakline || block) {
      token += c;
    }

    if (literal) {
      console.log(c, '0', stack);
      if (c == 'n') token += '\n';
      else token += c;
      literal = false;
    } else if (c == '\\') {
      console.log(c, '1', stack);
      literal = true;
    } else if (placeholder && c == '}', stack) {
      console.log(c, '2', stack);
      if (content) {
        stack.pop();
        continue;
      }

      if (labelText.length < 1) {
        token += c;
        pop();
        continue;
      }
      dispatch();
      clear();
      text = true;
      console.log('\x1b[33mCreated a placeholder\x1b[0m');
    } else if (conditional && c == ']', stack) {
      console.log(c, '10');
      if (content) {
        stack.pop();
        continue;
      }

      if (labelText.length < 1 || contentText.length < 1) {
        token += c;
        pop();
        continue;
      }
      dispatch();
      clear();
      text = true;
      console.log('\x1b[33mCreated a conditional\x1b[0m');
    } else if (block && c == ')', stack) {
      console.log(c, '16');
      if (content) {
        stack.pop();
        continue;
      }

      if (labelText.length < 1 || contentText.length < 1) {
        token += c;
        pop();
        continue;
      }
      dispatch();
      clear();
      text = true;
      console.log('\x1b[33mCreated a block\x1b[0m');
    } else if (dynamicBreakline && c == '$', stack) {
      console.log(c, '13');
      if (content) {
        stack.pop();
        continue;
      }

      if (contentText.length < 1) {
        token += c;
        pop();
        continue;
      }

      pop();
      if (stack.length == 0) {
        if (potentialLast) last = true;

        console.log(first, '-', last, '-', potentialLast);

        dispatch();
        clear();
        text = true;
        console.log('\x1b[33mCreated a dynamic breakline\x1b[0m');
      }
    } else if (dynamicBreakline && potentialLast) {
      console.log(c, '15', stack);
      potentialLast = false;
      contentText += c;
    } else if (dynamicBreakline && c == '.') {
      console.log(c, '14', stack);

      if (contentText.length < 1) {
        token += c;
        first = true;
      } else {
        potentialLast = true;
      }
    } else if (functions && /[A-Za-z0-9]/.test(c)) {
      console.log(c, '3', stack);
      functionsText += c;
    } else if (functions) {
      console.log(c, '18', stack);
      token += c;
      pop();
    } else if (placeholder && content && c == '>') {
      console.log(c, '4', stack);
      content = false;
      functions = true;
    } else if ((conditional || placeholder || block) && label && c == ':') {
      console.log(c, '6', stack);
      label = false;
      content = true;
    } else if (label && /[A-Za-z0-9]/.test(c)) {
      console.log(c, '7', stack);
      labelText += c;
    } else if (label) {
      console.log(c, '17', stack);
      token += c;
      moveToText();
    } else if (c == '{') {
      console.log(c, '8', stack);
      stack.push(1);
      if (content) {
        continue;
      }
      dispatch();
      clear();
      placeholder = true;
      label = true;
      token += c;
    } else if (c == '[') {
      console.log(c, '11', stack);
      stack.push(2);
      if (content) {
        continue;
      }
      dispatch();
      clear();
      conditional = true;
      label = true;
      token += c;
    } else if (c == '(') {
      console.log(c, '11', stack);
      stack.push(4);
      if (content) {
        continue;
      }
      dispatch();
      clear();
      block = true;
      label = true;
      token += c;
    } else if (c == '&') {
      console.log(c, '12', stack);
      stack.push(3);
      if (content) {
        continue;
      }
      dispatch();
      clear();
      dynamicBreakline = true;
      content = true;
      token += c;
    } else if (content) {
      console.log(c, '5', stack);
      contentText += c;
    } else {
      console.log(c, '9', stack);
      token += c;
    }
  }

  moveToText();
  dispatch();

  console.log('\x1b[32mDone!\x1b[0m');
  return new List(structures);
}

module.exports = parse;
