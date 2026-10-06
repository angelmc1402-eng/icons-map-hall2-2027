# Detecta los stands verdes (relleno #8BEDC3, borde #00857C) del plano y saca su caja exterior y radio en px.
# Uso: python3 detect-stands.py "Hall X.png" > stands.json  -> copiar a config.js -> stands.list
import sys, json, numpy as np
from PIL import Image
from scipy import ndimage
a = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(int)
H, W, _ = a.shape
fill = np.array([139,237,195]); bord = np.array([0,133,124])
dfill = np.abs(a - fill).sum(2) <= 12
lab, n = ndimage.label(dfill)
m = ((np.abs(a-bord).sum(2)<260)&((a[:,:,1]-a[:,:,0])>30))|dfill
out = []
for i, sl in enumerate(ndimage.find_objects(lab)):
    ys, xs = sl; h = ys.stop-ys.start; w = xs.stop-xs.start
    if min(w,h) < 100 or (lab[sl]==i+1).sum() < 0.6*w*h: continue
    cy=(ys.start+ys.stop)//2; cx=(xs.start+xs.stop)//2
    def walk(x,y,dx,dy):
        k=0
        while k<14 and np.abs(a[y,x]-bord).sum()<260 and a[y,x][1]-a[y,x][0]>30: x+=dx; y+=dy; k+=1
        return k
    bl=[];br=[];bt=[];bb=[]
    for f in (0.3,0.5,0.7):
        yy=int(ys.start+f*h); xx=int(xs.start+f*w)
        bl.append(walk(xs.start-1,yy,-1,0)); br.append(walk(xs.stop,yy,1,0))
        bt.append(walk(xx,ys.start-1,0,-1)); bb.append(walk(xx,ys.stop,0,1))
    med=lambda v:int(np.median(v))
    L=xs.start-med(bl); R=xs.stop+med(br); T=ys.start-med(bt); B=ys.stop+med(bb)
    ks=[]
    for (x0,y0,dx,dy) in [(L,T,1,1),(R-1,T,-1,1),(L,B-1,1,-1),(R-1,B-1,-1,-1)]:
        k=0
        while k<80 and not m[y0+dy*k, x0+dx*k]: k+=1
        ks.append(k)
    k = float(np.median(ks)); r = (k+0.5)/(1-1/np.sqrt(2))
    out.append(dict(x=int(L), y=int(T), w=int(R-L), h=int(B-T), r=round(r,1), b=int(round((med(bl)+med(br)+med(bt)+med(bb))/4))))
out.sort(key=lambda o:(o['y']//60, o['x']))
print(json.dumps(dict(W=W,H=H,n=len(out),slots=out)))
