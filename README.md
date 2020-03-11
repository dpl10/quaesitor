# QUAESITOR
*QUAESITOR* locates Latin scientific names in Chinese, Czech, Danish, Dutch, English, French, German, Italian, Japanese, Latin, Norwegian, Polish, Portuguese, Russian, Spanish, and Swedish text (approximately 96% of biodiversity titles). It uses a combination of pattern matching (regular expressions), a Bloom filter, and a trio of complementary ensembled neural networks. A [live version](https://www.nybg.org/files/scientists/dlittle/quaesitor-web/) of the web interface is hosted at the New York Botanical Garden.

<table>
	<tr>
		<td width="33.3%"><img src="./data/fig1.svg"></td>
		<td width="66.6%"><img src="./data/fig2.svg"></td>
	</tr><tr>
		<td width="33.3%">Fig. 1. Precision–recall curves for all possible cutoff values of BF (red), ECNN (green), LCNN (purple), PDFFNN (yellow), uEDFFNN (blue), and bEDFFNN (brown) calculated from validation data (5% of the total dataset; not used for neural network training or testing). A 5% random error was added to the inherent BF error rate to mimic the effect of missing entries thereby depressing the BF, uEDFFNN, and bEDFFNN curves. The binominal (bEDFFNN) and uninominal (uEDFFNN) ensemble classifiers perform better than any of the input classifiers demonstrating complementarity.</td>
		<td width="66.6%">Fig. 2. Precision versus recall for (A) A100, (B) S800, and (C) COPIOUS datasets using LINNAEUS (L), NETINETI (N), QUAESITOR (Q), SPECIES (S), and TAXONFINDER (T). Error bars indicate 95% confidence intervals. Confidence area opacity indicates relative processing time on a log scale with darker colors indicating slower programs.<td>
	</tr>
</table>

### install
`npm install quaesitor --save`

### use (node)
```javascript
import * as path from 'path';
import { Classifiers, Quaesitor } from 'quaesitor';
const c = new Classifiers();
const p = path.dirname(require.resolve('quaesitor/package.json')) + '/dist/assets/';
c.bf = fs.readFileSync(p + 'bf.pbf');
c.ecnn = fs.readFileSync(p + 'ecnn.pbf');
c.lcnn = fs.readFileSync(p + 'lcnn.pbf');
c.pdffnn = fs.readFileSync(p + 'pdffnn.pbf');
const q = new Quaesitor();
await q.loadClassifiers(c);
const html = false;
console.log(await q.extractSpecies('Text with one or more Latin Scientific names, such as Cupressus sempervirens L., embedded within it.', html));
```

### use (web)
Use the [quaesitor.service](https://github.com/dpl10/quaesitor-web/blob/master/src/app/quaesitor.service.ts) in your own Angular project, see an implementation example in [quaesitor.component](https://github.com/dpl10/quaesitor-web/blob/master/src/app/quaesitor/quaesitor.component.ts).

### citation
If you use this software, please cite: Little, D.P. Submitted. Recognition of Latin scientific names using artificial neural networks. [Applications in Plant Sciences.](https://doi.org/ADD_DOI)

### license
[MIT](https://github.com/dpl10/quaesitor/blob/master/LICENSE)

### related repositories
* [quaesitor-cli](https://github.com/dpl10/quaesitor-cli)
* [quaesitor-web](https://github.com/dpl10/quaesitor-web)
