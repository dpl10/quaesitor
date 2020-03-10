#!/bin/bash

###
### INCLUSION SET
###

### Catalogue of life Annual Checklist data extracted from the download:
### http://www.catalogueoflife.org/services/res/COLAC2018.zip
### imported col-2018-annual-checklist.ova into VirtualBox
### copied col-2018-annual-checklist-disk001.vmdk to Ubuntu
### sudo guestmount -a col-2018-annual-checklist-disk001.vmdk -i --ro /media/dpl10/
### sudo cp -R /media/dpl10/var/lib/mysql/col2018ac /var/lib/mysql/
### sudo mysql -u root -p -e 'SELECT name_element FROM scientific_name_element' col2018ac > col2018
cat col2018 | quaesitor/ann/flatten.js | sort -u > col2018.txt

### wcsp-all-pub-names.txt from Kew World Checklist of Selected Plant Families scraped by Lydia Paradiso
cat wcsp-all-pub-names.txt | tr ' ' '\n' | tr -d '.' | quaesitor/ann/flatten.js | sort -u > wcsp.txt

### classification file manually generated
tail -n +2 classification.csv | awk -F, '{print $3}' | quaesitor/ann/flatten.js | sort -u > classification.txt

### GenBank
wget ftp://ftp.ncbi.nih.gov/pub/taxonomy/new_taxdump/new_taxdump.tar.gz
tar xzvf new_taxdump.tar.gz
grep Eukaryota rankedlineage.dmp | awk -F\| '{print $2}' | awk '{if(match($1,/[A-Z]/)){if(match($2,/sp\./)){print $1}else if(match($2,/aff\.|cf\./)){if(match($4,/subsp\.|var\./)){print $1,$3,$4,$5}else{print $1,$3}}else{if(match($3,/subsp\.|var\./)){print $1,$2,$3,$4}else{print $1,$2}}}}' | awk '{if(NF >= 2){if(!match($0,/[0-9]/)){print $0}}}' | grep -v -e 'Ice' -e '/' -e 'X-cell' -e ' mixed' -e ' gen\.' -e 'Uncultured' -e ' environmental' -e '-like' | uniq | tr ' ' '\n' | quaesitor/ann/flatten.js | sort -u > genbank.txt

### combine
sort -u -m classification.txt col2018.txt genbank.txt wcsp.txt | quaesitor/ann/flatten.js -d | uniq | grep -v -P -e '^[a-z]$' -e '^[bcdfghjklmnpqrstvxz]+$' > names.txt
echo -e 'sp\nspp\nsubsp\nssp' >> names.txt

### bloom filter
quaesitor/ann/txt2bloomfilter.js -p 0.01 -i names.txt ### 981k
mv names.pbf quaesitor/src/assets/bf.pbf



###
### EXCLUSION SET
###

### data from NY library and BHL provided by Esther Jackson and Susan Lynch, respectively
### data from AMNH library provided by Mai Reitmeyer

### language    NY monographs proportion cumulative
### eng                 59829     0.6077     0.6077
### ger                 10129     0.1029     0.7106
### fre                  7404     0.0752     0.7858
### rus                  4977     0.0506     0.8364
### spa                  3965     0.0403     0.8766
### lat                  3508     0.0356     0.9123
### por                  1634     0.0166     0.9289
### ita                  1406     0.0143     0.9431
### swe                   932     0.0095     0.9526
### pol                   718     0.0073     0.9599
### dut                   692     0.0070     0.9669
### chi                   570     0.0058     0.9727
### jpn                   475     0.0048     0.9776
### dan                   277     0.0028     0.9804
### cze                   246     0.0025     0.9829
### nor                   186     0.0019     0.9848
### rum                   163     0.0017     0.9864
### ukr                   153     0.0016     0.9880
### fin                   122     0.0012     0.9892
### cat                   116     0.0012     0.9904
### hun                   107     0.0011     0.9915

### language   NY periodicals proportion cumulative
### eng                 15427     0.6424     0.6424
### spa                  1735     0.0722     0.7146
### por                  1520     0.0633     0.7779
### fre                  1080     0.0450     0.8229
### ger                  1010     0.0421     0.8649
### ita                   734     0.0306     0.8955
### rus                   575     0.0239     0.9194
### jpn                   327     0.0136     0.9330
### pol                   226     0.0094     0.9425
### nor                   215     0.0090     0.9514
### chi                   201     0.0084     0.9598
### dut                   166     0.0069     0.9667
### mul                   127     0.0053     0.9720

### language              BHL proportion cumulative
### eng                360074     0.7790     0.7790
### ger                 45694     0.0989     0.8779
### fre                 25079     0.0543     0.9321
### spa                 11442     0.0248     0.9569
### ita                  3703     0.0080     0.9649
### lat                  3152     0.0068     0.9717
### dut                  3062     0.0066     0.9784
### mul                  2456     0.0053     0.9837
### por                  1951     0.0042     0.9879
### swe                  1241     0.0027     0.9906
### chi                   988     0.0021     0.9927
### ???                   841     0.0018     0.9945
### hun                   533     0.0012     0.9957
### rus                   525     0.0011     0.9968
### dan                   522     0.0011     0.9980
### nor                   352     0.0008     0.9987
### jap                   173     0.0004     0.9991
### bul                   146     0.0003     0.9994
### cze                   124     0.0003     0.9997

### language  AMNH monographs proportion cumulative
### eng                 70696     0.8123     0.8123
### ger                  5502     0.0632     0.8755
### fre                  3773     0.0434     0.9188
### rus                  2365     0.0272     0.9460
### spa                  1531     0.0176     0.9636
### ita                   784     0.0090     0.9726
### por                   525     0.0060     0.9786
### jpn                   358     0.0041     0.9828
### chi                   306     0.0035     0.9863
### dut                   306     0.0035     0.9898
### swe                   203     0.0023     0.9921
### lat                   202     0.0023     0.9944
### cze                   132     0.0015     0.9960
### pol                   128     0.0015     0.9974
### nor                   117     0.0013     0.9988
### dan                   107     0.0012     1.0000

### language AMNH periodicals proportion cumulative
### eng                  7293     0.5905     0.5905
### ger                  1336     0.1082     0.6986
### fre                   943     0.0764     0.7750
### spa                   670     0.0542     0.8292
### rus                   593     0.0480     0.8773
### ita                   333     0.0270     0.9042
### por                   300     0.0243     0.9285
### jpn                   190     0.0154     0.9439
### cze                   162     0.0131     0.9570
### dut                   157     0.0127     0.9697
### mul                   137     0.0111     0.9808
### pol                   133     0.0108     0.9916
### chi                   104     0.0084     1.0000

### languages the cover at least 95% of monographs, periodicals, and BHL:      cze,           eng, fre, ger, ita, jpn, lat, nor, pol, por, rus, spa, swe
### languages the cover at least 96% of monographs, periodicals, and BHL: chi, cze, dan, dut, eng, fre, ger, ita, jpn, lat, nor, pol, por, rus, spa, swe
### dictionaries of chi and jpn (and rus) are not needed since they do not use Latin chracters and thus will always be excluded via RegExp

### cze (cs)
wget https://www.karamasoft.com/UltimateSpell/Dictionary/Czech%20\(Czech%20Republic\)/cs-CZ.zip
unzip cs-CZ.zip
mv cs-CZ/cs-CZ.dic cze-00.txt

wget https://github.com/wooorm/dictionaries/blob/master/dictionaries/cs/index.dic?raw=true
tail -n +2 index.dic\?raw\=true | awk -F/ '{print $1}' > cze-01.txt

cat cze-*.txt | quaesitor/ann/flatten.js | sort -u > cze.txt

### dan (da)
wget https://github.com/wooorm/dictionaries/blob/master/dictionaries/da/index.dic?raw=true
tail -n +2 index.dic\?raw\=true | awk -F/ '{print $1}' > dan-00.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/Danish%20\(Denmark\)/da-DK.zip
nzip da-DK.zip
mv da-DK/da-DK.dic dan-01.txt

wget http://www.gwicks.net/textlists/dansk.zip
unzip dansk.zip
mv dansk.txt dan-02.txt

cat dan-*.txt | quaesitor/ann/flatten.js | sort -u > dan.txt

### dut (nl)
wget https://github.com/wooorm/dictionaries/blob/master/dictionaries/nl/index.dic?raw=true
tail -n +2 index.dic\?raw\=true | awk -F/ '{print $1}' > dut-00.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/Dutch%20\(Netherlands\)/nl-NL.zip
unzip nl-NL.zip
tail -n +3 nl-NL/nl-NL.dic > dut-01.txt

wget http://www.gwicks.net/textlists/nederlands.zip
unzip nederlands.zip
mv nederlands.txt dut-02.txt

wget http://www.gwicks.net/textlists/nederlands2.zip
unzip nederlands2.zip
mv nederlands2.txt dut-03.txt

