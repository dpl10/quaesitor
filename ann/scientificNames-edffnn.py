#!/usr/bin/env python3

### IMPORTS
from keras import models
from keras import utils
from keras.layers import Activation
from keras.layers import BatchNormalization
from keras.layers import Dense
from keras.layers import Dropout
from keras.losses import sparse_categorical_crossentropy
from keras.optimizers import Adam
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
settings['activation'] = 'relu'
settings['batch'] = 1024
settings['classes'] = 2
settings['cores'] = multiprocessing.cpu_count()
settings['dropout'] = 0.025
settings['epochSteps'] = 16
settings['initializer'] = 'random_uniform'
settings['inputDirectory'] = ''
settings['layers'] = 6
settings['maxSize'] = 64
settings['outputDirectory'] = ''
settings['unseen'] = 24
settings['validationDirectory'] = ''
settings['width'] = 0

### READ OPTIONS
inputDirectoryError = 'input directory of csv files required (' + str(settings['batch']) + ' records per file; must have at least ' + str(settings['epochSteps']) + ' files; class,data,...): -i directory | --input=directory'
outputDirectoryError = 'output directory required: -o directory | --output=directory'
validationDirectoryError = 'validation directory of csv files required (' + str(settings['batch']) + ' records per file; must have at least ' + str(settings['epochSteps']) + ' files; class,data,...): -v directory | --validation=directory'
widthError = 'width requried: -w int | --width=int'
try:
	arguments, values = getopt.getopt(sys.argv[1:], 'c:d:hi:l:m:o:u:v:w:', ['cores=', 'dropout=', 'help', 'input=', 'layers=', 'max=', 'output=', 'unseen=', 'validation=', 'width='])
except getopt.error as err:
	eprint(str(err))
	sys.exit(2)
for argument, value in arguments:
	if argument in ('-c', '--cores'):
		if int(value) > 0:
			settings['cores'] = int(value)
	elif argument in ('-d', '--dropout'):
		if float(value) > 0 and float(value) < 1:
			settings['dropout'] = float(value)
	elif argument in ('-h', '--help'):
		eprint('A Python3 script to train a neural network using TensorFlow v1.13.')
		eprint('cores optional: -c int | --cores=int (default = %i)' % (settings['cores']))
		eprint('dropout optional: -d int | --dropout=int (default = %.2f)' % (settings['dropout']))
		eprint(inputDirectoryError)
		eprint('layers optional: -c int | --layers=int (default = %i)' % (settings['layers']))
		eprint('maximum model size: -m kbytes | --max=kbytes (default = %i)' % (settings['maxSize']))
		eprint(outputDirectoryError)
		eprint('unseen optional: -u int | -unseen=int (default = %i)' % (settings['unseen']))
		eprint(validationDirectoryError)
		eprint(widthError)
		sys.exit(0)
	elif argument in ('-i', '--input'):
		if os.path.isdir(value):
			settings['inputDirectory'] = value
		else:
			eprint('input directory does not exist (%s)' % (value))
			sys.exit(2)
	elif argument in ('-l', '--layers'):
		if int(value) > 0:
			settings['layers'] = int(value)
	elif argument in ('-m', '--max'):
		if int(value) > 0:
			settings['maxSize'] = int(value)
	elif argument in ('-o', '--output'):
		if os.path.isdir(value):
			settings['outputDirectory'] = value
		else:
			eprint('output directory does not exist (%s)' % (value))
			sys.exit(2)
	elif argument in ('-u', '--unseen'):
		if int(value) > 0:
			settings['unseen'] = int(value)
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
if not settings['inputDirectory']:
	eprint(inputDirectoryError)
	sys.exit(2)
elif not settings['outputDirectory']:
	eprint(outputDirectoryError)
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
	eprint('dropout = %.2f' % (settings['dropout']))
	eprint('input = %s' % (settings['inputDirectory']))
	eprint('layers = %i' % (settings['layers']))
	eprint('max = %i' % (settings['maxSize']))
	eprint('output = %s' % (settings['outputDirectory']))
	eprint('unseen = %i' % (settings['unseen']))
	eprint('validation = %s' % (settings['validationDirectory']))
	eprint('width = %i' % (settings['width']))
settings['maxSize'] *= 1024

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
			return np.asarray(x, dtype = np.float32), np.asarray(y, dtype = np.int64)
	def __init__(self, files, classes, epochSteps, width):
		self.classes = classes
		self.epochSteps = epochSteps
		self.files = files
		self.width = width
	def __len__(self):
		return self.epochSteps
	def on_epoch_end(self): ### useful when there is not enough data for a full run
		random.shuffle(self.files)

