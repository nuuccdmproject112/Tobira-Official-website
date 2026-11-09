# 《扉》本機測試版

所有組別、色彩、姓名與圖片皆為佔位示意。正式展期與系名尚待確認。

## 開啟
在本資料夾執行：`python -m http.server 4173 --bind 127.0.0.1`
瀏覽 http://127.0.0.1:4173 ，不要直接雙擊 index.html（瀏覽器會阻擋 JSON 載入）。

## 資料夾
```
prototype/
  index.html             固定頁面骨架
  style.css              視覺與響應式排版
  app.js                 滑動、資料載入、圖片放大
  content/
    projects.json        組別清單，陣列順序即展示順序
    site.json            教授、團隊、展場、交通、外部連結
    shared/
      hero.jpg           首頁主視覺預留（目前開場使用 CSS 示意動畫）
      exhibition-poster.jpg
      venue-map.jpg
      committee.jpg
      faculty-01.jpg
    groups/
      g01-demo/
        project.json
        g01-demo_cover.jpg
        g01-demo_door.jpg
        g01-demo_poster.jpg
        g01-demo_team.jpg
        g01-demo_gallery-01.jpg ～ g01-demo_gallery-07.jpg
  templates/group-template/  可複製的一整組範本
```

## 新增組別
1. 複製 templates/group-template 至 content/groups/g04-your-project。
2. 修改 project.json：id 改 g04-your-project、groupNumber 改 4，填名稱、分類、代表色（#RRGGBB）、簡介、組員、老師及五段完整說明。
3. 圖片更換後，將檔名統一改為新組別前綴，並同步修改 JSON 的 cover、door、poster、team 與 gallery[].src。圖片路徑相對於該組資料夾。
4. 在 content/projects.json 陣列最後加上 "groups/g04-your-project/project.json"，注意 JSON 逗號及引號。刷新即可，不需改 HTML/JS。
5. 檢查所有圖片與網址；正式上線前移除所有示意內容。可分享網址如 /#project-g04-your-project。

可選連結沒有就填空字串；links 沒有就填 []，有資料時使用 [{"label":"專題社群","url":"https://example.com"}]。影片填 video.url 與 video.title，目前採外連播放。gallery 每張填 src、alt（可理解的圖片描述）、caption。照片數量依 gallery 陣列決定，不限制只能七張。缺少欄位容易造成載入失敗，建議由範本修改，不要刪必要欄位。

## 圖片檔名規範
網站內使用半形小寫英文、數字及連字號，避免空白、中文、括號和「最終版2」。格式：g組別兩位數-專題英文短名_用途-序號.jpg（或 .png）。

| 用途 | 範例 | 建議尺寸 | 數量 |
|---|---|---|---|
| 橫式封面 | g04-example_cover.jpg | 1600×900 | 1 |
| 直式門卡 | g04-example_door.jpg | 900×1500 | 1 |
| 原始海報 | g04-example_poster.jpg | 長邊至少 1700px，保留原比例 | 1／有則提供 |
| 團隊合照 | g04-example_team.jpg | 1600×1000，可保留原比例 | 1 |
| 成果照片 | g04-example_gallery-01.jpg | 長邊至少 1600px，保留原比例 | 5～7 |
| 教授照片 | faculty-01.jpg | 800×1000 | 每位 1 |
| 策展團隊合照 | committee.jpg | 1600×1000 | 1 |
| 首頁主視覺 | hero.jpg | 1800×1200（暫定） | 1 |
| 展場文宣 | exhibition-poster.jpg | 原海報比例 | 1 |
| 導覽圖 | venue-map.jpg | 長邊至少 1600px | 1 |

每張 JPG／PNG 不超過 10MB；網站實際使用時再壓縮。手機 393px 的 3 倍素材寬是 1179px，不代表所有圖片必須同一尺寸。完整海報與門卡分開，避免文字遭直式裁切。若表單仍收中文檔名，可由承辦整理後轉成上述網站用名稱。

## 已實作與測試範圍
2 秒 sessionStorage 開場、減少動態偏好、左右滑動／箭頭／鍵盤選組、局部色調、圖文同步、圖片放大（Esc 關閉）、作品底部下一組、手機版、作品網址 hash、共用教授／籌備／展場與歷屆外連。
目前為 CSS 開場示意，並非正式 VI 倒帶動畫。hero.jpg 是替換素材預留，不是動畫原檔。尚未提供的影片／Demo 不會產生無效連結。兩個歷屆網站因執行環境 DNS 無法解析，尚未核對其實際資料結構。

## 本機實測（2026-10-28）
已在本機啟動 http://127.0.0.1:4173/ 並完成桌面瀏覽器測試：JSON 載入、切換作品、底部下一組、鍵盤左右切換、圖片放大及 Esc 關閉、重新整理保留作品。已修正程式捲動與選組同步互相干擾的問題。

下次可雙擊專案根目錄的 start-preview.cmd 啟動；保持視窗開啟，按 Ctrl+C 停止。若 4173 已有預覽服務，直接開啟網址即可。服務僅限本機存取。手機實機、觸控滑動及正式素材尚未驗收。

## 最新操作方式
組別素材與文案已全面改用中文管理，請以「素材命名與讀取規格.md」為準。範本位置改為 templates/組別範本_複製後改名；請編輯作品資料.txt，不要編輯工具產出的 project.json。早期英文檔名與手寫 JSON 說明僅為舊版紀錄。
