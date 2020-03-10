#!/bin/bash
if [ -z "$1" ] || [ -z "$2" ]; then
	echo 'A wrapper script for LINNAEUS (Java, LINNAEUS, and'
	echo 'and linnaeus2json.js are required).'
	echo 'usage: linnaeus.sh infile.txt outfile.json'
else
	echo -n "starting $1..."
	FILE='temporary-do-not-touch-linnaeus-needs-this'
	java -d64 -Xmx2048m -jar $HOME/bin/linnaeus-2.0.jar --text $1 --default --threads 1 --out $FILE 1> /dev/null 2> /dev/null
	cat $FILE | linnaeus2json.js > $2
	rm -f $FILE
	echo ' ...done'
fi
