"""Approved seven-decision worksheet: one Letter page, eight editable fields."""
import build as b
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, TextStringObject
from PIL import Image
from pathlib import Path
import hashlib, json, shutil, subprocess

QUESTIONS = [
    ('¿A quién ayudas y en qué situación?', 'Ayudo a… que necesita… cuando…'),
    ('¿Por qué te elegirían? ¿Cómo lo demostrarías?', 'Una razón concreta y la forma de comprobarla.'),
    ('¿Qué quieres que recuerden de ti?', 'Una promesa y las conductas que la sostienen.'),
    ('¿Cómo te llamarías y cómo lo explicarías?', 'Nombres por comprobar y una frase de presentación.'),
    ('¿Qué debe expresar y resolver el diseño?', 'Qué transmitir. Qué debe poder leerse o reconocerse.'),
    ('¿Cuáles serán tus tres primeras aplicaciones?', 'Dónde probarlas y qué preguntar a las personas.'),
    ('¿Cómo mantendrás las decisiones al día?', 'Archivos vigentes, responsable y algo por comprobar.')
]

def main():
    b.setup()
    dest=b.OUT/'antes-del-logo-mapa-de-marca-v1.pdf'
    c=b.canvas.Canvas(str(dest),pagesize=(b.W,b.H),pageCompression=1)
    c.setTitle('Antes del logo: el mapa de tu marca');c.setAuthor('Don Ventas')
    c.setSubject('Siete decisiones para preparar una marca. Hoja de trabajo rellenable.')
    b.logo(c,44,28,65)
    b.para(c,'EL CUADERNO DEL DON / HOJA DE TRABAJO',205,39,363,8,'Mono',b.BLUE,max_h=15)
    b.rule(c,80)
    b.para(c,'Antes del logo.',44,94,524,32,'Display',max_h=45)
    b.para(c,'El mapa de tu marca',44,138,524,16,'Medium',b.BLUE,max_h=24)
    b.para(c,'Escribe lo que sabes y señala lo que falta comprobar. Completa y guarda tu copia: esta hoja no envía tus respuestas.',44,166,524,10,'Body',b.GRAY,max_h=30)
    b.para(c,'MI NEGOCIO O PROYECTO',44,204,170,8,'Mono',b.BLUE,max_h=16)
    def field(name,label,x,top,w,h,maxlen,multi=False):
        c.acroForm.textfield(name=name,tooltip=label,x=x,y=b.H-top-h,width=w,height=h,fontName='Helvetica',fontSize=9,
            textColor=b.INK,borderColor=b.LINE,fillColor=b.white,borderWidth=.6,forceBorder=True,
            fieldFlags='multiline doNotScroll' if multi else 'doNotScroll',maxlen=maxlen,value='')
    field('proyecto','Mi negocio o proyecto (hasta 60 caracteres)',220,201,348,23,60,True)
    for i,(q,hint) in enumerate(QUESTIONS):
        top=240+i*57
        b.para(c,f'{i+1:02d} / {q}',44,top,524,10,'Medium',max_h=15)
        b.para(c,hint,44,top+15,524,8,'Body',b.GRAY,max_h=12)
        field('decision_'+str(i+1),q+' (hasta 120 caracteres)',44,top+29,524,23,120,True)
    b.para(c,'Primero el rumbo. Después, la forma.',44,648,524,12,'Medium',b.BLUE,max_h=18)
    b.para(c,'No sustituye validar la demanda ni la disponibilidad legal de un nombre.',44,669,524,8.5,'Body',b.GRAY,max_h=13)
    b.para(c,'Uso personal o interno. Tus respuestas son tuyas. No revender ni redistribuir el recurso sin autorización; para compartirlo, envía el enlace al artículo.',44,690,524,8,'Body',b.GRAY,max_h=26)
    b.rule(c,733)
    c.setFillColor(b.BLUE);c.setFont('Medium',9);c.drawString(44,39,'Volver al artículo en donventas.mx')
    c.linkURL('https://www.donventas.mx/blog/como-crear-una-marca.html',(44,34,285,49))
    c.setFont('Mono',8);c.drawRightString(568,39,'OCT 2026 / 01')
    c.showPage();c.save()
    w=PdfWriter(clone_from=dest);w.root_object[NameObject('/Lang')]=TextStringObject('es-MX');w.pages[0][NameObject('/Tabs')]=NameObject('/R');w.write(dest)
    r=PdfReader(dest);fields=r.get_fields();assert len(r.pages)==1 and len(fields)==8
    assert len(r.trailer['/Root']['/AcroForm']['/Fields'])==8
    # A deliberately full one-line response must fit the physical field as well as its logical limit.
    values={key:('Mi proyecto' if key=='proyecto' else 'Ayudo a personas que quieren empezar con claridad. Lo comprobaré hablando con ellas.') for key in fields}
    filled=b.TMP/'antes-del-logo-filled.pdf';w=PdfWriter(clone_from=dest)
    w.update_page_form_field_values(None,values,auto_regenerate=False);w.write(filled)
    saved=PdfReader(filled);assert all(saved.get_fields()[key]['/V']==value for key,value in values.items())
    widgets=[a.get_object() for a in saved.pages[0]['/Annots'] if a.get_object().get('/Subtype')=='/Widget'];assert len(widgets)==8
    for a in widgets:assert a['/V']==values[a['/T']] and a['/AP']['/N'].get_object().get_data()
    poppler=shutil.which('pdftoppm');assert poppler,'pdftoppm required'
    prefix=b.TMP/'antes-del-logo-blank'
    subprocess.run([poppler,'-singlefile','-scale-to-x','1224','-scale-to-y','-1','-png',str(dest),str(prefix)],check=True)
    subprocess.run([poppler,'-singlefile','-scale-to-x','1224','-scale-to-y','-1','-png',str(filled),str(b.TMP/'antes-del-logo-filled')],check=True)
    preview=b.SERVED/(dest.stem+'-preview.webp')
    with Image.open(prefix.with_suffix('.png')) as im:
        im.resize((612,792),Image.Resampling.LANCZOS).convert('RGB').save(preview,'WEBP',quality=85,method=6)
    shutil.copyfile(dest,b.SERVED/dest.name)
    result={'file':dest.name,'pages':1,'fields':8,'bytes':dest.stat().st_size,'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'preview':preview.name,'fill':'saved/reopened; fields and widget appearances checked','physical_print':'NOT_TESTED'}
    (b.OUT/'qa-brand-map.json').write_text(json.dumps(result,indent=2),encoding='utf-8');print(json.dumps(result))

if __name__=='__main__':main()
