"""Don Ventas: bounded adaptation of the approved Runtime illustrated v2 family.
No network, publication, subscription or private client inputs. Existing approved art.
Dependencies: reportlab, pypdf, Pillow, fonttools[woff]. Output and served bytes match.
"""
from pathlib import Path
import os, sys, json, hashlib, shutil
from xml.sax.saxutils import escape
ROOT=Path(__file__).resolve().parents[2]
if os.environ.get('DV_FONTTOOLS_PATH'): sys.path.insert(0,os.environ['DV_FONTTOOLS_PATH'])
from fontTools.ttLib import TTFont as Font
from fontTools.varLib.instancer import instantiateVariableFont
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.lib.utils import ImageReader, simpleSplit
from PIL import Image
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, TextStringObject
OUT=ROOT/'output/pdf/recursos-blog'; TMP=ROOT/'tmp/pdfs/gifts'; SERVED=ROOT/'assets/gifts'
W,H,M,CW=612,792,44,524
INK,PAPER,BLUE,ACCENT,GRAY,LINE=map(HexColor,['#0E1117','#EEF1F6','#1B49A0','#3B74F2','#4D596A','#C5CDDA'])
NOTICE=('Un recurso de Don Ventas para ponerlo en práctica. Puedes utilizarlo y completar sus ejercicios para uso personal o interno de tu negocio. No se autoriza revender ni redistribuir este material, incorporarlo a productos o cursos comerciales, ni presentarlo como propio sin autorización escrita. Tus respuestas y los contenidos originales que desarrolles siguen siendo tuyos. Para compartir el recurso, comparte el enlace al artículo.')
PIECES=json.loads(Path(__file__).with_name('content.json').read_text(encoding='utf-8'))
def setup():
    for p in (OUT,TMP,SERVED):p.mkdir(parents=True,exist_ok=True)
    for name,weight in [('Body',400),('Medium',600),('Display',800)]:
        f=instantiateVariableFont(Font(ROOT/'assets/fonts/schibsted-grotesk-latin-normal.woff2'),{'wght':weight},inplace=True);f.flavor=None
        for nid in (1,4,6):
            for platform,enc,lang in [(3,1,0x409),(1,0,0)]:f['name'].setName('SchibstedGrotesk-'+name,nid,platform,enc,lang)
        p=TMP/(name+'.ttf');f.save(p);pdfmetrics.registerFont(TTFont(name,str(p)))
    f=Font(ROOT/'assets/fonts/space-mono-latin-400.woff2');f.flavor=None;f.save(TMP/'Mono.ttf');pdfmetrics.registerFont(TTFont('Mono',str(TMP/'Mono.ttf')))
def para(c,text,x,top,width=CW,size=12,font='Body',color=INK,max_h=100,leading=None):
    p=Paragraph(escape(text).replace('\n','<br/>'),ParagraphStyle('p',fontName=font,fontSize=size,leading=leading or size*1.36,textColor=color))
    _,height=p.wrap(width,H);assert height<=max_h,(text[:50],height,max_h);assert top+height<=720,(text[:50],top+height)
    p.drawOn(c,x,H-top-height);return height
def rect(c,x,top,width,height,color):c.setFillColor(color);c.rect(x,H-top-height,width,height,stroke=0,fill=1)
def rule(c,top):c.setStrokeColor(LINE);c.setLineWidth(.6);c.line(M,H-top,W-M,H-top)
def logo(c,x,top,width=76):c.drawImage(str(ROOT/'assets/gifts/donventas-wordmark-b6.png'),x,H-top-width*130/210,width,width*130/210,mask='auto')
def art(c,p,x,top,width):
    with Image.open(ROOT/'assets/editorial'/p['image']) as im:
        height=width*im.height/im.width;c.drawImage(ImageReader(im),x,H-top-height,width,height)
