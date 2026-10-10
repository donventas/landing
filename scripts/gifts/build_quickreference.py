"""One-page consultation adaptations; original approved PDFs are never overwritten.
Run --pilot for the actual export gate, then no arguments for all seven.
"""
import build as b
from build import ROOT, OUT, TMP, SERVED, W, H, M, CW, INK, PAPER, BLUE, GRAY, LINE
from build import para, rect, rule, logo, canvas, white, PdfReader, PdfWriter, NameObject, TextStringObject
from reportlab.lib.utils import ImageReader
from PIL import Image
from pathlib import Path
import json, hashlib, shutil, sys

CONTENT=Path(__file__).with_name('quick-reference.json')
PIECES=json.loads(CONTENT.read_text(encoding='utf-8'))

def page(c,p):
    rect(c,0,0,W,H,white)
    logo(c,M,32,68)
    kind='CHECKLIST ACCIONABLE' if p['type']=='checklist' else 'GUÍA RÁPIDA / CHEATSHEET'
    para(c,kind,282,40,286,8.6,'Mono',BLUE,max_h=15)
    para(c,'UNA HOJA PARA TENER A MANO',282,57,286,8,'Mono',GRAY,max_h=13)
    rule(c,91)
    para(c,p['title'],M,110,268,31,'Display',leading=33,max_h=99)
    para(c,p['hook'],M,220,268,11.5,'Medium',max_h=47)
    with Image.open(ROOT/p['image']) as im:
        ih=236*im.height/im.width
        assert ih<=158,'Art must fit whole, without crop'
        c.drawImage(ImageReader(im),332,H-110-ih,236,ih)
    para(c,'ESCENA CONCEPTUAL CON IA',332,274,236,7.5,'Mono',GRAY,max_h=12)
    para(c,p['instruction'],M,295,CW,10.2,'Body',GRAY,max_h=15)
    if p['type']=='checklist':
        for i,(action,criterion) in enumerate(p['items']):
            top=324+i*49
            c.acroForm.checkbox(name=p['id']+'_'+str(i+1),tooltip=action,
                x=M,y=H-top-16,size=15,checked=False,buttonStyle='check',
                borderColor=BLUE,fillColor=white,textColor=BLUE,borderWidth=1,
                forceBorder=True)
            para(c,action,M+29,top-2,CW-29,12,'Medium',max_h=18)
            para(c,criterion,M+29,top+18,CW-29,10.7,'Body',GRAY,max_h=30)
    else:
        for i,(situation,action,example) in enumerate(p['items']):
            top=324+i*79
            if i: rule(c,top-10)
            para(c,situation,M,top,159,10,'Mono',BLUE,max_h=42)
            para(c,action,224,top-2,344,12,'Medium',max_h=34)
            para(c,example,224,top+33,344,10.8,'Body',GRAY,max_h=45)
    rect(c,M,580,CW,68,PAPER)
    para(c,p['closingTitle'],M+14,590,CW-28,8.3,'Mono',BLUE,max_h=13)
    para(c,p['closing'],M+14,609,CW-28,10.3,'Body',INK,max_h=32)
    para(c,b.NOTICE,M,661,CW,9.3,'Body',GRAY,leading=11.5,max_h=58)
    rule(c,733)
    c.setFont('Medium',9);c.setFillColor(BLUE)
    c.drawString(M,39,p.get('shareLabel','Volver al artículo en donventas.mx'))
    c.linkURL(p.get('shareUrl','https://www.donventas.mx/blog/'+p['article']+'.html'),(M,34,M+240,49),relative=0)
    c.setFont('Mono',8);c.setFillColor(GRAY)
    c.drawRightString(W-M,39,p['revision'].upper()+' / OCT 2026 / 01')
    c.showPage()

def verify(path,p):
    r=PdfReader(path);assert len(r.pages)==1
    fields=r.get_fields() or {};expected=5 if p['type']=='checklist' else 0
    assert len(fields)==expected
    if expected:
        assert len(r.trailer['/Root']['/AcroForm']['/Fields'])==expected
        writer=PdfWriter(clone_from=path)
        values={k:NameObject('/Yes' if i%2==0 else '/Off') for i,k in enumerate(fields)}
        writer.update_page_form_field_values(None,values,auto_regenerate=False)
        filled=TMP/(path.stem+'-checked.pdf');writer.write(filled)
        saved=PdfReader(filled);got=saved.get_fields()
        for key,val in values.items():assert got[key]['/V']==val
        widgets=[a.get_object() for a in saved.pages[0]['/Annots'] if a.get_object().get('/Subtype')=='/Widget']
        assert len(widgets)==expected
        for f in widgets:
            assert f['/V']==values[f['/T']]==f['/AS']
            assert f['/AP']['/N'][f['/AS']].get_object().get_data()
    txt=r.pages[0].extract_text()
    assert 'No se autoriza revender' in txt
    assert not any(a.get_object().get('/Subtype')=='/Widget' and a.get_object().get('/FT')=='/Tx' for a in r.pages[0].get('/Annots',[]))
    assert any(a.get_object().get('/A',{}).get('/URI')==p.get('shareUrl','https://www.donventas.mx/blog/'+p['article']+'.html') for a in r.pages[0].get('/Annots',[]))
    return {'file':path.name,'article':p['article'],'type':p['type'],'pages':1,'checkboxes':expected,
        'words':len(txt.split()),'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}

def main():
    b.setup();results=[]
    selected=PIECES[:1] if '--pilot' in sys.argv else PIECES
    for p in selected:
        path=OUT/(p['id']+'-'+p['revision']+'.pdf')
        c=canvas.Canvas(str(path),pagesize=(W,H),pageCompression=1)
        c.setTitle(p['title'].replace('\n',' '));c.setAuthor('Don Ventas')
        c.setSubject('Herramienta de consulta / revisión local / '+p['type'])
        page(c,p);c.save()
        w=PdfWriter(clone_from=path);w._root_object[NameObject('/Lang')]=TextStringObject('es-MX')
        w.pages[0][NameObject('/Tabs')]=NameObject('/R');w.write(path)
        results.append(verify(path,p));shutil.copyfile(path,SERVED/path.name)
    sources=[Path(__file__),CONTENT,Path(b.__file__),ROOT/'assets/gifts/donventas-wordmark-b6.png',*[ROOT/p['image'] for p in selected]]
    packet={'status':'PENDING_VISUAL_QA','artifacts':results,
        'sources':{str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sources},
        'limitations':['No PDF/UA certification','No physical print or Acrobat/mobile-device validation','No public release','Inherited use notice pending legal review']}
    (OUT/('qa-quick-pilot.json' if '--pilot' in sys.argv else 'qa-quick-reference.json')).write_text(json.dumps(packet,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(results,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
