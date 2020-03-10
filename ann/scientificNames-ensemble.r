### LIBRARIES
library(MASS)
library(readr)
library(precrec)
### FUNCTION
ty.lda <- function(x, groups){ ### https://stackoverflow.com/questions/5629550/classification-functions-in-linear-discriminant-analysis-in-r
	x.lda <- lda(groups ~ ., as.data.frame(x))
	gr <- length(unique(groups)) ### groups might be factors or numeric
	v <- ncol(x) ### variables
	m <- x.lda$means ### group means
	w <- array(NA, dim = c(v, v, gr))
	for(i in 1:gr){
		tmp <- scale(subset(x, groups == unique(groups)[i]), scale = FALSE)
		w[,,i] <- t(tmp) %*% tmp
	}
	W <- w[,,1]
	for(i in 2:gr)
		W <- W + w[,,i]
	V <- W/(nrow(x) - gr)
	iV <- solve(V)
	class.funs <- matrix(NA, nrow = v + 1, ncol = gr)
	colnames(class.funs) <- paste("group", 1:gr, sep=".")
	rownames(class.funs) <- c("constant", paste("var", 1:v, sep = "."))
	for(i in 1:gr) {
		class.funs[1, i] <- -0.5 * t(m[i,]) %*% iV %*% (m[i,])
		class.funs[2:(v+1) ,i] <- iV %*% (m[i,])
	}
	x.lda$class.funs <- class.funs
	return(x.lda)
}
### DATA
ue <- as.data.frame(read_csv('level1-uelda.csv.xz', col_names = FALSE))
colnames(ue) <- c('g', 'b', 'e', 'l', 'p', 'w')
be <- as.data.frame(read_csv('level1-belda.csv.xz', col_names = FALSE))
colnames(be) <- c('g', 'b', 'e', 'l', 'p', 'w')
### U|B ELDA MASS STYLE (+ == 1; - == 0)
c <- c('be', 'bel', 'belp', 'belpw', 'belw', 'bep', 'bepw', 'bew', 'bl', 'blp', 'blpw', 'blw', 'bp', 'bpw', 'el', 'elp', 'elpw', 'elw', 'ep', 'epw', 'lp', 'lpw')
uo <- data.frame(combination = character(), AUC = double(), scale = character(), fn = character())
bo <- data.frame(combination = character(), AUC = double(), scale = character(), fn = character())
uv <- as.integer(0.9*nrow(ue))
bv <- as.integer(0.9*nrow(be))
for(k in 1:length(c)){
	y <- unlist(strsplit(c[k], ''))
	u <- ty.lda(ue[1:uv,y], ue[1:uv,'g'])
	b <- ty.lda(be[1:bv,y], be[1:bv,'g'])
	ux <- rep(u$class.funs[1,2], nrow(ue)-uv)
	bx <- rep(b$class.funs[1,2], nrow(be)-bv)
	for(j in 2:nrow(u$class.funs)){
		ux <- ux+(u$class.funs[j,2]*ue[(uv+1):nrow(ue),y[j-1]])
		bx <- bx+(b$class.funs[j,2]*be[(bv+1):nrow(be),y[j-1]])
	}
	e <- evalmod(mmdata(ux, ue[(uv+1):nrow(ue),'g'], modnames = c('lda')), mode = 'prcroc', x_bins = 1000)
	uo <- rbind(uo, list(c[k], subset(auc(e), curvetypes == 'PRC')[,4], paste(u$scaling, collapse = ' | '), paste(u$class.funs[,2], collapse = ' | ')), stringsAsFactors = FALSE)
	e <- evalmod(mmdata(bx, be[(bv+1):nrow(be),'g'], modnames = c('lda')), mode = 'prcroc', x_bins = 1000)
	bo <- rbind(bo, list(c[k], subset(auc(e), curvetypes == 'PRC')[,4], paste(b$scaling, collapse = ' | '), paste(b$class.funs[,2], collapse = ' | ')), stringsAsFactors = FALSE)
}
colnames(uo) <- c('combination', 'AUC', 'scale', 'fn')
write.csv(uo, file = 'uelda.csv')
colnames(bo) <- c('combination', 'AUC', 'scale', 'fn')
write.csv(bo, file = 'belda.csv')
