# quaesitor
Quaesitor locates scientific names in Chinese, Czech, Danish, Dutch, English, French, German, Italian, Japanese, Latin, Norwegian, Polish, Portuguese, Russian, Spanish, and Swedish text (approximately 96% of systematic botany and zoology titles). It uses a combination of pattern matching (regular expressions) and a trio of complementary ensembled neural networks. A live version is available at the [New York Botanical Garden](https://www.nybg.org/files/scientists/dlittle/quaesitor.html).

### install
`npm install quaesitor --save`

### use
```import { Quaesitor } from 'quaesitor';
const q = new Quaesitor();
console.log(q.extractSpecies('Text with one or more Latin Scientific names, such as Cupressus sempervirens L., embedded within it.'));
```

### citation
If you use this software, please cite: Little, D.P. Submitted. Recognition of Latin scientific names using artificial neural networks. [Applications in Plant Sciences.](https://doi.org/ADD_DOI)

### license
[MIT](../blob/master/LICENSE)

### related repositories
[quaesitor-cli](https://github.com/dpl10/quaesitor-cli)
[quaesitor-web](https://github.com/dpl10/quaesitor-web)
