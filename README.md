# quaesitor
Quaesitor locates Latin scientific names in Chinese, Czech, Danish, Dutch, English, French, German, Italian, Japanese, Latin, Norwegian, Polish, Portuguese, Russian, Spanish, and Swedish text (approximately 96% of systematic botany and zoology titles). It uses a combination of pattern matching (regular expressions) and a trio of complementary ensembled neural networks. A [live version](https://www.nybg.org/files/scientists/dlittle/quaesitor.html) of the web interface is hosted at the New York Botanical Garden.

### install
`npm install quaesitor --save`

### use (node)
```javascript
import * as path from 'path';
import { Model, Quaesitor } from 'quaesitor';
const m = new Model();
const p = path.dirname(require.resolve('quaesitor/package.json')) + '/dist/assets/';
m.ecnn = fs.readFileSync(p + 'ecnn.pbf');
m.edffnn = fs.readFileSync(p + 'edffnn.pbf');
m.lcnn = fs.readFileSync(p + 'lcnn.pbf');
m.pcnn = fs.readFileSync(p + 'pcnn.pbf');
const q = new Quaesitor();
await q.loadNetworks(m);
const html = false;
console.log(await q.extractSpecies('Text with one or more Latin Scientific names, such as Cupressus sempervirens L., embedded within it.', html));
```

### use (web)
```javascript
import { Model, Quaesitor } from 'quaesitor';

```

### citation
If you use this software, please cite: Little, D.P. Submitted. Recognition of Latin scientific names using artificial neural networks. [Applications in Plant Sciences.](https://doi.org/ADD_DOI)

### license
[MIT](https://github.com/dpl10/quaesitor/blob/master/LICENSE)

### related repositories
* [quaesitor-cli](https://github.com/dpl10/quaesitor-cli)
* [quaesitor-web](https://github.com/dpl10/quaesitor-web)