wget http://www.gwicks.net/textlists/nederlands3.zip
unzip nederlands3.zip
mv nederlands3.txt dut-04.txt

cat dut-*.txt | quaesitor/ann/flatten.js | sort -u > dut.txt

### eng (en)
wget https://raw.githubusercontent.com/wooorm/dictionaries/master/dictionaries/en-AU/index.dic
tail -n +2 index.dic | awk -F/ '{print $1}' > eng-00.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/English%20\(Australia\)/en-AU.zip
unzip en-AU.zip
mv en-AU/en-AU.dic eng-01.txt

wget https://raw.githubusercontent.com/wooorm/dictionaries/master/dictionaries/en-CA/index.dic
tail -n +2 index.dic | awk -F/ '{print $1}' > eng-02.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/English%20\(Canada\)/en-CA.zip
unzip en-CA.zip
mv en-CA/en-CA.dic eng-03.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/English%20\(New%20Zealand\)/en-NZ.zip
unzip en-NZ.zip
mv en-NZ/en-NZ.dic eng-04.txt

wget https://raw.githubusercontent.com/wooorm/dictionaries/master/dictionaries/en-GB/index.dic
tail -n +2 index.dic | awk -F/ '{print $1}' > eng-05.txt

wget http://www.gwicks.net/textlists/english2.zip
unzip english2.zip
mv english2.txt eng-06.txt

wget http://www.gwicks.net/textlists/ukenglish.zip
unzip ukenglish.zip
mv ukenglish.txt eng-07.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/English%20\(United%20Kingdom\)/en-GB.zip
unzip en-GB.zip
mv en-GB/en-GB.dic eng-08.txt

wget https://raw.githubusercontent.com/wooorm/dictionaries/master/dictionaries/en-US/index.dic
tail -n +2 index.dic | awk -F/ '{print $1}' > eng-09.txt

wget http://www.gwicks.net/textlists/usa.zip
unzip usa.zip
mv usa.txt eng-10.txt

wget http://www.gwicks.net/textlists/usa2.zip
unzip usa2.zip
mv usa2.txt eng-11.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/English%20\(United%20States\)/en-US.zip
unzip en-US.zip
mv en-US/en-US.dic eng-12.txt

wget https://raw.githubusercontent.com/wooorm/dictionaries/master/dictionaries/en-ZA/index.dic
tail -n +5 index.dic | awk -F/ '{print $1}' > eng-13.txt

### eng-14.txt manually via http://app.aspell.net/create

wget https://github.com/atebits/Words/blob/master/Words/en.txt?raw=true
mv en.txt\?raw\=true eng-15.txt

wget https://github.com/ManiacDC/TypingAid/blob/master/Wordlists/WordList_English%20rommmcek.txt?raw=true
mv WordList_English\ rommmcek.txt\?raw\=true eng-16.txt

wget https://github.com/ManiacDC/TypingAid/blob/master/Wordlists/WordList_English%20rommmcek%20\(4+%20letter%20words%20only\).txt?raw=true
mv WordList_English\ rommmcek\ \(4+\ letter\ words\ only\).txt\?raw\=true eng-17.txt

wget https://github.com/ManiacDC/TypingAid/blob/master/Wordlists/WordList%20English%20Unix.txt?raw=true
mv WordList\ English\ Unix.txt\?raw\=true eng-18.txt

wget https://github.com/ManiacDC/TypingAid/blob/master/Wordlists/WordList%20English%20Gutenberg.txt?raw=true
mv WordList\ English\ Gutenberg.txt\?raw\=true eng-19.txt

wget http://www.gwicks.net/textlists/english3.zip
unzip english3.zip
mv english3.txt eng-20.txt

wget https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt
mv words_alpha.txt eng-21.txt

wget http://www.gwicks.net/textlists/engmix.zip
unzip engmix.zip
mv engmix.txt eng-22.txt

wget http://www.math.sjsu.edu/~foster/dictionary.txt
mv dictionary.txt eng-23.txt

cat eng-*.txt | quaesitor/ann/flatten.js | awk 'BEGIN{print "&c"}{print $0}' | sort -u > eng.txt

### fre (fr)
wget https://github.com/wooorm/dictionaries/blob/master/dictionaries/fr/index.dic?raw=true
tail -n +2 index.dic\?raw\=true | awk -F/ '{print $1}' > fre-00.txt

wget https://github.com/atebits/Words/blob/master/Words/fr.txt?raw=true
mv fr.txt\?raw\=true fre-01.txt

wget http://www.gwicks.net/textlists/francais.zip
unzip francais.zip
mv francais.txt fre-02.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/French%20\(France\)/fr-FR.zip
unzip fr-FR.zip
mv fr-FR/fr-FR.dic fre-03.txt

wget https://github.com/ManiacDC/TypingAid/blob/master/Wordlists/WordList_French%20rommmcek.txt?raw=true
mv WordList_French\ rommmcek.txt\?raw\=true fre-04.txt

cat fre-*.txt | quaesitor/ann/flatten.js | sort -u > fre.txt

### ger (de)
wget https://github.com/wooorm/dictionaries/blob/master/dictionaries/de/index.dic?raw=true
tail -n +16 index.dic\?raw\=true | awk -F/ '{print $1}' > ger-00.txt

wget https://github.com/wooorm/dictionaries/blob/master/dictionaries/de-AT/index.dic?raw=true
tail -n +16 index.dic\?raw\=true | awk -F/ '{print $1}' > ger-01.txt

wget https://github.com/wooorm/dictionaries/blob/master/dictionaries/de-CH/index.dic?raw=true
tail -n +16 index.dic\?raw\=true | awk -F/ '{print $1}' > ger-02.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/German%20\(Switzerland\)/de-CH.zip
unzip de-CH.zip
mv de-CH/de-CH.dic ger-03.txt

wget https://raw.githubusercontent.com/wooorm/dictionaries/master/dictionaries/nds/index.dic
tail -n +2 index.dic | awk -F/ '{print $1}' > ger-04.txt

wget https://sourceforge.net/projects/germandict/files/german.7z/download
mv download download.7z
p7zip -d download.7z
mv austriazismen.txt ger-05.txt
mv helvetismen.txt ger-06.txt

wget https://github.com/enz/german-wordlist/blob/master/words?raw=true
mv words\?raw\=true ger-07.txt

wget https://github.com/atebits/Words/blob/master/Words/de.txt?raw=true
mv de.txt\?raw\=true ger-08.txt

wget https://github.com/ManiacDC/TypingAid/blob/master/Wordlists/WordList_German%20rommmcek.txt?raw=true
mv WordList_German\ rommmcek.txt\?raw\=true ger-09.txt

wget http://www.gwicks.net/textlists/deutsch.zip
unzip deutsch.zip
mv deutsch.txt ger-10.txt

wget http://www.gwicks.net/textlists/swiss.zip
unzip swiss.zip
mv swiss.txt ger-11.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/German%20\(Germany\)/de-DE.zip
unzip de-DE.zip
mv de-DE/de-DE.dic ger-12.txt

### the orgin of ger-13.txt has been lost...

cat ger-*.txt | quaesitor/ann/flatten.js | sort -u > ger.txt

### ita (it)
wget https://github.com/wooorm/dictionaries/blob/master/dictionaries/it/index.dic?raw=true
tail -n +33 index.dic\?raw\=true | awk -F/ '{print $1}' > ita-00.txt

wget wget http://www.yorku.ca/lbianchi/italian_words/italia-1a.gz
gzip -d italia-1a.gz
tail -n +2 italia-1a > ita-01.txt

wget http://www.gwicks.net/textlists/italiano.zip
unzip italiano.zip
mv italiano.txt ita-02.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/Italian%20\(Italy\)/it-IT.zip
unzip it-IT.zip
mv it-IT/it-IT.dic ita-03.txt

wget https://github.com/ManiacDC/TypingAid/blob/master/Wordlists/WordList_ItalianAbc%20rommmcek.txt?raw=true
mv WordList_ItalianAbc\ rommmcek.txt\?raw\=true ita-04.txt

cat ita-*.txt | quaesitor/ann/flatten.js | sort -u > ita.txt

### lat (la)
wget https://github.com/wooorm/dictionaries/blob/master/dictionaries/la/index.dic?raw=true
tail -n +15 index.dic\?raw\=true | awk -F/ '{print $1}' > lat-00.txt

wget https://github.com/bbloomf/verbalatina/blob/master/output/nouns.json?raw=true
grep orthography nouns.json\?raw\=true | awk -F\" '{print $4}' > lat-01.txt
wget https://github.com/bbloomf/verbalatina/blob/master/output/verbs.json?raw=true
grep orthography verbs.json\?raw\=true | awk -F\" '{print $4}' >> lat-01.txt

