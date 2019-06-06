class CompileableText {
  /**
   * @returns {String}
   */
  compile(data = {}) {}
}

class Text extends CompileableText {
  constructor(text) {
    super();

    this.text = text;
  }

  compile() {
    return this.text;
  }
}

class Placeholder extends CompileableText {
  constructor(label, fallback = '', functionSequence = '') {
    super();

    this.label = label;
    this.fallback = new List(fallback);
    if (functionSequence.length == 0) this.functionSequence = [];
    else this.functionSequence = functionSequence.split(',');
  }

  compile(data = {}) {
    let value = data[this.label] || this.fallback.compile(data);

    for (let i = 0; i < this.functionSequence.length; i++)
      value = this.functionSequence[i](value);

    return value;
  }
}

class Conditional extends CompileableText {
  constructor(label, content = []) {
    super();

    this.label = label;
    this.content = new List(content);
  }

  compile(data = {}) {
    let value = data[this.label] ? this.content.compile(data) : '';
    return value;
  }
}

class DynamicBreakline extends CompileableText {
  constructor(content = [], ignoreFirst = false, ignoreLast = false) {
    super();

    this.content = new List(content);

    this.first = ignoreFirst ? '' : '\n';
    this.last = ignoreLast ? '' : '\n';
  }

  compile(data = {}) {
    let value = this.content.compile(data);
    if (value.length != 0) value = `${this.first}${value}${this.last}`;
    return value;
  }
}

class List extends CompileableText {
  /**
   * @param {Array<CompileableText>} content
   */
  constructor(content = []) {
    super();

    if (content instanceof List) this.content = content.content;
    else this.content = Array.isArray(content) ? content : [content];
  }

  compile(data = {}) {
    let value = '';

    this.content.forEach(x => (value += x.compile(data)));
    return value;
  }
}

class StructureBlock extends CompileableText {
  constructor(label, content = []) {
    super();

    this.label = label;
    this.content = new List(content);
  }

  compile(data = {}) {
    let value = '';

    if (data[this.label])
      data[this.label].forEach(x => (value += this.content.compile(x)));

    return value;
  }
}

module.exports = {
  CompileableText,
  Conditional,
  List,
  DynamicBreakline,
  Placeholder,
  StructureBlock,
  Text
};