def base(c,p,page):
    rect(c,0,0,W,H,white);logo(c,M,39);para(c,'RECURSOS PARA PONER EN PRÁCTICA\n'+p['no']+' / '+p['topic'],220,48,348,8.3,'Mono',GRAY,max_h=35)
    rule(c,105);rule(c,733);c.setFont('Mono',7.5);c.setFillColor(GRAY);c.drawString(M,39,'DON VENTAS / REVISIÓN 01 / OCT 2026');c.drawRightString(W-M,39,f'{page:02d} / 03')
def opening(c,p):
    base(c,p,1);para(c,p['title'],M,124,size=38,font='Display',leading=40,max_h=82)
    art(c,p,M,225,CW);para(c,'ILUSTRACIÓN CON IA / ESCENA CONCEPTUAL DEL UNIVERSO DON VENTAS',M,584,size=8,font='Mono',color=GRAY,max_h=24)
    para(c,p['hook'],M,612,size=23,font='Display',leading=27,max_h=55)
    para(c,'Mira el ejemplo. Completa la ficha. Prueba una mejora concreta.',M,688,size=11,color=GRAY,max_h=16);c.showPage()
def badge(c,n,x,top):
    c.setFillColor(BLUE);c.circle(x+9,H-top-9,9,fill=1,stroke=0);c.setFillColor(white);c.setFont('Mono',9);c.drawCentredString(x+9,H-top-12,str(n))
def panel(c,x,top,width,height):
    rect(c,x+3,top+3,width,height,PAPER);rect(c,x,top,width,height,white);c.setStrokeColor(LINE);c.rect(x,H-top-height,width,height,fill=0,stroke=1)
