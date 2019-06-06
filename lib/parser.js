const {
  Conditional,
  DynamicBreakline,
  List,
  Placeholder,
  StructureBlock,
  Text
} = require('./classes');

const VALID_LABEL_CHARACTERS = [];
for (let i = 0; i < 26; i++) {
  VALID_LABEL_CHARACTERS.push(String.fromCharCode(i + 97)); // lower case
  VALID_LABEL_CHARACTERS.push(String.fromCharCode(i + 65)); // upper case
  if (i < 10) VALID_LABEL_CHARACTERS.push(i);
}

function parse(str) {
  const data = [];

  const stack = [0];
  let buffer = '';
  let parseBuffer = '';
  let placeholderFunctionsBuffer = '';

  // state
  let text = true;
  let conditional = false;
  let conditionalText = false;
  let placeholder = false;
  let placeholderText = false;
  let placeholderFunctions = false;
  let dynamicBreakline = false;
  let dynamicBreaklineText = false;
  let structureBlock = false;
  let structureBlockText = false;
  let ignoreNext = false;

  let textBlock;

  /*
  [Stack codes]
  0 Text
  1 Conditional
  2 Placeholder
  3 Dynamic Breakline
  4 Structure Block
  */

  function pack() {
    if (buffer.length != 0) {
      if (text) data.push(new Text(buffer));
      else if (conditional) data.push(new Conditional(buffer, textBlock));
      else if (placeholder)
        data.push(
          new Placeholder(buffer, textBlock, placeholderFunctionsBuffer)
        );
      else if (dynamicBreakline) data.push(new DynamicBreakline(textBlock));
      else if (structureBlock) data.push(new StructureBlock(buffer, textBlock));
      textBlock = [];
    }
  }

  function clear() {
    buffer = '';

    text = false;
    conditional = false;
    conditionalText = false;
    placeholder = false;
    placeholderText = false;
    placeholderFunctions = false;
    dynamicBreakline = false;
    structureBlock = false;
    structureBlockText = false;
  }

  function stepBack() {
    stack.pop();

    clear();
    switch (stack[stack.length - 1]) {
      case 0:
        text = true;
        break;

      case 1:
        conditional = true;
        break;

      case 2:
        placeholder = true;
        break;

      case 3:
        dynamicBreakline = true;
        break;

      case 4:
        structureBlock = true;
        break;

      default:
        break;
    }
  }

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (ignoreNext) {
      buffer += char;
      ignoreNext = false;
    } else if (char == '\\') {
      ignoreNext = true;
    } else if (conditional && char == ']') {
      if (parseBuffer != '') {
        textBlock = parse(parseBuffer);
        parseBuffer = '';
      }

      pack();
      stepBack();
    } else if (conditional && !conditionalText && char == ' ') {
      conditionalText = true;
    } else if (conditionalText) {
      parseBuffer += char;
    } else if (dynamicBreakline && char == '&') {
      if (parseBuffer != '') {
        textBlock = parse(parseBuffer);
        parseBuffer = '';
      }

      pack();
      stepBack();
    } else if (dynamicBreakline) {
      parseBuffer += char;
    } else if (placeholder && char == '}') {
      if (buffer.length == 0) {
        buffer = '{}';
        clear();
        string = true;
      } else {
        pack();
        stepBack();
      }
    } else if (placeholder && !VALID_LABEL_CHARACTERS.includes(char)) {
      buffer = '{' + buffer + char;
      stack.pop();
      clear();
      string = true;
    } else if (char == '[') {
      pack();
      stack.push(1);
      clear();
      conditional = true;
    } else if (char == '&') {
      pack();
      stack.push(3);
      clear();
      dynamicBreakline = true;
    } else if (char == '{') {
      pack();
      stack.push(2);
      clear();
      placeholder = true;
    } else {
      buffer += char;
    }
  }

  if (buffer.length > 0) {
    pack();
  }

  return data;
}

/**
 *
 * @param {String} str
 * @returns {String}
 */
function fistLetterUp(str) {
  return str.substr(0, 1).toUpperCase() + str.substr(1);
}

module.exports = { parse };
