# Genera seller-slots.js: un hueco de logo junto a cada mesa COMMERCIAL, por fuera de su isla.
# Uso (dentro de la carpeta del repo):  python3 detect-seller-slots.py 2 70   (pabellón, lado del hueco en px)
# Hall 1 se generó con 68 y Hall 2 con 70. Necesita numpy y pillow.
import re, json, numpy as np
from PIL import Image
def load(hall):
    base='.'
    img=np.asarray(Image.open(f'{base}/Hall {hall}.png').convert('RGB')).astype(int)
    H,W,_=img.shape
    s=open(f'{base}/mesas.html').read()
    T=[]
    for m in re.finditer(r'<div class="mesa"([^>]*)>',s):
        a=m.group(1)
        g=lambda k: re.search(k+r':\s*([\d.]+)%',a).group(1)
        T.append(dict(id=re.search(r'data-info="([^"]+)"',a).group(1),
            type=(re.search(r'data-type="(\w+)"',a) or [None,'collector'])[1],
            x=float(g('left'))/100*W,y=float(g('top'))/100*H,w=float(g('width'))/100*W,h=float(g('height'))/100*H))
    return img,W,H,T

def islands(T):
    n=len(T); par=list(range(n))
    def f(i):
        while par[i]!=i: par[i]=par[par[i]]; i=par[i]
        return i
    for i in range(n):
        for j in range(i+1,n):
            a,b=T[i],T[j]
            dx=max(0,max(a['x'],b['x'])-min(a['x']+a['w'],b['x']+b['w']))
            dy=max(0,max(a['y'],b['y'])-min(a['y']+a['h'],b['y']+b['h']))
            if dx<=110 and dy<=110: par[f(i)]=f(j)
    for i,t in enumerate(T): t['isl']=f(i)
    box={}
    for t in T:
        b=box.setdefault(t['isl'],[1e9,1e9,-1e9,-1e9])
        b[0]=min(b[0],t['x']);b[1]=min(b[1],t['y']);b[2]=max(b[2],t['x']+t['w']);b[3]=max(b[3],t['y']+t['h'])
    return box
def side(t,box):
    b=box[t['isl']]; cx=t['x']+t['w']/2; cy=t['y']+t['h']/2
    if t['h']>t['w']:  # vertical
        return 'L' if cx < (b[0]+b[2])/2 else 'R'
    # horizontal: top/bottom; but quarter islands (type B) have horizontals above/below verticals at the outer edge
    return 'T' if cy < (b[1]+b[3])/2 else 'B'
LIGHT=[False]
def bad(px,bg,tol):
    diff=np.abs(px-bg).sum(1)>tol
    if LIGHT[0]: diff &= ~(px.min(1)>205)
    return diff
def clearance(img,t,sd,maxd=400,tol=45):
    H,W,_=img.shape
    x0,y0,x1,y1=int(t['x']),int(t['y']),int(t['x']+t['w']),int(t['y']+t['h'])
    if sd in 'LR':
        ya,yb=y0+2,y1-2
        bgx = x0-4 if sd=='L' else x1+3
        bg=np.median(img[ya:yb,bgx],axis=0)
        for d in range(4,maxd):
            x = x0-d if sd=='L' else x1+d-1
            if x<0 or x>=W: return d,bg
            col=img[ya:yb,x]
            if bad(col,bg,tol).any(): return d,bg
        return maxd,bg
    else:
        xa,xb=x0+2,x1-2
        bgy = y0-4 if sd=='T' else y1+3
        bg=np.median(img[bgy,xa:xb],axis=0)
        for d in range(4,maxd):
            y = y0-d if sd=='T' else y1+d-1
            if y<0 or y>=H: return d,bg
            row=img[y,xa:xb]
            if bad(row,bg,tol).any(): return d,bg
        return maxd,bg

import numpy as np
M=7          # margen mesa-hueco y entre huecos
def rect_overlap(a,b,pad=0):
    return not (a[0]+a[2]+pad<=b[0] or b[0]+b[2]+pad<=a[0] or a[1]+a[3]+pad<=b[1] or b[1]+b[3]+pad<=a[1])