wget http://www.math.ubc.ca/~cass/frivs/latin/latin-dict-full.html
grep STRONG latin-dict-full.html | awk -F\> '{print $3}' | awk '{print $1}' > lat-02.txt

wget https://sourceforge.net/projects/wwwords/files/Whitaker/dictpage.zip/download
mv download download.zip
unzip download.zip
cat DICTPAGE.RAW | tr -d '#' | perl -pe 's/, /,/g' | perl -pe 's/  /*/' | awk -F* '{print $1}' | tr ',' '\n' > lat-03.txt

cat lat-*.txt | quaesitor/ann/flatten.js | sort -u > lat.txt

### nor (nb and no)
wget https://github.com/wooorm/dictionaries/blob/master/dictionaries/nb/index.dic?raw=true
tail -n +2 index.dic\?raw\=true | awk -F/ '{print $1}' > nor-00.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/Norwegian%20Bokmaal%20\(Norway\)/nb-NO.zip
unzip nb-NO.zip
mv nb-NO/nb-NO.dic nor-01.txt

wget https://github.com/wooorm/dictionaries/blob/master/dictionaries/nn/index.dic?raw=true
tail -n +2 index.dic\?raw\=true | awk -F/ '{print $1}' > nor-02.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/Norwegian%20Nynorsk%20\(Norway\)/nn-NO.zip
unzip nn-NO.zip
mv nn-NO/nn-NO.dic nor-03.txt

wget https://github.com/Ondkloss/norwegian-wordlist/blob/master/20180626_norsk_ordbank_nno_2012.tar.gz?raw=true
mv 20180626_norsk_ordbank_nno_2012.tar.gz\?raw\=true x.tar.gz
tar xvzf x.tar.gz
tail -n +2 20180626_norsk_ordbank_nno_2012/lemma_2012.txt | awk '{print $3}' > nor-04.txt

wget https://github.com/Ondkloss/norwegian-wordlist/blob/master/20180627_norsk_ordbank_nob_2005.tar.gz?raw=true
mv 20180627_norsk_ordbank_nob_2005.tar.gz\?raw\=true x.tar.gz
tar xvzf x.tar.gz
tail -n +2 20180627_norsk_ordbank_nob_2005/lemma.txt | awk '{print $3}' > nor-05.txt

wget http://www.gwicks.net/textlists/norsk.zip
unzip norsk.zip
mv norsk.txt nor-06.txt

wget https://github.com/Ondkloss/norwegian-wordlist/blob/master/wordlist_20180627_norsk_ordbank_nob_2005.txt?raw=true
mv wordlist_20180627_norsk_ordbank_nob_2005.txt\?raw\=true nor-07.txt

wget https://github.com/Ondkloss/norwegian-wordlist/blob/master/wordlist_20180626_norsk_ordbank_nno_2012.txt?raw=true
mv wordlist_20180626_norsk_ordbank_nno_2012.txt\?raw\=true nor-08.txt

cat nor-*.txt | quaesitor/ann/flatten.js | sort -u > nor.txt

### pol (pl)
wget https://github.com/wooorm/dictionaries/blob/master/dictionaries/pl/index.dic?raw=true
tail -n +2 index.dic\?raw\=true | awk -F/ '{print $1}' > pol-00.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/Polish%20\(Poland\)/pl-PL.zip
unzip pl-PL.zip
mv pl-PL/pl-PL.dic pol-01.txt

cat pol-*.txt | quaesitor/ann/flatten.js | sort -u > pol.txt

### por (pt)
wget https://github.com/wooorm/dictionaries/blob/master/dictionaries/pt/index.dic?raw=true
tail -n +13 index.dic\?raw\=true | awk -F/ '{print $1}' > por-00.txt
echo 'à' >> por-00.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/Portuguese%20\(Portugal\)/pt-PT.zip
unzip pt-PT.zip
mv pt-PT/pt-PT.dic por-01.txt

wget https://github.com/wooorm/dictionaries/blob/master/dictionaries/pt-BR/index.dic?raw=true
tail -n +2 index.dic\?raw\=true | awk -F/ '{print $1}' > por-02.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/Portuguese%20\(Brazil\)/pt-BR.zip
unzip pt-BR.zip
mv pt-BR/pt-BR.dic por-03.txt

cat por-*.txt | quaesitor/ann/flatten.js | sort -u > por.txt

### rus (ru)
wget https://github.com/wooorm/dictionaries/blob/master/dictionaries/ru/index.dic?raw=true
tail -n +2 index.dic\?raw\=true | awk -F/ '{print $1}' > rus-00.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/Russian%20\(Russia\)/ru-RU.zip
unzip ru-RU.zip
mv ru-RU/ru-RU.dic rus-01.txt

cat rus-*.txt | quaesitor/ann/flatten.js | sort -u > rus.txt ### no words that only use Latin characters

### spa (es)
wget https://raw.githubusercontent.com/wooorm/dictionaries/master/dictionaries/es/index.dic
mv index.dic spa-00.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/Spanish%20\(Mexico\)/es-MX.zip
unzip es-MX.zip
mv es-MX/es-MX.dic spa-01.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/Spanish%20\(Spain\)/es-ES.zip
unzip es-ES.zip
mv es-ES/es-ES.dic spa-02.txt

wget https://github.com/atebits/Words/blob/master/Words/es.txt?raw=true
mv es.txt\?raw\=true spa-03.txt

wget http://www.gwicks.net/textlists/espanol.zip
unzip espanol.zip
mv espanol.txt spa-04.txt

wget https://github.com/ManiacDC/TypingAid/blob/master/Wordlists/WordList_SpanishAbc%20rommmcek.txt?raw=true
mv WordList_SpanishAbc\ rommmcek.txt\?raw\=true spa-05.txt

wget https://raw.githubusercontent.com/ManiacDC/TypingAid/master/Wordlists/Wordlist%20Spanish.txt
mv Wordlist\ Spanish.txt spa-06.txt

cat spa-*.txt | quaesitor/ann/flatten.js | sort -u > spa.txt

### swe (sv)
wget https://github.com/wooorm/dictionaries/blob/master/dictionaries/sv/index.dic?raw=true
tail -n +2 index.dic\?raw\=true | awk -F/ '{print $1}' > swe-00.txt

wget https://www.karamasoft.com/UltimateSpell/Dictionary/Swedish%20\(Sweden\)/sv-SE.zip
unzip sv-SE.zip
mv sv-SE/sv-SE.dic swe-01.txt

wget https://github.com/martinlindhe/wordlist_swedish/blob/master/swe_wordlist?raw=true
mv swe_wordlist\?raw\=true swe-02.txt

cat swe-*.txt | quaesitor/ann/flatten.js | sort -u > swe.txt

### OSM place names
ls anthropogenic_*.json natural_*.json political_*.json | xargs -I {} -P $(nproc) jq '.features[].properties.name' {} | uniq | tr -d '"' | tr ' ' '\n' | quaesitor/ann/flatten.js -d | uniq > x
sort -u x > osm.txt
rm x
sed -i 's/ ٌrocade/rocade/' osm.txt ### a kluge

### combine and flatten
sort -u -m cze.txt dan.txt dut.txt eng.txt fre.txt ger.txt ita.txt lat.txt nor.txt pol.txt por.txt rus.txt spa.txt swe.txt osm.txt | quaesitor/ann/flatten.js -d | grep -v -e '[^a-z]' | uniq > dictionary.txt



###
### ARTIFICIAL NEURAL NETWORKS
###

### data preprocessing
awk '{print "0," $0}' dictionary.txt > x
awk '{print "1," $0}' names.txt >> x
sort -u x > y
shuf --random-source=<(openssl enc -aes-256-ctr -pass pass:5 -nosalt </dev/zero 2>/dev/null) y | split -d -nr/2 ### using 5 as the random seed
mv x00 level0.csv ### 50%
mv x01 z
split -d -nr/10 z
mv x09 level2.csv ### 5%
cat x0* > level1.csv ### 45%
rm x y z

