from pathlib import Path
import json, configparser, re, hashlib
from PIL import Image

ROOT = Path(__file__).resolve().parent
GROUPS = ROOT / 'prototype/content/groups'
TPL_COVER = ROOT / 'prototype/templates/組別範本_複製後改名/第01組_留一扇門給日常_主視覺.jpg'
TPL_DOOR = ROOT / 'prototype/templates/組別範本_複製後改名/第01組_留一扇門給日常_門卡.jpg'

hashes = set()
for p in [TPL_COVER, TPL_DOOR]:
    if p.exists():
        hashes.add(hashlib.md5(p.read_bytes()).hexdigest())

def extract_dominant_color(img_path):
    try:
        im = Image.open(img_path)
        img = im.convert('RGB').resize((100, 100))
        paletted = img.quantize(colors=16, method=Image.Quantize.MEDIANCUT)
        palette = paletted.getpalette()[:48]
        color_counts = sorted(paletted.getcolors(), reverse=True)
        best_c = None
        best_score = -1
        for count, idx in color_counts:
            r, g, b = palette[idx*3 : idx*3 + 3]
            max_c = max(r, g, b)
            min_c = min(r, g, b)
            sat = (max_c - min_c) / (max_c if max_c > 0 else 1)
            lum = (r*0.299 + g*0.587 + b*0.114) / 255
            if 0.12 < lum < 0.88:
                score = count * (1.0 + sat * 2.5)
                if score > best_score:
                    best_score = score
                    best_c = f'#{r:02x}{g:02x}{b:02x}'
        if not best_c:
            top_idx = color_counts[0][1]
            r, g, b = palette[top_idx*3 : top_idx*3 + 3]
            best_c = f'#{r:02x}{g:02x}{b:02x}'
        return best_c
    except Exception as e:
        return '#619ab4'

def scan():
    results = []
    for folder in GROUPS.iterdir():
        source = folder / '作品資料.txt'
        if not folder.is_dir() or not source.exists():
            continue
        c = configparser.ConfigParser(interpolation=None)
        c.read(source, encoding='utf-8-sig')
        m = c['基本資料']
        number = int(m['組別編號'])
        def value(key): return m.get(key, '').strip()
        def image(role, required=True):
            found = [p.name for p in folder.iterdir() if p.suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp'} and p.stem.endswith('_' + role)]
            if len(found) > 1 or (required and not found):
                raise ValueError(f'{folder.name}：{role} 需要且只能有一張')
            return found[0] if found else ''
        cover = image('主視覺')
        photos = sorted(
            (p for p in folder.iterdir() if p.suffix.lower() in {'.jpg', '.jpeg', '.png'} and re.search(r'_成果展示_\d+$', p.stem)),
            key=lambda p: int(p.stem.rsplit('_', 1)[1])
        )
        if not photos:
            raise ValueError(f'{folder.name}：缺少成果展示照片')

        # 檢驗主視覺是否為佔位圖
        cover_path = folder / cover
        is_missing_cover = False
        if cover_path.exists():
            c_hash = hashlib.md5(cover_path.read_bytes()).hexdigest()
            if c_hash in hashes:
                is_missing_cover = True

        # 自動提取主視覺主色調
        dominant_color = '#3a4a58' if is_missing_cover else extract_dominant_color(cover_path)
        configured_color = value('代表色')
        theme_color = dominant_color if (not configured_color or configured_color.startswith('（')) else configured_color

        data = dict(
            id=f'g{number:02d}',
            groupNumber=number,
            title=value('作品名稱'),
            category=value('作品分類'),
            themeColor=theme_color,
            doorBgColor=dominant_color,
            hasCover=not is_missing_cover,
            summary=value('專題簡介'),
            members=[s.strip() for s in value('組員名單').split('、') if s.strip()],
            advisor=value('指導老師'),
            cover=cover,
            door=image('門卡', False) or cover,
            poster=image('海報', False) or cover,
            team=image('團隊_A', False) or image('團隊合照', False),
            teamFront=image('團隊_A', False) or image('團隊合照', False),
            teamBack=image('團隊_B', False),
            advisorPhoto=image('老師', False) or image('指導老師', False),
            sections=[dict(title=k, text=v.strip()) for k, v in c['完整說明'].items()],
            gallery=[dict(src=p.name, alt=f"{value('作品名稱')} 成果展示 {i}", caption=('' if any(w in c['圖片說明'].get(p.stem.rsplit('_', 1)[1], '') for w in ['待補','待填','待確認']) else c['圖片說明'].get(p.stem.rsplit('_', 1)[1], ''))) for i, p in enumerate(photos, 1)],
            video=dict(url=value('影片網址'), title=value('影片標題')),
            demoUrl=value('體驗網址'),
            links=[dict(label=k, url=v.strip()) for k, v in c['其他連結'].items() if v.strip()]
        )
        if any(d['groupNumber'] == number for f, d in results):
            raise ValueError(f'組號重複：{number}')
        results.append((folder, data))
    if not results:
        raise ValueError('找不到作品資料.txt')
    results.sort(key=lambda x: x[1]['groupNumber'])
    for f, d in results:
        (f / 'project.json').write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
    (ROOT / 'prototype/content/projects.json').write_text(
        json.dumps([f'groups/{f.name}/project.json' for f, d in results], ensure_ascii=False, indent=2),
        encoding='utf-8'
    )
    print(f'OK: {len(results)} groups scanned and updated.')

if __name__ == '__main__':
    scan()
