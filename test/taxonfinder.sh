#!/bin/bash
if [ -z "$1" ] || [ -z "$2" ]; then
	echo 'A wrapper script for taxonfinder (node taxonfinder and taxonfinder.js'
	echo 'are required).'
	echo 'usage: taxonfinder.sh infile.txt outfile.json'
else
	echo -n "starting $1..."
	taxonfinder.js -i $1 -o $2 1> /dev/null 2> /dev/null
	echo ' ...done'
fi