### level0: convolutional neural network using simple encoded letters (lcnn)
WIDTH=$(cat dictionary.txt names.txt | awk 'BEGIN{x=0}{if(length($1)>x){x=length($1)}}END{printf x}')
echo 'width:' $WIDTH ### 58
split -d -nr/$(nproc) level0.csv
find . -type f -name 'x*' | xargs -I {} -P $(nproc) bash -c "quaesitor/ann/scientificNames-lcnn.js -i {} -w $WIDTH > {}.int"
mkdir level0
cat *.int | split -a 4 -d -l 1024 - level0/level0-
rm level0/level0-7038 ### incomplete
rename 's/$/\.csv/' level0/*
mkdir level0v
ls level0 | tail -16 | xargs -I {} -P 1 mv level0/{} level0v/
source ./tensorflow/bin/activate ### maybe should have used the 'faster' anaconda version...
dropout=( 0.025 0.05 0.1 0.2 ) ### best: 0.025
embedding=( 16 32 64 128 ) ### best: 64
filters=( 16 32 64 128 ) ### best: 32
kernel=( 2 4 8 16 ) ### best: 4
pool=( 2 4 8 16 ) ### best: 2
for d in "${dropout[@]}"; do
	for e in "${embedding[@]}"; do
		for f in "${filters[@]}"; do
			for k in "${kernel[@]}"; do
				for p in "${pool[@]}"; do
					DIR='lcnn-d'$d'e'$e'f'$f'k'$k'p'$p
					if [ ! -d "$DIR" ]; then
						mkdir $DIR
						quaesitor/ann/scientificNames-lcnn.py -d $d -e $e -f $f -i level0 -k $k -m 256 -o $DIR -p $p -v level0v -w $WIDTH
					fi
				done
			done
		done
	done
done ### best final.hdf5: AUC = 0.8306; loss = 0.0172; accuracy = 0.9355; 109k + 6.6k
for k in {1..128}; do
	DIR='lcnn-'$k
	if [ ! -d "$DIR" ]; then
		mkdir $DIR
		quaesitor/ann/scientificNames-lcnn.py -d 0.025 -e 64 -f 32 -i level0 -k 4 -m 256 -o $DIR -p 2 -v level0v -w $WIDTH
	fi
done ### best: AUC = 0.8419; loss = 0.0174; accuracy = 0.9393; 109k + 6.6k
find . -type f -name 'training*.hdf5' | awk -F- 'BEGIN{OFS="-"}{x=$(NF-1);gsub("[^0-9.]","",x);if(x<0.02){print $0}}' | xargs -I {} -P $(nproc) bash -c "OUT=\$(echo {} | sed 's/.hdf5$/.csv/'); quaesitor/ann/scientificNames-lcnn-auc.py -c 1 -w $WIDTH -v level0v -i {} -o \$OUT"
cp $(find . -type f -name '*.csv' | grep -v 'level0' | xargs -I {} -P 1 bash -c 'echo {} $(tail -1 {} | awk -F, "{print \$NF}")' | sort -n -k 2 | tail -1 | awk '{print $1}' | sed 's/stats.csv$/final.hdf5/') lcnn.hdf5
tensorflowjs_converter --quantization_bytes 2 --input_format=keras lcnn.hdf5 quaesitor/src/assets/lcnn
mv quaesitor/src/assets/lcnn/model.json quaesitor/src/assets/lcnn.json
sed -i 's/group1-shard1of1.bin/lcnn.pbf/' quaesitor/src/assets/lcnn.json
mv quaesitor/src/assets/lcnn/group1-shard1of1.bin quaesitor/src/assets/lcnn.pbf
rm -R quaesitor/src/assets/lcnn/
deactivate

### level0: pseudosyllable deep feed-forward neural network (pdffnn)
shuf -n 100000 dictionary.txt > words.txt
shuf -n 100000 names.txt >> words.txt
echo 'pseudosyllable,1,0,DV' > quaesitor/ann/scientificNames-dv.csv
quaesitor/ann/pseudosyllables.js -n 3 | xargs -I {} -P $(nproc) bash -c 'echo {} $(grep -c {} words.txt | tr -d "\n") | awk "{x=200000-\$2;dv=2*\$2*x;print \$1,\$2,x,dv}" | tr " " ","' >> quaesitor/ann/scientificNames-dv.csv
tail -n +2 quaesitor/ann/scientificNames-dv.csv | sort -u | sort -n --field-separator=',' --key=4 | tail -n 6144 | sort -n -r --field-separator=',' --key=4 | awk -F, '{print $1}' > r
quaesitor/ann/scientificNames-pseudosyllable-group.pl -n 64 -i r 1> quaesitor/ann/scientificNames-pseudosyllables.txt 2> r.err
split -d -nr/$(nproc) level0.csv
find . -type f -name 'x*' | xargs -I {} -P $(nproc) bash -c 'quaesitor/ann/scientificNames-pseudosyllablize.js -i {} > {}.csv'
sort -u x*.csv > y ### 7,206,939 -> 7,201,577
mkdir level0
sort -R --random-source=<(openssl enc -aes-256-ctr -pass pass:5 -nosalt </dev/zero 2>/dev/null) y | split -a 4 -d -l 1024 - level0/level0- ### using 5 as the random seed
rm level0/level0-7032 ### incomplete
rename 's/$/\.csv/' level0/*
mkdir level0v
ls level0 | tail -16 | xargs -I {} -P 1 mv level0/{} level0v/
source ./tensorflow/bin/activate
WIDTH=$(tail -1 level0/level0-0000 | awk -F, '{print NF-1}' | tr -d '\n')
echo 'width:' $WIDTH ### 64
dropout=( 0.025 0.05 0.1 0.2 )
for d in "${dropout[@]}"; do ### best: 0.2
	for l in {2..16..2}; do ### best: 2
		for u in {8..256..8}; do ### best: 240
			DIR='pdffnn-d'$d'l'$l'u'$u
			if [ ! -d "$DIR" ]; then
				mkdir $DIR
				quaesitor/ann/scientificNames-pdffnn.py -d $d -i level0 -l $l -m 256 -o $DIR -u $u -v level0v -w $WIDTH
			fi
		done
	done
done ### best: AUC = 0.7385; loss = 0.0290; accuracy = 0.9133; 99k + 7.4k
for k in {1..128}; do
	DIR='pdffnn-'$k
	if [ ! -d "$DIR" ]; then
		mkdir $DIR
		quaesitor/ann/scientificNames-pdffnn.py -d 0.2 -i level0 -l 2 -m 256 -o $DIR -u 240 -v level0v -w $WIDTH
	fi
done ### best: AUC = 0.7404; loss = 0.0267; accuracy = 0.9025; 99k + 7.4k
find . -type f -name 'training*.hdf5' | awk -F- 'BEGIN{OFS="-"}{x=$(NF-1);gsub("[^0-9.]","",x);if(x<0.03){print $0}}' | xargs -I {} -P $(nproc) bash -c "OUT=\$(echo {} | sed 's/.hdf5$/.csv/'); quaesitor/ann/scientificNames-pdffnn-auc.py -c 1 -w $WIDTH -v level0v -i {} -o \$OUT"
cp $(find . -type f -name '*.csv' | grep -v 'level0' | xargs -I {} -P 1 bash -c 'echo {} $(tail -1 {} | awk -F, "{print \$NF}")' | sort -n -k 2 | tail -1 | awk '{print $1}' | sed 's/stats.csv$/final.hdf5/') pdffnn.hdf5
tensorflowjs_converter --quantization_bytes 2 --input_format=keras pdffnn.hdf5 quaesitor/src/assets/pdffnn
mv quaesitor/src/assets/pdffnn/model.json quaesitor/src/assets/pdffnn.json
sed -i 's/group1-shard1of1.bin/pdffnn.pbf/' quaesitor/src/assets/pdffnn.json
sed -i 's/BatchNormalizationV1/BatchNormalization/g' quaesitor/src/assets/pdffnn.json ### tensorflow 1.13 bug work around
mv quaesitor/src/assets/pdffnn/group1-shard1of1.bin quaesitor/src/assets/pdffnn.pbf
rm -R quaesitor/src/assets/pdffnn/
deactivate

### level0: convolutional neural network using Eudex 'hash' encoding (ecnn; https://github.com/ticki/eudex)
R CMD BATCH scientificNames-eudex.r ### manually rescaled and converted output for scientificNames-eudex.js
WIDTH=16 ### mean+1*sd=15.57: awk -F, '{print length($2)}' level0.csv | sort -n | uniq -c | perl -lane 'print $F[1], "\t", "=" x ($F[0]/20000)'; awk -F, '{print length($2)}' level0.csv | mean.pl
split -d -nr/$(nproc) level0.csv
find . -type f -name 'x*' | xargs -I {} -P $(nproc) bash -c "quaesitor/ann/scientificNames-eudex.js -i {} -w $WIDTH > {}.csv"
sort -u x*.csv > y ### 7,206,939 -> 6,873,261
mkdir level0
sort -R --random-source=<(openssl enc -aes-256-ctr -pass pass:5 -nosalt </dev/zero 2>/dev/null) y | split -a 4 -d -l 1024 - level0/level0- ### using 5 as the random seed
rm level0/level0-6704 ### incomplete
rename 's/$/\.csv/' level0/*
mkdir level0v
ls level0 | tail -16 | xargs -I {} -P 1 mv level0/{} level0v/
source ./tensorflow/bin/activate
dropout=( 0.025 0.05 0.1 0.2 ) ### best: 0.025
filters=( 16 32 64 128 ) ### best: 32
kernel=( 2 4 8 16 ) ### best: 4
pool=( 2 4 8 16 ) ### best: 16
for d in "${dropout[@]}"; do
	for f in "${filters[@]}"; do
		for k in "${kernel[@]}"; do
			for p in "${pool[@]}"; do
				DIR='ecnn-d'$d'f'$f'k'$k'p'$p
				if [ ! -d "$DIR" ]; then
					mkdir $DIR
					quaesitor/ann/scientificNames-ecnn.py -d $d -f $f -i level0 -k $k -m 384 -o $DIR -p $p -v level0v -w $WIDTH
				fi
			done
		done
	done
done ### best: AUC = 0.7112; loss = 0.0318; accuracy = 0.8888; 142k + 6.7k
for k in {1..128}; do
	DIR='ecnn-'$k
	if [ ! -d "$DIR" ]; then
		mkdir $DIR
		quaesitor/ann/scientificNames-ecnn.py -d 0.025 -f 32 -i level0 -k 4 -m 384 -o $DIR -p 16 -v level0v -w $WIDTH
	fi
done ### best: AUC = 0.7174; loss = 0.0298; accuracy = 0.8913; 142k + 6.6k
find . -type f -name 'training*.hdf5' | awk -F- 'BEGIN{OFS="-"}{x=$(NF-1);gsub("[^0-9.]","",x);if(x<0.03){print $0}}' | xargs -I {} -P $(nproc) bash -c "OUT=\$(echo {} | sed 's/.hdf5$/.csv/'); quaesitor/ann/scientificNames-ecnn-auc.py -c 1 -w $WIDTH -v level0v -i {} -o \$OUT"
cp $(find . -type f -name '*.csv' | grep -v 'level0' | xargs -I {} -P 1 bash -c 'echo {} $(tail -1 {} | awk -F, "{print \$NF}")' | sort -n -k 2 | tail -1 | awk '{print $1}' | sed 's/stats.csv$/final.hdf5/') ecnn.hdf5
tensorflowjs_converter --quantization_bytes 2 --input_format=keras ecnn.hdf5 quaesitor/src/assets/ecnn
mv quaesitor/src/assets/ecnn/model.json quaesitor/src/assets/ecnn.json
sed -i 's/group1-shard1of1.bin/ecnn.pbf/' quaesitor/src/assets/ecnn.json
mv quaesitor/src/assets/ecnn/group1-shard1of1.bin quaesitor/src/assets/ecnn.pbf
rm -R quaesitor/src/assets/ecnn/
deactivate

### level1: uninomial|binomial ensemble data
### rate of new names = 0.05 === (1,900,983[col2018] - 1,803,488[col2017]) / 1,900,983 [from http://www.catalogueoflife.org/col/info/websites assumes species === new words (maybe)]
split -d -nr/$(nproc) level1.csv
find . -type f -name 'x*' | xargs -I {} -P $(nproc) bash -c 'K=$(echo {} | tr -d "./x"); quaesitor/ann/scientificNames-ensemble.js -b quaesitor/src/assets/bf.pbf -e quaesitor/src/assets/ecnn.json -i {} -l quaesitor/src/assets/lcnn.json -p quaesitor/src/assets/pdffnn.json -s 0.05 > ensembleL1-$K'
BC='BEGIN{OFS=",";b["c"]=99}{if(b["c"]==x){if($1==y){print b["c"],$1,b["n"],$2,b["b"],b["e"],b["l"],b["p"],$3,$4,$5,$6;b["c"]=$1;b["n"]=$2;b["b"]=$3;b["e"]=$4;b["l"]=$5;b["p"]=$6}}else if(b["c"]==y){if($1==x){print $1,b["c"],$2,b["n"],$3,$4,$5,$6,b["b"],b["e"],b["l"],b["p"];b["c"]=$1;b["n"]=$2;b["b"]=$3;b["e"]=$4;b["l"]=$5;b["p"]=$6}}else{b["c"]=$1;b["n"]=$2;b["b"]=$3;b["e"]=$4;b["l"]=$5;b["p"]=$6}}'
BR='BEGIN{OFS=","}{c=0;if(($1==1)&&($2==1)){c=1}; printf "%i,%.7f,%.7f,%.7f,%.7f,%.7f\n",c,$5*$9,$6*$10,$7*$11,$8*$12,(length($3)+length($4))/116}'
cat ensembleL1-* > y
shuf --random-source=<(openssl enc -aes-256-ctr -pass pass:5 -nosalt </dev/zero 2>/dev/null) -r -n 100000000 y | tee >(awk -F, -v x=0 -v y=0 "$BC" | awk -F, "$BR" > b-00) >(awk -F, -v x=0 -v y=1 "$BC" | awk -F, "$BR" > b-01) | awk -F, -v x=1 -v y=1 "$BC" | awk -F, "$BR" > b-11
find . -type f -name 'b-*' | xargs -I {} -P 3 bash -c 'sort -u {} > {}-u'
shuf --random-source=<(openssl enc -aes-256-ctr -pass pass:5 -nosalt </dev/zero 2>/dev/null) -n 6109073 b-00-u >  b-0x
shuf --random-source=<(openssl enc -aes-256-ctr -pass pass:5 -nosalt </dev/zero 2>/dev/null) -n 6109073 b-01-u >> b-0x
sort -u b-0x > b-0x-u
shuf --random-source=<(openssl enc -aes-256-ctr -pass pass:5 -nosalt </dev/zero 2>/dev/null) -n 6109073 b-0x-u  > b-xx-us ### to match uninomial
shuf --random-source=<(openssl enc -aes-256-ctr -pass pass:5 -nosalt </dev/zero 2>/dev/null) -n  377173 b-11-u >> b-xx-us
sort -R --random-source=<(openssl enc -aes-256-ctr -pass pass:5 -nosalt </dev/zero 2>/dev/null) b-xx-us > level1-belda.csv

### level1: uninomial|binomial ensemble linear discriminate analysis ([u|b]elda)
awk -F, 'BEGIN{OFS=","}{printf "%i,%.7f,%.7f,%.7f,%.7f,%.7f\n",$1,$3,$4,$5,$6,length($2)/58}' ensembleL1-* > y
sort -u y > z
sort -R --random-source=<(openssl enc -aes-256-ctr -pass pass:5 -nosalt </dev/zero 2>/dev/null) z | xz -9 > level1-uelda.csv.xz
xz -9 level1-belda.csv
R CMD BATCH scientificNames-ensemble.r ### a little, to a lot, worse than the networks; u ~ b

### level1: uninomial ensemble deep feed-forward neural network (uedffnn)
awk -F, 'BEGIN{OFS=","}{printf "%i,%.7f,%.7f,%.7f,%.7f,%.7f\n",$1,$3,$4,$5,$6,length($2)/58}' ensembleL1-* > y
sort -u y > z ### 6,486,246 -> 6,485,922
mkdir level1u
sort -R --random-source=<(openssl enc -aes-256-ctr -pass pass:5 -nosalt </dev/zero 2>/dev/null) z | split -a 4 -d -l 1024 - level1u/level1u-
rm 'level1u/'$(ls level1u | tail -1) ### incomplete
rename 's/$/\.csv/' level1u/*
mkdir level1uv
ls level1u | tail -16 | xargs -I {} -P 1 mv level1u/{} level1uv/
source ./tensorflow/bin/activate
dropout=( 0.025 0.05 0.1 0.2 )
for d in "${dropout[@]}"; do ### best: 0.2
	for l in {2..16..2}; do ### best: 8
		for u in {8..256..8}; do ### best: 64
			DIR='uedffnn'$c'-d'$d'l'$l'u'$u
			if [ ! -d "$DIR" ]; then
				mkdir $DIR
				quaesitor/ann/scientificNames-edffnn.py -d $d -i level1u -l $l -m 256 -o $DIR -u $u -v level1uv -w 5
			fi
		done
	done
done ### best: AUC = 0.9466; loss = 0.0102; accuracy = 0.9675; 9k + 19k
for k in {1..128}; do
	DIR='uedffnn-'$k
	if [ ! -d "$DIR" ]; then
		mkdir $DIR
		quaesitor/ann/scientificNames-edffnn.py -d 0.2 -i level1u -l 8 -m 256 -o $DIR -u 64 -v level1uv -w 5
	fi
done ### best: AUC = 0.9465; loss = 0.0097; accuracy = 0.9650; 9k + 19k
find . -type f -name 'training*.hdf5' | awk -F- 'BEGIN{OFS="-"}{x=$(NF-1);gsub("[^0-9.]","",x);if(x<0.01){print $0}}' | xargs -I {} -P $(nproc) bash -c "OUT=\$(echo {} | sed 's/.hdf5$/.csv/'); quaesitor/ann/scientificNames-edffnn-auc.py -c 1 -w 5 -v level1uv -i {} -o \$OUT"
cp $(find . -type f -name '*.csv' | grep -v 'level1' | xargs -I {} -P 1 bash -c 'echo {} $(tail -1 {} | awk -F, "{print \$NF}")' | sort -n -k 2 | tail -1 | awk '{print $1}' | sed 's/stats.csv$/final.hdf5/') uedffnn.hdf5
tensorflowjs_converter --quantization_bytes 2 --input_format=keras uedffnn.hdf5 quaesitor/src/assets/uedffnn
mv quaesitor/src/assets/uedffnn/model.json quaesitor/src/assets/uedffnn.json
sed -i 's/group1-shard1of1.bin/uedffnn.pbf/' quaesitor/src/assets/uedffnn.json
sed -i 's/BatchNormalizationV1/BatchNormalization/g' quaesitor/src/assets/uedffnn.json ### tensorflow 1.13 bug work around
mv quaesitor/src/assets/uedffnn/group1-shard1of1.bin quaesitor/src/assets/uedffnn.pbf
rm -R quaesitor/src/assets/uedffnn/
deactivate

### level1: binomial ensemble deep feed-forward neural network (bedffnn)
mkdir level1b
xz -cdk level1-belda.csv.xz | split -a 4 -d -l 1024 - level1b/level1b-
rm 'level1b/'$(ls level1b | tail -1) ### incomplete
rename 's/$/\.csv/' level1b/*
mkdir level1bv
ls level1b | tail -16 | xargs -I {} -P 1 mv level1b/{} level1bv/
source ./tensorflow/bin/activate
dropout=( 0.025 0.05 0.1 0.2 )
for d in "${dropout[@]}"; do ### best: 0.1
	for l in {2..16..2}; do ### best: 14
		for u in {8..256..8}; do ### best: 64
			DIR='bedffnn-d'$d'l'$l'u'$u
			if [ ! -d "$DIR" ]; then
				mkdir $DIR
				quaesitor/ann/scientificNames-edffnn.py -d $d -i level1b -l $l -m 256 -o $DIR -u $u -v level1bv -w 5
			fi
		done
	done
done ### best: AUC = 0.9494; loss = 0.0103; accuracy = 0.9708; 9.6k + 31k
for k in {1..128}; do
	DIR='bedffnn-'$k
	if [ ! -d "$DIR" ]; then
		mkdir $DIR
		quaesitor/ann/scientificNames-edffnn.py -d 0.1 -i level1b -l 14 -m 256 -o $DIR -u 64 -v level1bv -w 5
	fi
done ### best: AUC = 0.9506; loss = 0.0098; accuracy = 0.9719; 9.6k + 31k
find . -type f -name 'training*.hdf5' | awk -F- 'BEGIN{OFS="-"}{x=$(NF-1);gsub("[^0-9.]","",x);if(x<0.01){print $0}}' | xargs -I {} -P $(nproc) bash -c "OUT=\$(echo {} | sed 's/.hdf5$/.csv/'); quaesitor/ann/scientificNames-edffnn-auc.py -c 1 -w 5 -v level1bv -i {} -o \$OUT"
cp $(find . -type f -name '*.csv' | grep -v 'level1' | xargs -I {} -P 1 bash -c 'echo {} $(tail -1 {} | awk -F, "{print \$NF}")' | sort -n -k 2 | tail -1 | awk '{print $1}' | sed 's/stats.csv$/final.hdf5/') bedffnn.hdf5
tensorflowjs_converter --quantization_bytes 2 --input_format=keras bedffnn.hdf5 quaesitor/src/assets/bedffnn
mv quaesitor/src/assets/bedffnn/model.json quaesitor/src/assets/bedffnn.json
sed -i 's/group1-shard1of1.bin/bedffnn.pbf/' quaesitor/src/assets/bedffnn.json
sed -i 's/BatchNormalizationV1/BatchNormalization/g' quaesitor/src/assets/bedffnn.json ### tensorflow 1.13 bug work around
mv quaesitor/src/assets/bedffnn/group1-shard1of1.bin quaesitor/src/assets/bedffnn.pbf
rm -R quaesitor/src/assets/bedffnn/
deactivate

### level2: validation and performance data
split -d -nr/$(nproc) level2.csv l2-
find . -type f -name 'l2-*' | xargs -I {} -P $(nproc) bash -c 'K=$(echo {} | awk -F- "{print \$2}"); quaesitor/ann/scientificNames-ensemble.js -b quaesitor/src/assets/bf.pbf -e quaesitor/src/assets/ecnn.json -i {} -l quaesitor/src/assets/lcnn.json -p quaesitor/src/assets/pdffnn.json -s 0.05 > l2s-$K'
awk -F, 'BEGIN{OFS=","}{printf "%i,%.7f,%.7f,%.7f,%.7f,%.7f\n",$1,$3,$4,$5,$6,length($2)/58}' l2s-* > y
sort -u y > z ### 720,693 -> 720,690
mkdir level2u
sort -R --random-source=<(openssl enc -aes-256-ctr -pass pass:5 -nosalt </dev/zero 2>/dev/null) z | split -a 4 -d -l 1024 - level2u/level2u- ### using 5 as the random seed
rm 'level2u/'$(ls level2u | tail -1) ### incomplete
rename 's/$/\.csv/' level2u/*
awk -F, 'BEGIN{OFS=","}{printf "%i,%s,%.7f,%.7f,%.7f,%.7f,%.7f\n",$1,$2,$3,$4,$5,$6,length($2)/58}' l2s-* | split -d -nr/$(nproc) - l2su-
find . -type f -name 'l2su-*' | xargs -I {} -P $(nproc) bash -c 'K=$(echo {} | awk -F- "{print \$2}"); quaesitor/ann/scientificNames-edffnn.js -e quaesitor/src/assets/uedffnn.json -i {} > l2s+u-$K'
sort -k1 -t',' -n l2s+u-* > belpw+u.csv
xz -9 -k belpw+u.csv
sort -u l2s+u-* > y
shuf --random-source=<(openssl enc -aes-256-ctr -pass pass:5 -nosalt </dev/zero 2>/dev/null) -r -n 10000000 y | tee >(awk -F, -v x=0 -v y=0 "$BC" | awk -F, "$BR" > b-00) >(awk -F, -v x=0 -v y=1 "$BC" | awk -F, "$BR" > b-01) | awk -F, -v x=1 -v y=1 "$BC" | awk -F, "$BR" > b-11
find . -type f -name 'b-*' | xargs -I {} -P 3 bash -c 'sort -u {} > {}-u'
shuf --random-source=<(openssl enc -aes-256-ctr -pass pass:5 -nosalt </dev/zero 2>/dev/null) -n 678900 b-00-u >  b-0x
shuf --random-source=<(openssl enc -aes-256-ctr -pass pass:5 -nosalt </dev/zero 2>/dev/null) -n 678900 b-01-u >> b-0x
sort -u b-0x > b-0x-u
shuf --random-source=<(openssl enc -aes-256-ctr -pass pass:5 -nosalt </dev/zero 2>/dev/null) -n 678900 b-0x-u  > b-xx-us ### to match uninomial
shuf --random-source=<(openssl enc -aes-256-ctr -pass pass:5 -nosalt </dev/zero 2>/dev/null) -n  41793 b-11-u >> b-xx-us
mkdir level2b
sort -R --random-source=<(openssl enc -aes-256-ctr -pass pass:5 -nosalt </dev/zero 2>/dev/null) b-xx-us | split -a 4 -d -l 1024 - level2b/level2b- ### using 5 as the random seed
rm 'level2b/'$(ls level2b | tail -1) ### incomplete
rename 's/$/\.csv/' level2b/*
awk -F, 'BEGIN{OFS=","}{print $1,"x+y",$2,$3,$4,$5,$6}' b-xx-us | split -d -nr/$(nproc) - l2sb-
find . -type f -name 'l2sb-*' | xargs -I {} -P $(nproc) bash -c 'K=$(echo {} | awk -F- "{print \$2}"); quaesitor/ann/scientificNames-edffnn.js -e quaesitor/src/assets/bedffnn.json -i {} > l2s+b-$K'
sort -k1 -t',' -n l2s+b-* > belpw+b.csv
xz -9 -k belpw+b.csv

### level2: classifier importance via permutation
touch uedffnn
touch bedffnn
for k in {0..5}; do ### sklearn gets numbers slightly different than R (dataset effect?)
	quaesitor/ann/scientificNames-edffnn-p-auc.py -d $k -i quaesitor/src/assets/uedffnn.hdf5 -v level2u -w 5 | grep permutations >> uedffnn
	# mean AUC for 100 permutations of datum 0 = 0.943013
	# mean AUC for 100 permutations of datum 1 = 0.630776
	# mean AUC for 100 permutations of datum 2 = 0.938017
	# mean AUC for 100 permutations of datum 3 = 0.501973
	# mean AUC for 100 permutations of datum 4 = 0.936281
	# mean AUC for 100 permutations of datum 5 = 0.923634
	quaesitor/ann/scientificNames-edffnn-p-auc.py -d $k -i quaesitor/src/assets/bedffnn.hdf5 -v level2b -w 5 | grep permutations >> bedffnn
	# mean AUC for 100 permutations of datum 0 = 0.943342
	# mean AUC for 100 permutations of datum 1 = 0.694827
	# mean AUC for 100 permutations of datum 2 = 0.940979
	# mean AUC for 100 permutations of datum 3 = 0.689346
	# mean AUC for 100 permutations of datum 4 = 0.940909
	# mean AUC for 100 permutations of datum 5 = 0.935954
done

### level2: cutoffs
PRF='BEGIN{tp=0;tn=0;fp=0;fn=0;c/=100;if(h==0){print "cutoff,precision,recall,F1"}}{if($1==0){if($x<c){tn++}else{fp++}}else{if($x<c){fn++}else{tp++}}}END{if(tp==0){printf "%.3f,%.3f,%.3f,%.3f\n",c,0,0,0}else{p=tp/(tp+fp);r=tp/(tp+fn);f=2*((p*r)/(p+r));printf "%.3f,%.3f,%.3f,%.3f\n",c,p,r,f}}'
for k in {0..100}; do
	awk -F, -v c=$k -v h=$k -v x=8 "$PRF" belpw+u.csv >> uedffnn-prf.csv
	awk -F, -v c=$k -v h=$k -v x=8 "$PRF" belpw+b.csv >> bedffnn-prf.csv
done
UEDFFNN=$(tail -n +2 uedffnn-prf.csv | sort -k4,4 -t',' -n | tail -1 | awk -F, '{print $1}') ### 0.980
BEDFFNN=$(tail -n +2 bedffnn-prf.csv | sort -k4,4 -t',' -n | tail -1 | awk -F, '{print $1}') ### 0.990

### level2: distribution of false negatives
grep -h '^1' belpw+u.csv | awk -F, -v c=$UEDFFNN '{if($8<c){print $0}}' > fn.csv
awk -F, '{print $2}' fn.csv | grep -o '.$' | sort | uniq -c | sort -n ### the most useful
awk -F, '{print $2}' fn.csv | grep -o '..$' | sort | uniq -c | sort -n
awk -F, '{print $2}' fn.csv | grep -o '...$' | sort | uniq -c | sort -n
awk -F, '{print $2}' fn.csv | grep -o '^.' | sort | uniq -c | sort -n
awk -F, '{print $2}' fn.csv | grep -o '^..' | sort | uniq -c | sort -n
awk -F, '{print $2}' fn.csv | grep -o '^...' | sort | uniq -c | sort -n
### percent '-i' eponyms
echo '(' $(grep -c -E '^1,[a-z]+i,' belpw+u.csv) '/' $(grep -c -E '^1,' belpw+u.csv) ')*100' | bc -l ### 10.26
echo '(' $(grep -c -E '^1,[a-z]+i,' fn.csv) '/' $(grep -c -E '^1,' fn.csv) ')*100' | bc -l ### 13.88

### level2: distribution of false positives
grep -h '^0' l2s+u-* | awk -F, -v c=$UEDFFNN '{if($8>=c){print $0}}' > fp.csv
awk -F, '{print $2}' fp.csv | grep -o '.$' | sort | uniq -c | sort -n
awk -F, '{print $2}' fp.csv | grep -o '..$' | sort | uniq -c | sort -n ### the most useful
awk -F, '{print $2}' fp.csv | grep -o '...$' | sort | uniq -c | sort -n
awk -F, '{print $2}' fp.csv | grep -o '^.' | sort | uniq -c | sort -n
awk -F, '{print $2}' fp.csv | grep -o '^..' | sort | uniq -c | sort -n
awk -F, '{print $2}' fp.csv | grep -o '^...' | sort | uniq -c | sort -n
### percent '-us' words
echo '(' $(grep -c -E '^1,[a-z]+us,' belpw+u.csv) '/' $(grep -c -E '^1,' belpw+u.csv) ')*100' | bc -l ### 14.54
echo '(' $(grep -c -E '^0,[a-z]+us,' belpw+u.csv) '/' $(grep -c -E '^0,' belpw+u.csv) ')*100' | bc -l ### 0.39
echo '(' $(grep -c -E '^0,[a-z]+us,' fp.csv) '/' $(grep -c -E '^0,' fp.csv) ')*100' | bc -l ### 11.34

### kluge for common points of failure
quaesitor/util/txt2bloomfilter.js -i kluge.txt -p 0.000001 ### kluge.json added to code

### BENCHMARKING
### A100 creation
mkdir chi
quaesitor/ann/scientificNames-A100.pl -i orginal-names.txt -o chi -a ' 因为它可能写在生物多样性文献中。' -f '这句话包含现代林奈构造的真实拉丁文科学名称 '
mkdir cze
quaesitor/ann/scientificNames-A100.pl -i orginal-names.txt -o cze -a ' v moderní linneanské konfiguraci, jak by se mohlo psát v literatuře o biologické rozmanitosti.' -f 'Tato věta obsahuje bona fide latinské vědecké jméno '
mkdir dan
quaesitor/ann/scientificNames-A100.pl -i orginal-names.txt -o dan -a ' i den moderne linjaiske konfiguration, som det måske er skrevet i biodiversitetslitteraturen.' -f 'Denne sætning indeholder et bona fide, latinsk videnskabeligt navn '
mkdir dut
quaesitor/ann/scientificNames-A100.pl -i orginal-names.txt -o dut -a ' in de moderne Linnaean-configuratie, zoals het misschien in de literatuur over biodiversiteit is geschreven.' -f 'Deze zin bevat een bonafide Latijnse wetenschappelijke naam '
mkdir eng
quaesitor/ann/scientificNames-A100.pl -i orginal-names.txt -o eng -a ' in the modern Linnaean configuration, as it might be written in the biodiversity literature.' -f 'This sentence contains a bona fide Latin scientific name '
mkdir fre
quaesitor/ann/scientificNames-A100.pl -i orginal-names.txt -o fre -a ', dans la configuration linnéenne moderne, comme il pourrait être écrit dans la littérature sur la biodiversité.' -f 'Cette phrase contient un nom scientifique latin de bonne foi, '
mkdir ger
quaesitor/ann/scientificNames-A100.pl -i orginal-names.txt -o ger -a ' in der modernen linnäischen Konfiguration, wie er in der Literatur zur biologischen Vielfalt geschrieben sein könnte.' -f 'Dieser Satz enthält einen echten lateinischen wissenschaftlichen Namen '
mkdir ita
quaesitor/ann/scientificNames-A100.pl -i orginal-names.txt -o ita -a ' nella moderna configurazione linnaeana, come potrebbe essere scritto nella letteratura sulla biodiversità.' -f 'Questa frase contiene un nome scientifico latino autentico '
mkdir jpn
quaesitor/ann/scientificNames-A100.pl -i orginal-names.txt -o jpn -a ' が含まれています。' -f 'この文には、生物多様性の文献に書かれているように、現代のリンネの構成における真正なラテン学名 '
mkdir lat
quaesitor/ann/scientificNames-A100.pl -i orginal-names.txt -o lat -a ' in modern scientific configuratione Linnaeus, ut sit sicut scriptum est in biodiversity litterae.' -f 'His principiis iuris naturalis latine habet nomen '
mkdir nor
quaesitor/ann/scientificNames-A100.pl -i orginal-names.txt -o nor -a ' i den moderne Linnean-konfigurasjonen, som det kan være skrevet i biologisk mangfoldslitteratur.' -f 'Denne setningen inneholder et bona fide latin vitenskapelig navn '
mkdir pol
quaesitor/ann/scientificNames-A100.pl -i orginal-names.txt -o pol -a ' we współczesnej konfiguracji linnejskiej, jak można ją zapisać w literaturze poświęconej różnorodności biologicznej.' -f 'To zdanie zawiera prawdziwą łacińską naukową nazwę '
mkdir por
quaesitor/ann/scientificNames-A100.pl -i orginal-names.txt -o por -a ', na moderna configuração lineana, como pode ser escrito na literatura sobre biodiversidade.' -f 'Esta frase contém um nome científico latino-americano de boa-fé, '
mkdir rus
quaesitor/ann/scientificNames-A100.pl -i orginal-names.txt -o rus -a ' в современной линнеевской конфигурации, как это может быть написано в литературе по биоразнообразию.' -f 'Это предложение содержит истинное латинское научное название '
mkdir spa
quaesitor/ann/scientificNames-A100.pl -i orginal-names.txt -o spa -a ' en la configuración moderna de Linneo, como podría estar escrito en la literatura sobre biodiversidad.' -f 'Esta oración contiene un nombre científico latino genuino '
mkdir swe
quaesitor/ann/scientificNames-A100.pl -i orginal-names.txt -o swe -a ' i den moderna Linnékonfigurationen, som det kan skrivas i biodiversitetslitteraturen.' -f 'Denna mening innehåller ett bona fide latinska vetenskapliga namn '
### S800 downloaded from https://species.jensenlab.org/ (an update of https://sourceforge.net/projects/linnaeus/files/Corpora/manual-corpus-species-1.0.tar.gz/download) and then mannually corrected to include only Latin names and fix many errors
### COPIOUS downloaded from https://arpha.pensoft.net/getfile.php?filename=oo_254879.zip and then mannually corrected to include only Latin names and fix many (copious?) errors

### A100 benchmark
lan=( chi cze dan dut eng fre ger ita jpn lat nor pol por rus spa swe )
pro=( L N Q S T )
for p in "${pro[@]}"; do
	mkdir -p 'A100'$p
	cd 'A100'$p
	for l in "${lan[@]}"; do
		mkdir -p $l
	done
	cd ../
done
find A100/ -type f -name '*.txt' | xargs -I {} -P 1 bash -c 'L=$(echo {} | awk -F/ "{print \$2}"); N=$(echo {} | awk -F/ "{print \$3}" | sed "s/artificial//" | sed "s/.txt//"); linnaeus.sh {} A100L/$L/$N.json' 1> L.out 2> L.err &
sleep 33
find A100/ -type f -name '*.txt' | xargs -I {} -P 1 bash -c 'L=$(echo {} | awk -F/ "{print \$2}"); N=$(echo {} | awk -F/ "{print \$3}" | sed "s/artificial//" | sed "s/.txt//"); netineti.sh {} A100N/$L/$N.json' 1> N.out 2> N.err &
sleep 33
find A100/ -type f -name '*.txt' | xargs -I {} -P 1 bash -c 'L=$(echo {} | awk -F/ "{print \$2}"); N=$(echo {} | awk -F/ "{print \$3}" | sed "s/artificial//" | sed "s/.txt//"); cat {} | quaesitor-cli | quaesitor2json.js > A100Q/$L/$N.json' 1> Q.out 2> Q.err &
sleep 33
find A100/ -type f -name '*.txt' | xargs -I {} -P 1 bash -c 'L=$(echo {} | awk -F/ "{print \$2}"); N=$(echo {} | awk -F/ "{print \$3}" | sed "s/artificial//" | sed "s/.txt//"); species.sh {} A100S/$L/$N.json' 1> S.out 2> S.err &
sleep 33
find A100/ -type f -name '*.txt' | xargs -I {} -P 1 bash -c 'L=$(echo {} | awk -F/ "{print \$2}"); N=$(echo {} | awk -F/ "{print \$3}" | sed "s/artificial//" | sed "s/.txt//"); taxonfinder.sh {} A100T/$L/$N.json' 1> T.out 2> T.err &
wait
for l in "${lan[@]}"; do
	find A100/$l -type f -name '*.txt' | xargs -I {} -P 1 bash -c 'echo $(echo {} | awk -F/ "{print \$3}") $(cat {} | tr " " "\\n" | wc -l)' | tr ' ' '\t' > A100/$l-words.tsv
done
sed -i 's/\.txt//' A100/*.tsv
echo 'program,dataset,language,file,TP,FP,TN,FN' > A100.csv
for p in "${pro[@]}"; do
	for l in "${lan[@]}"; do
		performance.js -h -a A100/A100-LN.tsv -d A100$p/$l -l $l -n A100/$l-words.tsv -s artificial -p $p | grep -v 'program,dataset,language,file,TP,FP,TN,FN' >> A100.csv
	done
done

### S800 benchmark
for p in "${pro[@]}"; do
	mkdir -p 'S800'$p/abstracts
done
find S800/ -type f -name '*.txt' | xargs -I {} -P 1 bash -c 'L=$(echo {} | awk -F/ "{print \$2}"); N=$(echo {} | awk -F/ "{print \$3}" | sed "s/species//" | sed "s/.txt//"); linnaeus.sh {} S800L/$L/$N.json' 1> L.out 2> L.err &
sleep 33
find S800/ -type f -name '*.txt' | xargs -I {} -P 1 bash -c 'L=$(echo {} | awk -F/ "{print \$2}"); N=$(echo {} | awk -F/ "{print \$3}" | sed "s/species//" | sed "s/.txt//"); netineti.sh {} S800N/$L/$N.json' 1> N.out 2> N.err &
sleep 33
find S800/ -type f -name '*.txt' | xargs -I {} -P 1 bash -c 'L=$(echo {} | awk -F/ "{print \$2}"); N=$(echo {} | awk -F/ "{print \$3}" | sed "s/species//" | sed "s/.txt//"); cat {} | quaesitor-cli | quaesitor2json.js > S800Q/$L/$N.json' 1> Q.out 2> Q.err &
sleep 33
find S800/ -type f -name '*.txt' | xargs -I {} -P 1 bash -c 'L=$(echo {} | awk -F/ "{print \$2}"); N=$(echo {} | awk -F/ "{print \$3}" | sed "s/species//" | sed "s/.txt//"); species.sh {} S800S/$L/$N.json' 1> S.out 2> S.err &
sleep 33
find S800/ -type f -name '*.txt' | xargs -I {} -P 1 bash -c 'L=$(echo {} | awk -F/ "{print \$2}"); N=$(echo {} | awk -F/ "{print \$3}" | sed "s/species//" | sed "s/.txt//"); taxonfinder.sh {} S800T/$L/$N.json' 1> T.out 2> T.err &
wait
find S800/ -type f -name '*.txt' | xargs -I {} -P 1 bash -c 'echo $(echo {} | awk -F/ "{print \$3}") $(cat {} | tr " " "\\n" | wc -l)' | tr ' ' '\t' | sed 's/\.txt//' > S800/words.tsv
echo 'program,dataset,language,file,TP,FP,TN,FN' > S800.csv
for p in "${pro[@]}"; do
	performance.js -h -a S800/S800-LN.tsv -d S800$p/abstracts -l eng -n S800/words.tsv -s species -p $p | grep -v 'program,dataset,language,file,TP,FP,TN,FN' >> S800.csv
done

### COPIOUS benchmark
for p in "${pro[@]}"; do
	mkdir -p 'COPIOUS'$p/text
done
find COPIOUS/ -type f -name '*.txt' | xargs -I {} -P 1 bash -c 'L=$(echo {} | awk -F/ "{print \$2}"); N=$(echo {} | awk -F/ "{print \$3}" | sed "s/copious//" | sed "s/.txt//"); linnaeus.sh {} COPIOUSL/$L/$N.json' 1> L.out 2> L.err &
sleep 33
find COPIOUS/ -type f -name '*.txt' | xargs -I {} -P 1 bash -c 'L=$(echo {} | awk -F/ "{print \$2}"); N=$(echo {} | awk -F/ "{print \$3}" | sed "s/copious//" | sed "s/.txt//"); netineti.sh {} COPIOUSN/$L/$N.json' 1> N.out 2> N.err &
sleep 33
find COPIOUS/ -type f -name '*.txt' | xargs -I {} -P 1 bash -c 'L=$(echo {} | awk -F/ "{print \$2}"); N=$(echo {} | awk -F/ "{print \$3}" | sed "s/copious//" | sed "s/.txt//"); cat {} | quaesitor-cli | quaesitor2json.js > COPIOUSQ/$L/$N.json' 1> Q.out 2> Q.err &
sleep 33
find COPIOUS/ -type f -name '*.txt' | xargs -I {} -P 1 bash -c 'L=$(echo {} | awk -F/ "{print \$2}"); N=$(echo {} | awk -F/ "{print \$3}" | sed "s/copious//" | sed "s/.txt//"); species.sh {} COPIOUSS/$L/$N.json' 1> S.out 2> S.err &
sleep 33
find COPIOUS/ -type f -name '*.txt' | xargs -I {} -P 1 bash -c 'L=$(echo {} | awk -F/ "{print \$2}"); N=$(echo {} | awk -F/ "{print \$3}" | sed "s/copious//" | sed "s/.txt//"); taxonfinder.sh {} COPIOUST/$L/$N.json' 1> T.out 2> T.err &
wait
find COPIOUS/ -type f -name '*.txt' | xargs -I {} -P 1 bash -c 'echo $(echo {} | awk -F/ "{print \$3}") $(cat {} | tr " " "\\n" | wc -l)' | tr ' ' '\t' | sed 's/\.txt//' > COPIOUS/words.tsv
echo 'program,dataset,language,file,TP,FP,TN,FN' > COPIOUS.csv
for p in "${pro[@]}"; do
	performance.js -h -a COPIOUS/COPIOUS-LN.tsv -d COPIOUS$p/text -l eng -n COPIOUS/words.tsv -s copious -p $p | grep -v 'program,dataset,language,file,TP,FP,TN,FN' >> COPIOUS.csv
done

### level2: figures and stats
R CMD BATCH scientificNames.r
