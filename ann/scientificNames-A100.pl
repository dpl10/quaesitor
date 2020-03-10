#!/usr/bin/perl
############################### MODULE
use strict;
############################### INPUT
my $a = '';
my $f = '';
my $i = '';
my $o = '';
for(my $k = $#ARGV; $k >= 0; $k--){
	if($ARGV[$k] eq '-a'){
		$a = $ARGV[$k+1];
	} elsif($ARGV[$k] eq '-f'){
		$f = $ARGV[$k+1];
	} elsif($ARGV[$k] eq '-i'){
		if(-e $ARGV[$k+1]){
			$i = $ARGV[$k+1];
		}
	} elsif($ARGV[$k] eq '-o'){
		if(-d $ARGV[$k+1]){
			$o = $ARGV[$k+1];
		}
	}
}
if(length($a) && length($f) && length($i) && length($o)){
	my $answers = '';
	my $k = 0;
	open(INFILE, $i) or die("Could not open $i!");
	chdir($o) or die("Cannot change to $o!\n");
	while(my $line = <INFILE>){
		chomp($line);
		if(length($line)){
			my $n = sprintf('%02s', $k);
			$answers .= $n . "\t" . $line . "\n";
			open(OUTFILE, ">artificial$n.txt") or die("Cannot open '$o/artificial$n.txt'!\n");
			print(OUTFILE $f . $line . $a . "\n");
			close(OUTFILE);
			$k++;
		}
	}
	close(INFILE);
	open(OUTFILE, ">annnotations.tsv") or die("Cannot open '$o/annnotations.tsv'!\n");
	print(OUTFILE $answers);
	close(OUTFILE);
} else { ############################### PRINT USAGE INFO
	print(STDERR "\nA Perl script for embedding A100 names into base sentences.\n");
	print(STDERR "USAGE: scientificNames-A100.pl -a ' aft text.' -f 'Fore text ' -i infile.txt\n-o outdir\n");
	print(STDERR "WHERE: infile has one name per line.\n\n");
}
exit(0);
