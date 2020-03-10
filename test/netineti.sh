#!/bin/bash
if [ -z "$1" ] || [ -z "$2" ]; then
	echo 'A wrapper script for NetiNeti docker web service (docker gnames/netineti'
	echo 'and netineti2json.js are required).'
	echo 'usage: netineti.sh infile.txt outfile.json'
else
	if [ $(docker ps | grep -c 'gnames/netineti') -eq '0' ]; then
		echo -n 'starting netineti server... '
		docker run -d -p 0.0.0.0:6384:6384 --name netineti gnames/netineti
		sleep 120
	else
		echo -n "netineti server running... starting $1..."
		curl -d "from_web_form=true&data=$(cat $1 | xxd -plain | tr -d '\n' | sed 's/\(..\)/%\1/g')" -s -X POST http://localhost:6384/ | netineti2json.js 1> $2 2> /dev/null
		echo ' ...done'
	fi
fi
### docker stop $(docker ps -a -q)
### docker rm $(docker ps -a -q)
### time $(docker run -d -p 0.0.0.0:6384:6384 --name netineti gnames/netineti && until curl -d "from_web_form=true&data=$(cat A100/eng/artificial01.txt | xxd -plain | tr -d '\n' | sed 's/\(..\)/%\1/g')" -s -X POST http://localhost:6384/; do sleep 0.1; done)
# real	0m23.408s
# user	0m2.133s
# sys	0m1.303s
