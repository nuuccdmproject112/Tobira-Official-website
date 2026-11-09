import os
from pathlib import Path
from PIL import Image

SRC_DIR = Path(r'd:\聯合大學\專籌會網站\專題團體貼文照')
GROUPS_DIR = Path(r'd:\聯合大學\專籌會網站\prototype\content\groups')

MAPPING = {
    '洗蔥聊': (
        '楊濬瑜、楊子瑩、林和昇、王文惠.png',
        '楊濬瑜、楊子瑩、林和昇、王文惠 (2).png'
    ),
    '好野狼工作室_狼主角Re.Wolf': (
        '高甯麗、葉品均、顏冠昕、王禹蘋.png',
        '高甯麗、葉品均、顏冠昕、王禹蘋 (2).png'
    ),
    '鯨魚鯨魚！帶我到夢裡': (
        '劉予晴、張詠婷、楊楚賢.png',
        '劉予晴、張詠婷、楊楚賢 (2).png'
    ),
    '神明公關_誰是蹟優股': (
        '雷翔凱、葉峻楷、莊靜嫺、李承祐.png',
        '雷翔凱、葉峻楷、莊靜嫺、李承祐 (2).png'
    ),
    '紫在塭內': (
        '吳姵璇、王宜心、王翊丞、李建富.png',
        '吳姵璇、王宜心、王翊丞、李建富 (2).png'
    ),
    '喝樂梅_CHAMÉ_CHILL': (
        '王引新、林珊如、黃崇斌、劉憶儒.png',
        '王引新、林珊如、黃崇斌、劉憶儒 (2).png'
    ),
    '巷口的第五頁': (
        '黃奕淇、莊婕妤、朱庭儀.png',
        '黃奕淇、莊婕妤、朱庭儀 (2).png'
    ),
    '毛毛日和': (
        '穆孜齊、鄭宇峻、張景雅、郎郁婷.png',
        '穆孜齊、鄭宇峻、張景雅、郎郁婷 (2).png'
    ),
    '異鄉一味': (
        'IMG_8594.jpg - 已編輯.png',
        'IMG_8596.jpg - 已編輯.png'
    ),
    '說蜜密': (
        '郭亭岑、陳姿吟、鍾明傑、鄭聿晨.png',
        '郭亭岑、陳姿吟、鍾明傑、鄭聿晨 (2).png'
    ),
    'Grip_and_Dive_Down': (
        '江偉宸.png',
        '江偉宸 (2).png'
    ),
    'AI時代心理賦權研究': (
        '劉佳玲.png',
        '劉佳玲 (2).png'
    ),
}

# 目標基準人物身高（所有組別的人物身高完全一致！）
TARGET_PERSON_HEIGHT = 920
CANVAS_HEIGHT = 1000
TOP_MARGIN = 70
BOTTOM_MARGIN = 10

def process_image_normalized(src_path, dst_path):
    print(f'Normalizing {src_path.name} -> {dst_path.name}...')
    with Image.open(src_path) as im:
        if im.mode != 'RGBA':
            im = im.convert('RGBA')
        
        # 1. 取得人物實體 bounding box（去除四周透明區域）
        bbox = im.getbbox()
        if not bbox:
            print(f'Warning: Empty image {src_path}')
            return
            
        cropped = im.crop(bbox)
        cw, ch = cropped.size
        
        # 2. 以人物身高 ch 等比例縮放至 TARGET_PERSON_HEIGHT
        scale = TARGET_PERSON_HEIGHT / ch
        new_w = max(1, int(round(cw * scale)))
        new_h = TARGET_PERSON_HEIGHT
        
        resized = cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # 3. 建立標準化畫布：總高度 CANVAS_HEIGHT，寬度為 new_w（左右微墊 20px 緩衝）
        canvas_w = new_w + 40
        canvas = Image.new('RGBA', (canvas_w, CANVAS_HEIGHT), (0, 0, 0, 0))
        
        # 貼上人物：人物貼在畫布下方 (CANVAS_HEIGHT - BOTTOM_MARGIN - new_h)
        paste_x = 20
        paste_y = CANVAS_HEIGHT - BOTTOM_MARGIN - new_h
        canvas.paste(resized, (paste_x, paste_y), resized)
        
        # 4. 存成 WebP
        dst_path.parent.mkdir(parents=True, exist_ok=True)
        canvas.save(dst_path, format='WEBP', quality=88, method=6)
        new_kb = dst_path.stat().st_size / 1024
        print(f'  Done: canvas {canvas.size}, person height={TARGET_PERSON_HEIGHT}px, size={new_kb:.1f} KB')

def main():
    count = 0
    for folder_name, (front_f, back_f) in MAPPING.items():
        folder_dir = GROUPS_DIR / folder_name
        front_dst = folder_dir / f'{folder_name}_團隊_A.webp'
        back_dst = folder_dir / f'{folder_name}_團隊_B.webp'
        
        src_front = SRC_DIR / front_f
        src_back = SRC_DIR / back_f
        
        if src_front.exists():
            process_image_normalized(src_front, front_dst)
            count += 1
        if src_back.exists():
            process_image_normalized(src_back, back_dst)
            count += 1
            
    print(f'\nFinished normalizing {count} images with unified scale!')

if __name__ == '__main__':
    main()

