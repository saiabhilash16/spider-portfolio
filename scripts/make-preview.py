# Single-file preview: dist/index.html + every asset the story needs as data URIs (window.__slots)
import base64, json, os, sys
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
html = open(os.path.join(root, 'dist/index.html'), encoding='utf8').read()
pub = os.path.join(root, 'public/assets/tribute/')
slots = {}
mime = {'.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.glb': 'model/gltf-binary'}
for f in os.listdir(pub + 'scene1'):
    ext = os.path.splitext(f)[1]
    if ext in mime: slots[f] = f'data:{mime[ext]};base64,' + base64.b64encode(open(pub + 'scene1/' + f, 'rb').read()).decode()
for f in ('character/spiderman-animated.glb',):
    slots[f] = 'data:model/gltf-binary;base64,' + base64.b64encode(open(pub + f, 'rb').read()).decode()
slots['resume.pdf'] = 'data:application/pdf;base64,' + base64.b64encode(open(os.path.join(root, 'public/resume.pdf'), 'rb').read()).decode()
inj = '<script>window.__slots=' + json.dumps(slots) + ';</script>'
out = html.replace('<head>', '<head>' + inj, 1)
dst = sys.argv[1]
open(dst, 'w', encoding='utf8').write(out)
print(dst, round(len(out) / 1e6, 1), 'MB')
