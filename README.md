# 扉｜國立聯合大學 文化創意與數位行銷學系 畢業專題成果典藏

本儲存庫為「扉｜國立聯合大學文創系 112 級畢業專題線上成果展覽」之乾淨發布版本，已移除所有未整理大體積原始圖檔、過程截圖與暫存檔案，保留最完整的展覽互動網站主體，可直接部署至 GitHub Pages 或作為正式發布版本。

---

## 🌟 特色亮點
* **沉浸式開場與主視覺**：流暢開場動畫、海浪天光微動態、全螢幕滿版展覽色調覆蓋。
* **隨機推門互動（Door Cards）**：每次載入隨機洗牌，體驗探索不同作品門扉的樂趣。
* **團隊 3D 雙照翻轉畫框（Flip Cards）**：各組成果均有正面／背面兩張去背團體照，點擊即可順暢 3D 翻轉。
* **人物身高精確對齊（Normalized Scale）**：經影像演算法標準化，無論單人、雙人或四人組，人物在畫框內視覺身高完全齊平一致。
* **漸層透明畫框底色**：頂部漸層透明通透透出背後主視覺，底部延伸為扎實代表色托住人物。
* **獨立指導老師尊榮畫框**：含 ADVISOR 燙金印鑑徽章與引言勉勵。
* **極致流量優化**：成果圖檔全面採用高品質 WebP 格式，節省 98% 以上頻寬，極速載入。

---

## 📁 目錄結構

```text
.
├── index.html                      # 根目錄入口（自動導向 prototype/ 展覽主頁）
├── start-preview.cmd               # Windows 一鍵啟動本地預覽服務
├── scan-content.py                 # 專題資料自動掃描與 project.json 生成腳本
├── convert_team_photos_normalized.py # 團隊合照標準化 WebP 轉換工具
├── .gitignore                      # 標準 Git 忽略清單
├── README.md                       # 本說明文件
└── prototype/                      # 展覽網站核心目錄
    ├── index.html                  # 專題線上展覽主要介面
    ├── app.js                      # 核心業務邏輯（門扉切換、翻轉畫框、配色計算）
    ├── experience.js               # 開場動畫與背景層疊動態
    ├── style.css                   # 基礎結構樣式
    ├── official.css                # 官方主視覺整合樣式
    ├── refinement.css              # 滿版色彩、3D 卡片、漸層畫框美化樣式
    ├── upgrade.css                 # 門扉卡牌與視覺強化樣式
    ├── assets/                     # 官方主視覺向量圖 (SVG) 與 Logo (PNG)
    ├── vendor/                     # Swiper 觸控輪播庫
    ├── templates/                  # 各組資料上傳與編排範本
    └── content/                    # 12 組展覽作品內容與 WebP 圖片
        ├── projects.json
        └── groups/                 # 各組作品圖文與團隊合照
```

---

## 🚀 本地啟動預覽

### 方法 1：Windows 一鍵啟動（推薦）
直接連點執行根目錄下的 **`start-preview.cmd`**，腳本將自動更新內容並於瀏覽器啟動 `http://127.0.0.1:4173/`。

### 方法 2：使用 Python 內建伺服器
於專案根目錄開啟終端機（Terminal）或 PowerShell，執行：
```bash
python -m http.server 5500
```
接著於瀏覽器中開啟 `http://127.0.0.1:5500/` 即可。

---

## 🌐 部署至 GitHub Pages

本專案設計為開箱即用，上傳至 GitHub 後只需以下步驟即可免費上線：

1. **建立 GitHub Repository**：
   在 GitHub 上建立一個新的 Public 或 Private Repository。
2. **推送專案**：
   ```bash
   git init
   git add .
   git commit -m "feat: initial clean release for graduation exhibition"
   git branch -M main
   git remote add origin https://github.com/<你的用戶名>/<你的儲存庫名稱>.git
   git push -u origin main
   ```
3. **開啟 GitHub Pages**：
   - 前往 GitHub 儲存庫的 **Settings** -> **Pages**。
   - **Source** 選擇 `Deploy from a branch`。
   - **Branch** 選擇 `main`，資料夾選擇 `/ (root)`，點擊 **Save**。
   - 稍候 1~2 分鐘，即可透過 GitHub 提供之網址（如 `https://<用戶名>.github.io/<儲存庫名稱>/`）瀏覽線上成果展！
