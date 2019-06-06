const fs = require('fs');

const parse = require('./lib/parser3');

if (true)
  console.log(
    parse(fs.readFileSync('struc.struc').toString()).compile({
      max: 10,
      body: parse(fs.readFileSync('struc.struc').toString()).compile({
        max: 10,
        body: 'console.log(i)',
        i: 'j'
      })
    })
  );
else console.log(parse(fs.readFileSync('struc.struc').toString()));

global.p = parse;

process.stdin.read();

// const struc = new List([
//   new Text('class '),
//   new Placeholder('name'),
//   new Text(' {'),
//   new DynamicBreakline(
//     new StructureBlock('variables', [
//       new Conditional('vname', [
//         new Placeholder('modifier', 'public '),
//         new Text('$'),
//         new Placeholder('vname'),
//         new Conditional('init', [new Text(' = '), new Placeholder('init')]),
//         new Text(';')
//       ])
//     ])
//   ),
//   new StructureBlock('variables', [
//     new Conditional('get', [
//       new DynamicBreakline([
//         new Placeholder('modifier', 'public '),
//         new Text('get'),
//         new Placeholder('vname', '', fistLetterUp),
//         new Text('() {\nreturn $this->'),
//         new Placeholder('vname'),
//         new Text(';\n}')
//       ])
//     ])
//   ]),
//   new StructureBlock('variables', [
//     new Conditional('set', [
//       new DynamicBreakline([
//         new Placeholder('modifier', 'public '),
//         new Text('set'),
//         new Placeholder('vname', '', fistLetterUp),
//         new Text('() {\n$this->'),
//         new Placeholder('vname'),
//         new Text(' = $'),
//         new Placeholder('vname'),
//         new Text(';\n}')
//       ])
//     ])
//   ]),
//   new Text('}')
// ]);