def demo(c,p):
    base(c,p,2);para(c,p['demoTitle'],M,124,size=29,font='Display',leading=31,max_h=64)
    kind=p['demo']
    if kind=='phrases':
        rect(c,M,223,CW,69,PAPER);para(c,'«Soluciones integrales para potenciar tu negocio».',M+18,241,CW-36,17,'Medium',max_h=47)
        rows=[('A quién y cuándo','Ayudo a negocios que venden, pero no saben cuánto pueden gastar.'),('Qué resuelves','Ordenamos sus cobros y pagos para ver qué compromisos pueden asumir.'),('Cómo lo demuestras','Lo revisamos con un calendario de caja; no gestionamos préstamos.')]
        for i,(title,text) in enumerate(rows):
            y=323+i*91;badge(c,i+1,M,y);para(c,title,M+30,y-2,CW-30,13,'Medium',BLUE,max_h=19);para(c,text,M+30,y+25,CW-30,14,max_h=40)
        takeaway='Léele tus frases a alguien: ¿puede explicar qué haces y qué no haces?'
    elif kind=='promise':
        panel(c,M,220,224,321);logo(c,M+18,237,55);para(c,'Entrega de una pieza',M+18,294,188,19,'Display',max_h=54)
        for i,text in enumerate(['Cierre revisado','Cuidados explicados','Canal para resolver dudas']):
            rect(c,M+18,378+i*44,11,11,PAPER);para(c,text,M+38,374+i*44,168,11,max_h=31)
        para(c,'FICHA ILUSTRATIVA',M+18,513,190,8,'Mono',GRAY,max_h=14)
        rows=[('Antes de entregar','Revisar el cierre. No darlo por hecho.'),('Al entregar','Explicar cómo cuidar la pieza.'),('Después','Indicar a quién preguntar si hay una duda.')]
        for i,(title,text) in enumerate(rows):
            y=235+i*103;badge(c,i+1,301,y);para(c,title,331,y-2,237,14,'Medium',BLUE,max_h=21);para(c,text,331,y+28,237,12,max_h=52)
        takeaway='Elige una promesa que tu operación sí pueda cumplir y repetir.'
    elif kind=='handoff':
        for x,label in [(M,'SIN CONTEXTO'),(322,'CON UNA RUTA')]:
            para(c,label,x,220,246,9,'Mono',GRAY,max_h=15);panel(c,x,247,246,303)
        for i,label in enumerate(['logo_final.png','logo_final_ahora_si.png','manual_viejo.pdf']):para(c,label,M+14,269+i*39,218,10,'Mono',max_h=29)
        para(c,'¿Cuál uso?\n¿En qué fondo?\n¿A quién le pregunto?',M+14,425,218,16,'Medium',max_h=77)
        rows=[('01 / EMPIEZA AQUÍ','Pieza, responsable y ejemplo.'),('02 / ARCHIVOS VIGENTES','Versión correcta para ese uso.'),('03 / GUÍA BREVE','Fondos, márgenes y dudas.')]
        for i,(title,text) in enumerate(rows):
            y=267+i*83;para(c,title,336,y,218,9,'Mono',BLUE,max_h=15);para(c,text,336,y+26,218,13,'Medium',max_h=39)
        takeaway='Pide a alguien que prepare una pieza sin tu ayuda. Anota dónde se detuvo.'
    elif kind=='logo':
        for i,(title,sub) in enumerate([('PANTALLA','Tamaño y lectura'),('IMPRESO','Material y detalle'),('FONDO','Contraste y versión')]):
            x=M+i*178;para(c,title,x,224,160,9,'Mono',GRAY,max_h=15);panel(c,x,252,160,168);logo(c,x+32,276,96);para(c,sub,x+12,381,136,10,'Medium',max_h=28)
        para(c,'UNA PRUEBA, TRES PREGUNTAS',M,455,size=9,font='Mono',color=BLUE,max_h=15)
        for i,t in enumerate(['¿Se entiende a su tamaño real, sin hacer zoom?','¿Es la versión prevista para ese fondo o material?','¿Conserva sus detalles al imprimir o reproducir?']):badge(c,i+1,M,492+i*38);para(c,t,M+30,490+i*38,CW-30,12,max_h=18)
        takeaway='Estos soportes son esquemas, no pruebas de legibilidad. Usa tu pieza real: no copies un tamaño mínimo ajeno.'
    else:
        panel(c,M,221,CW,90);rect(c,M,221,CW,23,PAPER);para(c,'CONSULTA PROPUESTA / NO ES UN RESULTADO DE GOOGLE',M+14,226,CW-28,8,'Mono',GRAY,max_h=13)
        para(c,'escritorio a medida para espacio pequeño en Mérida',M+18,263,CW-36,17,'Medium',max_h=47)
        rows=[('Necesidad','Que el escritorio quepa.'),('Lugar','Mérida, si realmente atiendes ahí.'),('Registro','Fecha, dispositivo y lo que apareció.')]
        for i,(title,text) in enumerate(rows):
            y=348+i*69;badge(c,i+1,M,y);para(c,title,M+30,y-2,134,13,'Medium',BLUE,max_h=19);para(c,text,224,y-2,344,13,max_h=37)
        rect(c,M,576,CW,56,PAPER);para(c,'Una búsqueda aislada no demuestra demanda ni tu posición habitual. Los resultados pueden variar.',M+16,589,CW-32,11,max_h=33)
        takeaway='Busca un dato que ayude a elegir y comprueba si está claro en tu página.'
    para(c,'EJEMPLO ILUSTRATIVO / NO REPRESENTA RESULTADOS DE CLIENTES',M,651,size=8,font='Mono',color=GRAY,max_h=24)
    para(c,takeaway,M,683,size=11,font='Medium',max_h=33);c.showPage()
