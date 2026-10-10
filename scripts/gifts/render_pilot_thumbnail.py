"""Faithful first-page thumbnail of the approved pilot PDF; does not edit the PDF."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import sys
from PIL import Image

root = Path(__file__).resolve().parents[2]
catalog = json.loads((root / 'blog/article-gifts.json').read_text(encoding='utf-8'))
poppler = shutil.which('pdftoppm')
if not poppler:
    raise SystemExit('pdftoppm required; no substitute illustration')
articles = catalog['articles'] if '--all' in sys.argv else {'contenido-que-atrae-clientes': catalog['articles']['contenido-que-atrae-clientes']}
for article, gift in articles.items():
    pdf = root / gift['file'].lstrip('/')
    target = pdf.with_name(pdf.stem + '-preview.webp')
    temp = root / 'tmp/pdfs' / (article + '-thumbnail')
    temp.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run([poppler, '-f', '1', '-singlefile', '-scale-to-x', '612', '-scale-to-y', '-1', '-png', str(pdf), str(temp)], check=True)
    with Image.open(temp.with_suffix('.png')) as page:
        page.convert('RGB').save(target, 'WEBP', quality=85, method=6)
        size = list(page.size)
    print(json.dumps({'source': str(pdf.relative_to(root)), 'sha256': hashlib.sha256(pdf.read_bytes()).hexdigest(), 'thumbnail': str(target.relative_to(root)), 'dimensions': size, 'bytes': target.stat().st_size}))
