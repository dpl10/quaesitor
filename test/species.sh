#!/bin/bash
if [ -z "$1" ] || [ -z "$2" ]; then
	echo 'A wrapper script for species (species_global.tsv and species_names.tsv'
	echo 'must be in the current directory; species and species2json.js are required).'
	echo 'usage: species.sh infile.txt outfile.json'
else
	echo -n "starting $1..."
	DIR='temporary-do-not-touch'
	rm -R -f $DIR
	mkdir $DIR
	ln -r -s -t $DIR $1
	species $DIR | species2json.js 1> $2 2> /dev/null
	rm -R -f $DIR
	echo ' ...done'
fi