def facing(t,T,sd,d):
    # ¿el obstáculo a distancia d es una mesa de otra isla?
    x0,y0,x1,y1=t['x'],t['y'],t['x']+t['w'],t['y']+t['h']
    for o in T:
        if o['isl']==t['isl']: continue
        if sd in 'LR':
            if o['y']+o['h']<=y0 or o['y']>=y1: continue
            dd = x0-(o['x']+o['w']) if sd=='L' else o['x']-x1
        else:
            if o['x']+o['w']<=x0 or o['x']>=x1: continue
            dd = y0-(o['y']+o['h']) if sd=='T' else o['y']-y1
        if 0<dd<=d+6: return True, dd
    return False, None
def build(hall, S0):
    img,W,H,T=load(hall); box=islands(T)
    LIGHT[0]=True
    out=[]
    for t in T:
        if t['type']!='commercial': continue
        sd=side(t,box); d,_=clearance(img,t,sd)
        sh,dd=facing(t,T,sd,d)
        L = t['h'] if sd in 'LR' else t['w']
        room = (min(d,dd) - 3*M)/2 if sh else d - 2*M
        S = min(S0, L - 2*3, room)   # nunca más largo que la mesa
        S = int(S)
        if sd=='L':  x=t['x']-M-S; y=t['y']+t['h']/2-S/2
        elif sd=='R': x=t['x']+t['w']+M; y=t['y']+t['h']/2-S/2
        elif sd=='T': x=t['x']+t['w']/2-S/2; y=t['y']-M-S
        else: x=t['x']+t['w']/2-S/2; y=t['y']+t['h']+M
        out.append(dict(id=t['id'],side=sd,x=round(x,1),y=round(y,1),s=S,isl=t['isl'],shared=sh,clr=d))
    # colisiones: con mesas y entre huecos
    rects=[(t['x'],t['y'],t['w'],t['h']) for t in T]
    bad=[]
    for i,a in enumerate(out):
        ra=(a['x'],a['y'],a['s'],a['s'])
        if any(rect_overlap(ra,r,2) for r in rects): bad.append((a['id'],'mesa'))
        for b in out[i+1:]:
            if rect_overlap(ra,(b['x'],b['y'],b['s'],b['s']),3): bad.append((a['id'],b['id']))
    # contenido impreso del plano dentro del hueco (texto, pastillas…)
    for a in out:
        x0,y0=int(a['x']),int(a['y']); reg=img[y0:y0+a['s'],x0:x0+a['s']].reshape(-1,3)
        bg=np.median(reg,axis=0)
        dark=((np.abs(reg-bg).sum(1)>45) & ~(reg.min(1)>205)).mean()
        a['ink']=round(float(dark),3)
        if dark>0.01: bad.append((a['id'],'ink',a['ink']))
    return img,W,H,T,out,bad

if __name__ == '__main__':
    import sys
    hall = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    S0 = int(sys.argv[2]) if len(sys.argv) > 2 else 70
    img, W, H, T, out, bad = build(hall, S0)
    if bad: print('AVISO colisiones:', bad)
    lines = ["        {t:'%s', sd:'%s', x:%s, y:%s, s:%d, g:%d}" % (a['id'], a['side'], a['x'], a['y'], a['s'], a['isl']) for a in out]
    js = ("/* ICONS 2027 · HALL %d · huecos de logo junto a cada mesa COMMERCIAL (generado con detect-seller-slots.py).\n"
          "   x, y, s en px del PNG (%dx%d). sd = lado (L, R, T, B). g = isla. */\n"
          "window.ICONS_SELLER_SLOTS = {\n    imageW: %d, imageH: %d, radius: 12,\n    list: [\n%s\n    ]\n};\n") % (hall, W, H, W, H, ",\n".join(lines))
    open('seller-slots.js', 'w').write(js)
    print('seller-slots.js:', len(out), 'huecos de', S0, 'px')
