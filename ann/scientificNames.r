### LIBRARIES
library(epiR)
library(precrec)
library(readr)
### PLOT SETTINGS
cA = 0.8
cM = 0.9
cL = 0.7
cK = 0.7
cI = 0.8
cL = 0.5
cP = 1.25
cT = 0.5
c5 <- c('#a56530', '#ce77b2', '#1d9f76', '#2175be', '#5db074') ### via https://medialab.github.io/iwanthue/ H = 0-360; C = 45-45.2; L = 0-100 [all should have the same grey value]
c6 <- c('#b94a73', '#56ae6c', '#9750a1', '#ac9c3d', '#6778d0', '#ba543d') ### via https://medialab.github.io/iwanthue/ H = 0-360; C = 40-70; L = 15-85
fX = 0.05
fY = 0.95
lX <- c(0.05, 1.0)
lY <- c(0.2, 1.0)
p = c('twodash', 'dotted', 'dashed', 'dotdash', 'solid', 'longdash')
tC = 23
tS = 0.08
tT = 512
tX = 0.50
tY = 0.2
### FUNCTIONS
makeTransparent <- function(someColor, alpha = 64){
	newColor<-col2rgb(someColor)
	apply(newColor, 2, function(curcoldata){rgb(red = curcoldata[1], green = curcoldata[2], blue = curcoldata[3], alpha = alpha, maxColorValue = 255)})
}
### DATA
belpwu <- as.data.frame(read_csv('belpw+u.csv.xz', col_names = FALSE))
belpwb <- as.data.frame(read_csv('belpw+b.csv.xz', col_names = FALSE))
a100 <- read.csv('A100.csv', header = TRUE, sep = ',', quote = '', dec = '.', check.names = FALSE)
s800 <- read.csv('S800.csv', header = TRUE, sep = ',', quote = '', dec = '.', check.names = FALSE)
copious <- read.csv('COPIOUS.csv', header = TRUE, sep = ',', quote = '', dec = '.', check.names = FALSE)
time <- read.csv('time.csv', header = TRUE, sep = ',', quote = '', dec = '.', check.names = FALSE)
#
# calculate confidence intervals? use epiR (precision === positive predictive value; recall === sensitivity)
#
s <- join_scores(belpwu[,3], belpwu[,4], belpwu[,5], belpwu[,6], belpwu[,8], belpwb[,8])
l <- join_labels(belpwu[,1], belpwu[,1], belpwu[,1], belpwu[,1], belpwu[,1], belpwb[,1])
n <- c('BF', 'ECNN', 'LCNN', 'PDFFNN', 'uEDFFNN', 'bEDFFNN')
m <- mmdata(s, l, modnames = n)
e <- evalmod(m, mode = 'prcroc', x_bins = 1000)
c <- as.data.frame(e)
### MODEL DESCRIPTIVE STATISTICS: AUC
subset(auc(e), curvetypes == 'PRC')
#    modnames dsids curvetypes      aucs
# 2        BF     1        PRC 0.4568348
# 4      ECNN     1        PRC 0.6847415
# 6      LCNN     1        PRC 0.8300387
# 8    PDFFNN     1        PRC 0.7045046
# 10  uEDFFNN     1        PRC 0.9163788
# 12  bEDFFNN     1        PRC 0.9316888
### MODEL PRECISION/RECALL (FIG 1)
pdf(file = 'fig1.pdf', width = 3.5, height = 3.5, onefile = TRUE, family = 'Helvetica', paper = 'special')
#svg(filename = 'fig1.svg', width = 3.5, height = 3.5, onefile = TRUE, family = 'Helvetica', antialias = 'subpixel')
par(mar = c(2, 3, 0.2, 0.2), col = 'black') ### c(bottom, left, top, right)
plot(1, 1, type = 'n', xlab = '', ylab = '', yaxt = 'n', xaxt = 'n', xpd = NA, xlim = c(-0.001,1.001), ylim = c(-0.001,1.001), col = 'black')
legend(0, 0.24, legend = n, col = c6, lty = p, cex = cK, y.intersp = cI, x.intersp = cI, bg = 'white', box.lwd = 0, box.lty = 0, text.col = c6)
axis(1, cex.axis = cA, las = "1", tcl = -0.2, mgp = c(1, 0.2, 0), xpd = NA, col.axis = 'black', col = 'black')
axis(2, cex.axis = cA, las = "1", tcl = -0.2, mgp = c(1.5, 0.5, 0), xpd = NA, col.axis = 'black', col = 'black')
mtext('Recall', 1, line = 1.0, cex = cM, col = 'black')
mtext('Precision', 2, line = 1.8, cex = cM, col = 'black')
lines(c[((c[,3]=='BF')&(c[,5]=='PRC')),1], c[((c[,3]=='BF')&(c[,5]=='PRC')),2], type = 'l', col = c6[1], lty = p[1])
lines(c[((c[,3]=='ECNN')&(c[,5]=='PRC')),1], c[((c[,3]=='ECNN')&(c[,5]=='PRC')),2], type = 'l', col = c6[2], lty = p[2])
lines(c[((c[,3]=='LCNN')&(c[,5]=='PRC')),1], c[((c[,3]=='LCNN')&(c[,5]=='PRC')),2], type = 'l', col = c6[3], lty = p[3])
lines(c[((c[,3]=='PDFFNN')&(c[,5]=='PRC')),1], c[((c[,3]=='PDFFNN')&(c[,5]=='PRC')),2], type = 'l', col = c6[4], lty = p[4])
lines(c[((c[,3]=='uEDFFNN')&(c[,5]=='PRC')),1], c[((c[,3]=='uEDFFNN')&(c[,5]=='PRC')),2], type = 'l', col = c6[5], lty = p[5])
lines(c[((c[,3]=='bEDFFNN')&(c[,5]=='PRC')),1], c[((c[,3]=='bEDFFNN')&(c[,5]=='PRC')),2], type = 'l', col = c6[6], lty = p[6])
dev.off()
### TEST DATA SETS (FIG 2)
p <- c('L', 'N', 'Q', 'S', 'T')
### A100
A100 <- matrix(data = NA, nrow = length(p), ncol = 8, byrow = FALSE, dimnames = NULL)
for(k in 1:length(p)){
	x <- epi.tests(as.table(matrix(c(sum(a100[(a100[,'program']==p[k]),'TP']),sum(a100[(a100[,'program']==p[k]),'FP']),sum(a100[(a100[,'program']==p[k]),'FN']),sum(a100[(a100[,'program']==p[k]),'TN'])), nrow = 2, byrow = TRUE)), conf.level = 0.99)
	A100[k,1] <- x$elements$ppv
	A100[k,2] <- x$elements$ppv.low
	A100[k,3] <- x$elements$ppv.up
	A100[k,4] <- x$elements$se
	A100[k,5] <- x$elements$se.low
	A100[k,6] <- x$elements$se.up
	A100[k,7] <- time[((time[,'program']==p[k])&(time[,'dataset']=='A100')),5]
	A100[k,8] <- (x$elements$ppv*x$elements$se)/(x$elements$ppv+x$elements$se)
}
# A100
#           [,1]      [,2]      [,3]      [,4]      [,5]      [,6] [,7]      [,8]
# [1,] 0.7000000 0.6465389 0.7497136 0.1333333 0.1174319 0.1505274 1481 0.1120000
# [2,] 0.3306122 0.3097969 0.3519356 0.3694413 0.3468030 0.3925173  352 0.1744750
# [3,] 0.6888240 0.6635479 0.7132868 0.5613095 0.5371934 0.5852111 1347 0.3092817
# [4,] 0.3988036 0.3683371 0.4298658 0.2380952 0.2179027 0.2592068 9189 0.1490868
# [5,] 0.6757844 0.6489678 0.7017667 0.5000000 0.4758110 0.5241890 3910 0.2873760
### S800
S800 <- matrix(data = NA, nrow = length(p), ncol = 8, byrow = FALSE, dimnames = NULL)
for(k in 1:length(p)){
	x <- epi.tests(as.table(matrix(c(sum(s800[(s800[,'program']==p[k]),'TP']),sum(s800[(s800[,'program']==p[k]),'FP']),sum(s800[(s800[,'program']==p[k]),'FN']),sum(s800[(s800[,'program']==p[k]),'TN'])), nrow = 2, byrow = TRUE)), conf.level = 0.99)
	S800[k,1] <- x$elements$ppv
	S800[k,2] <- x$elements$ppv.low
	S800[k,3] <- x$elements$ppv.up
	S800[k,4] <- x$elements$se
	S800[k,5] <- x$elements$se.low
	S800[k,6] <- x$elements$se.up
	S800[k,7] <- time[((time[,'program']==p[k])&(time[,'dataset']=='S800')),5]
	S800[k,8] <- (x$elements$ppv*x$elements$se)/(x$elements$ppv+x$elements$se)
}
# S800
#           [,1]      [,2]      [,3]      [,4]      [,5]      [,6] [,7]      [,8]
# [1,] 0.9258010 0.9016691 0.9455723 0.6512456 0.6179960 0.6834332  924 0.3823120
# [2,] 0.8674556 0.8427166 0.8895967 0.8874092 0.8638513 0.9081576  159 0.4386595
# [3,] 0.5846295 0.5547623 0.6140398 0.7726723 0.7425591 0.8008274  992 0.3328125
# [4,] 0.4951456 0.4690255 0.5212856 0.8969849 0.8737481 0.9172284 4456 0.3190349
# [5,] 0.9189526 0.8978625 0.9368948 0.8742586 0.8499689 0.8958940 1961 0.4480243
### COPIOUS
COPIOUS <- matrix(data = NA, nrow = length(p), ncol = 8, byrow = FALSE, dimnames = NULL)
for(k in 1:length(p)){
	x <- epi.tests(as.table(matrix(c(sum(copious[(copious[,'program']==p[k]),'TP']),sum(copious[(copious[,'program']==p[k]),'FP']),sum(copious[(copious[,'program']==p[k]),'FN']),sum(copious[(copious[,'program']==p[k]),'TN'])), nrow = 2, byrow = TRUE)), conf.level = 0.99)
	COPIOUS[k,1] <- x$elements$ppv
	COPIOUS[k,2] <- x$elements$ppv.low
	COPIOUS[k,3] <- x$elements$ppv.up
	COPIOUS[k,4] <- x$elements$se
	COPIOUS[k,5] <- x$elements$se.low
	COPIOUS[k,6] <- x$elements$se.up
	COPIOUS[k,7] <- time[((time[,'program']==p[k])&(time[,'dataset']=='COPIOUS')),5]
	COPIOUS[k,8] <- (x$elements$ppv*x$elements$se)/(x$elements$ppv+x$elements$se)
}
# COPIOUS
#           [,1]      [,2]      [,3]       [,4]      [,5]       [,6]  [,7]       [,8]
# [1,] 0.8609626 0.8029502 0.9071234 0.04090447 0.0349327 0.04756934   745 0.03904924
# [2,] 0.8209274 0.8073651 0.8339145 0.68368902 0.6689016 0.69820332 15755 0.37302467
# [3,] 0.6941280 0.6805293 0.7074778 0.80487805 0.7921461 0.81715576  1611 0.37270588
# [4,] 0.3392176 0.3189472 0.3599386 0.18064024 0.1687348 0.19302179  3793 0.11787135
# [5,] 0.9326458 0.9232512 0.9412144 0.73526423 0.7211827 0.74899569  1630 0.41113795
### PLOT
timeMin = floor(min(log(c(A100[,7], S800[,7], COPIOUS[,7]))))
timeMax = ceiling(max(log(c(A100[,7], S800[,7], COPIOUS[,7]))))
pdf(file = 'fig2.pdf', width = 7.5, height = 3.75, onefile = TRUE, family = 'Helvetica', paper = 'special')
#svg(filename = 'fig2.svg', width = 7.5, height = 3.75, onefile = TRUE, family = 'Helvetica', antialias = 'subpixel')
par(mfrow = c(1, 3), oma = c(1, 2.5, 0.25, 2.5), mar = c(1, 0, 0, 0), cex = 1, las = 1) ### c(bottom, left, top, right)
### A100
plot(1, 1, type = 'n', xlab = '', ylab = '', yaxt = 'n', xaxt = 'n', xpd = NA, xlim = lX, ylim = lY, col = 'black')
text(fX, fY, pos = 4, labels = expression(bold('A')), cex = cM)
axis(1, cex.axis = cA, las = "1", tcl = -0.2, mgp = c(1, 0.2, 0), xpd = NA, col.axis = 'black', col = 'black')
axis(2, cex.axis = cA, las = "1", tcl = -0.2, mgp = c(1.5, 0.5, 0), xpd = NA, col.axis = 'black', col = 'black')
arrows(A100[,4], A100[,1], A100[,4], A100[,3], length = 0.03, angle = 90, code = 2, col = 'black', lty = 1, lwd = 0.8)
arrows(A100[,4], A100[,1], A100[,4], A100[,2], length = 0.03, angle = 90, code = 2, col = 'black', lty = 1, lwd = 0.8)
arrows(A100[,4], A100[,1], A100[,5], A100[,1], length = 0.03, angle = 90, code = 2, col = 'black', lty = 1, lwd = 0.8)
arrows(A100[,4], A100[,1], A100[,6], A100[,1], length = 0.03, angle = 90, code = 2, col = 'black', lty = 1, lwd = 0.8)
points(A100[,4], A100[,1], pch = 22, col = 'white', cex = cP, bg = 'white')
rect(A100[,5], A100[,2], A100[,6], A100[,3], col = makeTransparent('#56ae6c', ((log(A100[,7])-timeMin)/timeMax*tT)+tC), angle = 0, border = NA)
text(A100[,4], A100[,1], labels = p, cex = cL, col = 'black', font = 2)
text(tX+tS+(((timeMax-timeMin)/2)*tS), tY+(tS/3), pos = 3, labels = expression('time ('*italic('s')*')'), cex = cK, col = 'black', font = 2)
for(k in timeMin:timeMax){
	j = k-timeMin
	rect(tX+(j*tS), tY, tX+tS+(j*tS), tY+(tS/1.5), col = makeTransparent('#56ae6c', ((k-timeMin)/timeMax*tT)+tC), angle = 0, border = NA)
	text(tX+(j*tS)+(tS/2), tY+(tS/3), labels = bquote('10'^.(k)), cex = cT, col = 'black', font = 2)
}
### S800
plot(1, 1, type = 'n', xlab = '', ylab = '', yaxt = 'n', xaxt = 'n', xpd = NA, xlim = lX, ylim = lY, col = 'black')
text(fX, fY, pos = 4, labels = expression(bold('B')), cex = cM)
axis(1, cex.axis = cA, las = "1", tcl = -0.2, mgp = c(1, 0.2, 0), xpd = NA, col.axis = 'black', col = 'black')
arrows(S800[,4], S800[,1], S800[,4], S800[,3], length = 0.03, angle = 90, code = 2, col = 'black', lty = 1, lwd = 0.8)
arrows(S800[,4], S800[,1], S800[,4], S800[,2], length = 0.03, angle = 90, code = 2, col = 'black', lty = 1, lwd = 0.8)
arrows(S800[,4], S800[,1], S800[,5], S800[,1], length = 0.03, angle = 90, code = 2, col = 'black', lty = 1, lwd = 0.8)
arrows(S800[,4], S800[,1], S800[,6], S800[,1], length = 0.03, angle = 90, code = 2, col = 'black', lty = 1, lwd = 0.8)
points(S800[,4], S800[,1], pch = 22, col = 'white', cex = cP, bg = 'white')
rect(S800[,5], S800[,2], S800[,6], S800[,3], col = makeTransparent('#56ae6c', ((log(S800[,7])-timeMin)/timeMax*tT)+tC), angle = 0, border = NA)
text(S800[,4], S800[,1], labels = p, cex = cL, col = 'black', font = 2)
text(tX+tS+(((timeMax-timeMin)/2)*tS), tY+(tS/3), pos = 3, labels = expression('time ('*italic('s')*')'), cex = cK, col = 'black', font = 2)
for(k in timeMin:timeMax){
	j = k-timeMin
	rect(tX+(j*tS), tY, tX+tS+(j*tS), tY+(tS/1.5), col = makeTransparent('#56ae6c', ((k-timeMin)/timeMax*tT)+tC), angle = 0, border = NA)
	text(tX+(j*tS)+(tS/2), tY+(tS/3), labels = bquote('10'^.(k)), cex = cT, col = 'black', font = 2)
}
### COPIOUS
plot(1, 1, type = 'n', xlab = '', ylab = '', yaxt = 'n', xaxt = 'n', xpd = NA, xlim = lX, ylim = lY, col = 'black')
text(fX, fY, pos = 4, labels = expression(bold('C')), cex = cM)
axis(1, cex.axis = cA, las = "1", tcl = -0.2, mgp = c(1, 0.2, 0), xpd = NA, col.axis = 'black', col = 'black')
axis(4, cex.axis = cA, las = "1", tcl = -0.2, mgp = c(1.5, 0.5, 0), xpd = NA, col.axis = 'black', col = 'black')
arrows(COPIOUS[,4], COPIOUS[,1], COPIOUS[,4], COPIOUS[,3], length = 0.03, angle = 90, code = 2, col = 'black', lty = 1, lwd = 0.8)
arrows(COPIOUS[,4], COPIOUS[,1], COPIOUS[,4], COPIOUS[,2], length = 0.03, angle = 90, code = 2, col = 'black', lty = 1, lwd = 0.8)
arrows(COPIOUS[,4], COPIOUS[,1], COPIOUS[,5], COPIOUS[,1], length = 0.03, angle = 90, code = 2, col = 'black', lty = 1, lwd = 0.8)
arrows(COPIOUS[,4], COPIOUS[,1], COPIOUS[,6], COPIOUS[,1], length = 0.03, angle = 90, code = 2, col = 'black', lty = 1, lwd = 0.8)
points(COPIOUS[,4], COPIOUS[,1], pch = 22, col = 'white', cex = cP, bg = 'white')
rect(COPIOUS[,5], COPIOUS[,2], COPIOUS[,6], COPIOUS[,3], col = makeTransparent('#56ae6c', ((log(COPIOUS[,7])-timeMin)/timeMax*tT)+tC), angle = 0, border = NA)
text(COPIOUS[,4], COPIOUS[,1], labels = p, cex = cL, col = 'black', font = 2)
text(tX+tS+(((timeMax-timeMin)/2)*tS), tY+(tS/3), pos = 3, labels = expression('time ('*italic('s')*')'), cex = cK, col = 'black', font = 2)
for(k in timeMin:timeMax){
	j = k-timeMin
	rect(tX+(j*tS), tY, tX+tS+(j*tS), tY+(tS/1.5), col = makeTransparent('#56ae6c', ((k-timeMin)/timeMax*tT)+tC), angle = 0, border = NA)
	text(tX+(j*tS)+(tS/2), tY+(tS/3), labels = bquote('10'^.(k)), cex = cT, col = 'black', font = 2)
}
mtext('Recall', 1, line = 0, cex = cM, outer = TRUE, col = 'black')
mtext('Precision', 2, line = 1.5, cex = cM, outer = TRUE, las = 0, col = 'black')
mtext('Precision', 4, line = 1.5, cex = cM, outer = TRUE, las = 0, col = 'black')
dev.off()
