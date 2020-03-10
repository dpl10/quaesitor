#!/usr/bin/env python3

### IMPORTS
from keras import models
from keras import utils
from keras.layers import Dense
from keras.layers import Dropout
import getopt
import multiprocessing
import numpy as np
import os
import random
from sklearn.metrics import precision_recall_curve
from sklearn.metrics import auc
import sys
import tensorflow as tf

### SET OPTIONS
def eprint(*args, **kwargs):
	print(*args, file = sys.stderr, **kwargs)
os.environ['CUDA_VISIBLE_DEVICES'] = '' ### ignore GPUs
settings = {}
settings['batch'] = 512
settings['classes'] = 2
settings['cores'] = multiprocessing.cpu_count()
settings['datum'] = 0
settings['epochSteps'] = 16
settings['inputModel'] = ''
settings['permutations'] = 100
settings['validationDirectory'] = ''
settings['width'] = 0

### READ OPTIONS
inputModelError = 'input .hdf5 model required: -i file.hdf5 | --input=file.hdf5'
validationDirectoryError = 'validation directory of csv files required (' + str(settings['batch']) + ' records per file; must have at least ' + str(settings['epochSteps']) + ' files; class,data,...): -v directory | --validation=directory'
widthError = 'width requried: -w int | --width=int'
try:
	arguments, values = getopt.getopt(sys.argv[1:], 'c:d:hi:p:v:w:', ['cores=', 'datum=', 'help', 'input=', 'permutations=', 'validation=', 'width='])
except getopt.error as err:
	eprint(str(err))
	sys.exit(2)
for argument, value in arguments:
	if argument in ('-c', '--cores'):
		if int(value) > 0:
			settings['cores'] = int(value)
	if argument in ('-d', '--datum'):
		if int(value) > 0:
			settings['datum'] = int(value)
	elif argument in ('-h', '--help'):
		eprint('A Python3 script to estimate variable importance of a neural network using Keras with TensorFlow v1.13.')
		eprint('cores optional: -c int | --cores=int (default = %i)' % (settings['cores']))
		eprint(inputModelError)
		eprint(validationDirectoryError)
		eprint(widthError)
		sys.exit(0)
	elif argument in ('-i', '--input'):
		if os.path.isfile(value):
			settings['inputModel'] = value
		else:
			eprint('input file does not exist (%s)' % (value))
			sys.exit(2)
	elif argument in ('-p', '--permutations'):
		if int(value) > 0:
			settings['permutations'] = int(value)
	elif argument in ('-v', '--validation'):
		if os.path.isdir(value):
			settings['validationDirectory'] = value
		else:
			eprint('validation directory does not exist (%s)' % (value))
			sys.exit(2)
	elif argument in ('-w', '--width'):
		if int(value) > 0:
			settings['width'] = int(value)

### START/END
if not settings['inputModel']:
	eprint(inputModelError)
	sys.exit(2)
elif not settings['validationDirectory']:
	eprint(validationDirectoryError)
	sys.exit(2)
elif settings['width'] == 0:
	eprint(widthError)
	sys,exit(2)
else:
	eprint('started')
	eprint('cores = %i' %(settings['cores']))
	eprint('datum = %i' %(settings['datum']))
	eprint('input = %s' % (settings['inputModel']))
	eprint('permutations = %i' %(settings['permutations']))
	eprint('validation = %s' % (settings['validationDirectory']))
	eprint('width = %i' % (settings['width']))

### DATA GENERATOR
class DataGenerator(utils.Sequence):
	def __getitem__(self, i): ### generate a batch of data
		x = []
		y = []
		with open(self.files[i]) as reader:
			for line in reader:
				d = list(map(float, line.rstrip().split(',')))
				if len(d) == self.width+1:
					x.append(d[1:])
					y.append(int(d[0]))
				else:
					eprint('Width error! file = %s; width = %i; line width = %i' % (self.files[i], self.width, (len(d)-1)))
			x = np.asarray(x, dtype = np.float32)
			if self.datum > 0:
				x[:,self.datum] = np.random.permutation(x[:,self.datum])
			return x, np.asarray(y, dtype = np.int64)
	def __init__(self, files, classes, datum, epochSteps, width):
		self.classes = classes
		self.datum = datum-1
		self.epochSteps = epochSteps
		self.files = files
		self.width = width
	def __len__(self):
		return self.epochSteps
	def on_epoch_end(self): ### useful when there is not enough data for a full run
		random.shuffle(self.files)

### KERAS DATA GENERATOR
validationFiles = []
for f in os.listdir(settings['validationDirectory']):
	f = os.path.join(settings['validationDirectory'], f)
	if os.path.isfile(f) == True:
		if os.path.splitext(f)[-1].lower() == '.csv':
			validationFiles.append(f)
		else:
			eprint('skipped file %s' % f)
validationFiles.sort()
validationGenerator = DataGenerator(validationFiles, settings['classes'], settings['datum'], settings['batch'], settings['width'])

### READ MODEL
kerasDFFNN = models.load_model(settings['inputModel'])

### AREA UNDER THE PRECISION/RECALL CURVE
c = 0
m = 0
for k in range(1, settings['permutations']):
	x = kerasDFFNN.predict_generator(
		validationGenerator,
		steps = settings['batch'],
		use_multiprocessing = True,
		verbose = 1,
		workers = settings['cores']
	)
	y = []
	for k in range(0, settings['batch']): ### inefficient (reads files a second time), but works
		with open(validationFiles[k]) as reader:
			for line in reader:
				d = list(map(float, line.rstrip().split(',')))
				if len(d) == settings['width']+1:
					y.append(int(d[0]))
	p, r, t = precision_recall_curve(y, x[:, 1])
	c += 1
	m = m+(auc(r, p)-m)/c
print('mean AUC for %i permutations of datum %i = %f' % (settings['permutations'], settings['datum'], m))
