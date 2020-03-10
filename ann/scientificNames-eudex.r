library(MASS)
ip <- read.csv('scientificNames-eudex-ip.csv', header = TRUE, sep = ',', quote = '', dec = '.', check.names = FALSE)
ipDist <- dist(ip[,2:9], method = 'manhattan')
mds <- isoMDS(ipDist, cmdscale(ipDist, k = 8), k = 8, maxit = 50)
mds
np <- read.csv('scientificNames-eudex-np.csv', header = TRUE, sep = ',', quote = '', dec = '.', check.names = FALSE)
npDist <- dist(unique(np[,2:9]), method = 'manhattan')
mds <- isoMDS(npDist, cmdscale(npDist, k = 8), k = 8, maxit = 50)
mds
