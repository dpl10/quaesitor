#!/usr/bin/perl
############################### MODULE
use strict;
############################### INPUT
my $i = '';
my $n = 64;
for(my $k = $#ARGV; $k >= 0; $k--){
	if($ARGV[$k] eq '-i'){
		if(-e $ARGV[$k+1]){
			$i = $ARGV[$k+1];
		}
	} elsif($ARGV[$k] eq '-n'){
		$n = $ARGV[$k+1];
		$n =~ tr/0123456789/0123456789/cd;
	}
}
if(length($i) && ($n >= 2)){
	my $g = (); ### group -> regexp -> expand(regexp)
	open(INFILE, $i) or die("Could not open $i!");
	while(my $line = <INFILE>){
		chomp($line);
		if(length($line)){
			my $placed = 0;
			for(my $k = $n-1; $k >= 0; $k--){
				my @r = keys(%{$g->[$k]});
				if(scalar(@r) < 31){
					my $intersection = 0;
					for(my $j = $#r; $j >= 0; $j--){
						if($g->[$k]->{$r[$j]} =~ m/$line/){
							$intersection = 1;
							last;
						}
					}
					if($intersection == 0){
						$g->[$k]->{$line} = expand($line, '');
						$placed = 1;
						last;
					}
				}
			}
			if($placed == 0){
				print(STDERR "failed to place '$line'\n");
			}
		}
	}
	close(INFILE);
	my $o = "const pseudosyllables = [\n";
	for(my $k = $n-1; $k >= 0; $k--){
		$o .= "\t[new RegExp('" . join("'), new RegExp('", sort(keys(%{$g->[$k]}))) . "')]";
		if($k == 0){
			$o .= "\n";
		} else {
			$o .= ",\n";
		}
	}
	print("$o]\n");
} else { ############################### PRINT USAGE INFO
	print(STDERR "\nA Perl script for grouping regex into non–intersecting groups.\n");
	print(STDERR "USAGE: scientificNames-pseudosyllable-group.pl -i infile.txt [ -n int ]\n");
	print(STDERR "WHERE: infile has one regex per line and n indicates the number of groups\n(default = $n).\n\n");
}
exit(0);
sub expand {
	my $r = substr($_[0], 0, 1);
	my @e = split(/\n/, $_[1]);
	if(length($r)){
		my @a =('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z');
		my $o = '';
		if(length($_[1])){
			if($r =~ m/^[a-z]$/){
				for(my $k = $#e; $k >= 0; $k--){
					$o .= $e[$k] . $r . "\n";
				}
			} elsif($r =~ m/^\.$/){
				for(my $k = $#e; $k >= 0; $k--){
					for(my $j = $#a; $j >= 0; $j--){
						$o .= $e[$k] . $a[$j] . "\n";
					}
				}
			}
		} elsif($r =~ m/^[a-z]$/){
			$o = $r . "\n";
		} elsif($r =~ m/^\.$/){
			for(my $k = $#a; $k >= 0; $k--){
				$o .= $a[$k] . "\n";
			}
		}
		return(expand(join('', substr($_[0], 1)), $o));
	} else {
		return($_[1]);
	}
}