def worksheet(c,p):
    base(c,p,3);para(c,'Ahora, con tu negocio.',M,123,size=28,font='Display',max_h=40)
    para(c,'Responde en breve. Guarda tu copia: este PDF no envía tus respuestas.',M,165,size=10,color=GRAY,max_h=15)
    for i,label in enumerate(p['fields']):
        top=196+i*69;para(c,f'{i+1:02d} / {label}',M,top,size=11,font='Medium',max_h=16)
        c.acroForm.textfield(name=p['id']+'_'+str(i+1),tooltip=label+' (máximo 200 caracteres)',x=M,y=H-top-59,width=CW,height=40,fontName='Helvetica',fontSize=11,textColor=INK,borderColor=LINE,fillColor=PAPER,borderWidth=.6,forceBorder=True,fieldFlags='multiline doNotScroll',maxlen=200,value='')
    para(c,'CON IA, SI TE AYUDA',M,553,size=8.5,font='Mono',color=BLUE,max_h=13)
    para(c,p['prompt']+' Anonimiza datos y revisa el resultado.',M,575,size=10,max_h=42);rule(c,626);para(c,NOTICE,M,641,size=10,max_h=70)
    c.setFont('Medium',9);c.setFillColor(BLUE);c.drawString(M,66,'Leer el artículo completo en donventas.mx');c.linkURL('https://www.donventas.mx/blog/'+p['article']+'.html',(M,62,M+255,76),relative=0);c.showPage()
def validate(path):
    r=PdfReader(path);fields=r.get_fields();assert len(r.pages)==3 and len(fields)==5
    assert len(r.trailer['/Root']['/AcroForm']['/Fields'])==5
    w=PdfWriter(clone_from=path);value='Revisión de una situación real: atención, claridad y próxima acción. '+('Una respuesta larga para comprobar espacio y acentos. '*3);value=value[:200]
    values={key:value for key in fields};wrapped={key:'\n'.join(simpleSplit(val,'Helvetica',11,CW-8)) for key,val in values.items()}
    assert all(len(v.splitlines())<=3 for v in wrapped.values());w.update_page_form_field_values(None,wrapped,auto_regenerate=False)
    widgets=0
    for page in w.pages:
        for ref in page.get('/Annots',[]):
            obj=ref.get_object()
            if obj.get('/Subtype')=='/Widget':
                widgets+=1;assert obj['/T'] in fields;obj[NameObject('/V')]=TextStringObject(values[obj['/T']]);assert obj['/AP']['/N'].get_object().get_data()
    assert widgets==5
    filled=TMP/(path.stem+'-filled.pdf');w.write(filled);rr=PdfReader(filled);assert all(rr.get_fields()[k]['/V']==v for k,v in values.items())
    return {'file':path.name,'pages':3,'fields':5,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'words':sum(len(p.extract_text().split()) for p in r.pages),'fill':'saved/reopened; measured-wrap appearance, not native viewer wrapping','render':'pending'}
def main():
    setup();results=[]
    for p in PIECES:
        path=OUT/(p['id']+'-v1.pdf');c=canvas.Canvas(str(path),pagesize=(W,H),pageCompression=1);c.setTitle(p['title'].replace('\n',' '));c.setAuthor('Don Ventas');c.setSubject('Recurso editorial para revisión; no publicado.')
        opening(c,p);demo(c,p);worksheet(c,p);c.save();w=PdfWriter(clone_from=path);w._root_object[NameObject('/Lang')]=TextStringObject('es-MX')
        for page in w.pages:page[NameObject('/Tabs')]=NameObject('/R')
        w.write(path);results.append(validate(path));shutil.copyfile(path,SERVED/path.name)
    sources=[Path(__file__),Path(__file__).with_name('content.json'),ROOT/'assets/gifts/donventas-wordmark-b6.png',*[ROOT/'assets/editorial'/p['image'] for p in PIECES]]
    packet={'status':'LOCAL_DRAFT_PENDING_VISUAL_REVIEW','artifacts':results,'sources':{str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sources},'limitations':['No PDF/UA certification','No Acrobat/mobile typing or physical print validation','Use notice pending legal review','No public release']}
    (OUT/'qa.json').write_text(json.dumps(packet,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(results,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
