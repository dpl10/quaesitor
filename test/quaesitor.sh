#!/bin/bash
if [ -z "$1" ] || [ -z "$2" ]; then
	echo 'A wrapper script for QUAESITOR (quaesitor-cli, and'
	echo 'and quaesitor2json.js are required).'
	echo 'usage: quaesitor.sh infile.txt outfile.json'
else
	echo -n "starting $1..."
	quaesitor-cli -i $1 | quaesitor2json.js > $2
	echo ' ...done'
fi