### KERAS DATA GENERATORS
inputFiles = []
for f in os.listdir(settings['inputDirectory']):
	f = os.path.join(settings['inputDirectory'], f)
	if os.path.isfile(f) == True:
		if os.path.splitext(f)[-1].lower() == '.csv':
			inputFiles.append(f)
		else:
			eprint('skipped file %s' % f)
random.seed(os.urandom(64))
random.shuffle(inputFiles)
split = int(len(inputFiles)*(1-(1/settings['epochSteps'])))
trainingGenerator = DataGenerator(inputFiles[0:split], settings['classes'], settings['epochSteps'], settings['width'])
testingGenerator = DataGenerator(inputFiles[(split+1):], settings['classes'], settings['epochSteps'], settings['width'])

validationFiles = []
for f in os.listdir(settings['validationDirectory']):
	f = os.path.join(settings['validationDirectory'], f)
	if os.path.isfile(f) == True:
		if os.path.splitext(f)[-1].lower() == '.csv':
			validationFiles.append(f)
		else:
			eprint('skipped file %s' % f)
validationFiles.sort()
validationGenerator = DataGenerator(validationFiles, settings['classes'], settings['epochSteps'], settings['width'])

### DEEP FEED FORWARD NEURAL NETWORK STRUCTURE
kerasDFFNN = models.Sequential()
kerasDFFNN.add(Dense(
	settings['width'],
	input_shape = (settings['width'], ),
	kernel_initializer = settings['initializer'],
	use_bias = False,
	name = 'inputLayer'
))
kerasDFFNN.add(BatchNormalization()) ### the problem in tfjs....
kerasDFFNN.add(Activation(settings['activation']))
for k in range(settings['layers']):
	kerasDFFNN.add(Dense(
		int(settings['unseen']*(1/(k+1))),
		kernel_initializer = settings['initializer'],
		use_bias = False,
		name = 'middleLayer' + str(k)
	))
	kerasDFFNN.add(BatchNormalization()) ### the problem in tfjs....
	kerasDFFNN.add(Activation(settings['activation']))
kerasDFFNN.add(Dropout(
	rate = settings['dropout'],
	name = 'finalDropout'
))
kerasDFFNN.add(Dense(
	settings['classes'],
	activation = 'softmax',
	name = 'output'
))
kerasDFFNN.compile(
	optimizer = Adam(lr = 0.001),
	loss = sparse_categorical_crossentropy,
	metrics = ['sparse_categorical_accuracy']
)

### SIZE TEST
m = os.path.join(settings['outputDirectory'], 'model.hdf5')
kerasDFFNN.save(m)
if os.path.getsize(m) > settings['maxSize']:
	eprint('model is too large, aborting')
	sys.exit(0)

### TRAIN DEEP FEED FORWARD NEURAL NETWORK
kerasDFFNN.fit_generator(
	callbacks = [
		tf.keras.callbacks.ModelCheckpoint(os.path.join(settings['outputDirectory'], 'training-e{epoch:04d}-l{loss:.4f}-a{sparse_categorical_accuracy:.4f}.hdf5'), verbose = 1)
	],
	class_weight = {0: 0.0625, 1: 1.0},
	epochs = 512,
	generator = trainingGenerator,
	steps_per_epoch = settings['epochSteps'],
	use_multiprocessing = True,
	validation_data = testingGenerator,
	validation_steps = 1,
	verbose = 1,
	workers = settings['cores']
)
kerasDFFNN.save(os.path.join(settings['outputDirectory'], 'final.hdf5'))

### AREA UNDER THE PRECISION/RECALL CURVE
x = kerasDFFNN.predict_generator(
	validationGenerator,
	steps = settings['epochSteps'],
	use_multiprocessing = True,
	verbose = 1,
	workers = settings['cores']
)
y = []
for k in range(0, settings['epochSteps']): ### inefficient (reads files a second time), but works
	with open(validationFiles[k]) as reader:
		for line in reader:
			d = list(map(float, line.rstrip().split(',')))
			if len(d) == settings['width']+1:
				y.append(int(d[0]))
p, r, t = precision_recall_curve(y, x[:, 1])
a = auc(r, p)
stats = open(os.path.join(settings['outputDirectory'], 'stats.csv'), 'w')
stats.write('threshold,precision,recall,F1,AUC\n')
for k in range(0, len(t)):
	stats.write(str(t[k]) + ',' + str(p[k]) + ',' + str(r[k]) + ',' + str(2*((p[k]*r[k])/(p[k]+r[k]))) + ',' + str(a) + '\n')
stats.close()
