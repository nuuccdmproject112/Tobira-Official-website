const $=s=>document.querySelector(s), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=u=>{try{const x=new URL(u);return ['https:','http:'].includes(x.protocol)?x.href:''}catch{return ''}};
const link=(u,t)=>safe(u)?`<a href="${esc(safe(u))}" target="_blank" rel="noopener">${esc(t)} ↗</a>`:'';
let projects=[],current=-1,timer,autoScrolling=false,scrollFallback,activePage='home',doorSlider,syncingCarousel=false;
try{if(!sessionStorage.getItem('fei-opening')){$('#opening').classList.add('play');sessionStorage.setItem('fei-opening','1')}}catch{} 
// Shuffle once per document load; navigation keeps this exploration order.
function shuffleDoors(items){
 const shuffled=[...items];
 for(let i=shuffled.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
 }
 return shuffled;
}
async function json(path){const r=await fetch(path,{cache:'no-store'});if(!r.ok)throw Error(path);return r.json()}

function parseTitle(rawTitle) {
  const t = String(rawTitle || '').trim();
  if (t.includes('神明公關')) {
    return { main: '神明公關：誰是蹟優股', sub: '台灣信仰文化多人桌遊創作 《神使翹班去渡假，直接抓在看連載漫畫的我代班是不是搞錯了什麼》' };
  }
  if (t.includes('好野狼工作室')) {
    return { main: '好野狼工作室', sub: '《狼主角，Re.Wolf：重生之我穿越到寓言故事裡變成大野狼！》' };
  }
  if (t.includes('喝樂梅') || t.includes('在地風味的再現')) {
    return { main: '喝樂梅 CHAMÉ CHILL', sub: '在地風味的再現：喝樂梅品牌系列茶梅酒伴手禮之品牌包裝設計研究' };
  }
  if (t.includes('紫在塭內')) {
    return { main: '紫在塭內', sub: '紫斑蝶生態遊程與文創商品開發之設計行動研究' };
  }
  if (t.includes('說蜜密')) {
    return { main: '說蜜密', sub: '跟著蜜蜂走進穿龍水圳' };
  }
  if (t.includes('洗蔥聊')) {
    return { main: '洗蔥聊', sub: '地方創生中的文創IP與遊戲化行銷實踐研究' };
  }
  if (t.includes('Grip and Dive Down')) {
    return { main: 'Grip and Dive Down', sub: '以爬岩鰍為原型之仿生裝置研究初探' };
  }
  if (t.includes('人工智慧時代')) {
    return { main: 'AI 時代心理賦權與主觀幸福感', sub: '人工智慧時代心理賦權、職場風險與主觀幸福感之跨層次研究' };
  }
  if (t.includes('毛毛日和')) {
    return { main: '毛毛日和', sub: 'ももびより' };
  }
  const seps = ['：', ':', '——', '──', ' - '];
  for (const sep of seps) {
    if (t.includes(sep)) {
      const parts = t.split(sep);
      return { main: parts[0].trim(), sub: parts.slice(1).join(sep).trim() };
    }
  }
  return { main: t, sub: '' };
}


function getTeamPalette(themeColor) {
  const hex = (themeColor || '#619ab4').replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) || 97;
  const g = parseInt(hex.substring(2, 4), 16) || 154;
  const b = parseInt(hex.substring(4, 6), 16) || 180;
  const isCool = b > r;

  // 成員畫框背景：漸層透明（上半部是透明的，一路漸變到下面是實體顏色）
  // 冷色系組別：正面實體底色為夕陽赤陶橙，背面實體底色為暖陽金黃
  // 暖色系組別：正面實體底色為晴空湛藍，背面實體底色為青碧孔雀綠
  const frontRgb = isCool ? [231, 111, 81] : [58, 134, 200];
  const backRgb  = isCool ? [244, 162, 97] : [42, 157, 143];
  const advisorRgb = [27, 47, 72]; // 皇家深靛藍

  const [fr, fg, fb] = frontRgb;
  const [br, bg, bb] = backRgb;
  const [ar, ag, ab] = advisorRgb;

  return {
    frontBg: `linear-gradient(to bottom, rgba(${fr},${fg},${fb}, 0) 0%, rgba(${fr},${fg},${fb}, 0.08) 28%, rgba(${fr},${fg},${fb}, 0.45) 60%, rgba(${fr},${fg},${fb}, 0.88) 84%, rgba(${fr},${fg},${fb}, 1) 100%)`,
    backBg: `linear-gradient(to bottom, rgba(${br},${bg},${bb}, 0) 0%, rgba(${br},${bg},${bb}, 0.08) 28%, rgba(${br},${bg},${bb}, 0.45) 60%, rgba(${br},${bg},${bb}, 0.88) 84%, rgba(${br},${bg},${bb}, 1) 100%)`,
    advisorFrontBg: `linear-gradient(to bottom, rgba(${ar},${ag},${ab}, 0) 0%, rgba(${ar},${ag},${ab}, 0.15) 28%, rgba(${ar},${ag},${ab}, 0.55) 60%, rgba(${ar},${ag},${ab}, 0.92) 84%, rgba(${ar},${ag},${ab}, 1) 100%)`,
    advisorBackBg: `linear-gradient(to bottom, rgba(${ar},${ag},${ab}, 0) 0%, rgba(${ar},${ag},${ab}, 0.18) 28%, rgba(${ar},${ag},${ab}, 0.6) 60%, rgba(${ar},${ag},${ab}, 0.95) 84%, rgba(${ar},${ag},${ab}, 1) 100%)`
  };
}

function select(index, scrollCard = true) {
  if (index === current) return;
  clearTimeout(timer);
  current = index;
  const p = projects[index];
  const asset = n => esc(p.base + n);
  const color = (/^#[0-9a-f]{6}$/i.test(p.themeColor)) ? p.themeColor : '#619ab4';
  
  // 計算 RGB 數值以支援半透明背景過渡
  const r = parseInt(color.slice(1, 3), 16) || 97;
  const g = parseInt(color.slice(3, 5), 16) || 154;
  const b = parseInt(color.slice(5, 7), 16) || 180;

  // 設定全域主題標準色與門卡專屬色
  document.documentElement.style.setProperty('--accent', color);
  document.documentElement.style.setProperty('--accent-rgb', `${r}, ${g}, ${b}`);
  document.documentElement.style.setProperty('--card-bg', p.doorBgColor || color);

  // 門框計數器與作用狀態更新
  $('#counter').textContent = `${String(index + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
  document.querySelectorAll('.door').forEach((d, i) => {
    d.dataset.dist = Math.abs(i - index);
    d.classList.toggle('active', i === index);
    d.setAttribute('aria-pressed', String(i === index));
  });
  if (scrollCard && doorSlider) doorSlider.slideTo(index);

  // 智慧解析主標題與副標題
  const titleInfo = parseTitle(p.title);
  const subTitleHtml = titleInfo.sub ? `<div class="project-title-sub">${esc(titleInfo.sub)}</div>` : '';

  // 右側主視覺展示（有圖則顯示，無圖則顯示重缺預留卡）
  const visualCardHtml = p.hasCover
    ? `<div class="cover-preview-card"><img class="cover" src="${asset(p.cover)}" alt="${esc(p.title)}主視覺"></div>`
    : `<div class="cover-preview-card" style="min-height: 220px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; background: rgba(0,0,0,0.25); color: #fff;">
         <span style="font-size: 11px; letter-spacing: 2px; padding: 3px 10px; border: 1px solid rgba(255,255,255,0.4); border-radius: 12px;">${esc(p.category)}</span>
         <strong style="font-size: 22px; font-family: var(--font-serif); letter-spacing: 4px;">重缺</strong>
         <span style="font-size: 11px; opacity: 0.8;">主視覺圖片待補充</span>
       </div>`;

  // 計算團隊卡片與老師卡片專屬撞色調色盤
  const palette = getTeamPalette(p.themeColor);
  const teamFrontSrc = p.teamFront || p.team;
  const teamBackSrc = p.teamBack || p.teamFront || p.team;

  // 組合專題作品展示區 HTML
  $('#project').innerHTML = `
    <div class="project-banner-bar">
      <div class="project-meta-col">
        <span class="tag">${esc(p.category)}</span>
        <h2 class="project-title-main">${esc(titleInfo.main)}</h2>
        ${subTitleHtml}
        <p class="project-summary-box">${esc(p.summary)}</p>
      </div>
      <div class="project-visual-col">
        ${visualCardHtml}
      </div>
    </div>
    <div class="sections">
      ${p.sections.map(s => `<section><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></section>`).join('')}
    </div>
    <div class="gallery">
      ${p.gallery.map(g => `<figure><img loading="lazy" tabindex="0" role="button" src="${asset(g.src)}" alt="${esc(g.alt)}" data-caption="${esc(g.caption)}" aria-label="放大：${esc(g.alt)}">${g.caption ? `<figcaption>${esc(g.caption)}</figcaption>` : ''}</figure>`).join('')}
    </div>
    <div class="links">
      ${link(p.demoUrl, '體驗作品')}
      ${link(p.video?.url, p.video?.title || '觀看影片')}
      ${p.links.map(l => link(l.url, l.label)).join('')}
    </div>
    ${!p.video?.url ? '<p class="empty">展示影片尚未提供；正式版未提供時可隱藏此提示。</p>' : ''}
    <details>
      <summary>檢視專題海報</summary>
      <img class="cover" loading="lazy" src="${asset(p.poster)}" alt="專題海報佔位圖">
    </details>
    <div class="project-team">
      <div class="team-meta-header">
        <span class="tag">THE PEOPLE</span>
        <h3>這扇門扉的創作者</h3>
        <p class="team-members-list">${p.members.map(esc).join(' ／ ')}</p>
      </div>

      <div class="team-stage">
        <!-- 團隊 3D 翻面畫框 -->
        <div class="team-card-flipper" id="team-photo-flipper" role="button" tabindex="0" aria-label="點擊翻轉團隊合照" title="點擊翻面查看另一張照片">
          <div class="team-card-inner">
            <!-- 正面 -->
            <div class="team-card-face team-card-front" style="background: ${palette.frontBg};">
              <div class="artistic-frame-border">
                <span class="frame-corner tl"></span>
                <span class="frame-corner tr"></span>
                <span class="frame-corner bl"></span>
                <span class="frame-corner br"></span>
                <div class="frame-image-box">
                  <img src="${asset(teamFrontSrc)}" alt="${esc(p.title)} 團隊照 正面" class="cutout-img">
                </div>
                <div class="flip-hint-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
                  <span>點擊翻面</span>
                </div>
              </div>
            </div>
            <!-- 背面 -->
            <div class="team-card-face team-card-back" style="background: ${palette.backBg};">
              <div class="artistic-frame-border">
                <span class="frame-corner tl"></span>
                <span class="frame-corner tr"></span>
                <span class="frame-corner bl"></span>
                <span class="frame-corner br"></span>
                <div class="frame-image-box">
                  <img src="${asset(teamBackSrc)}" alt="${esc(p.title)} 團隊照 背面" class="cutout-img">
                </div>
                <div class="flip-hint-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
                  <span>點擊翻面</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card-caption">
            <span class="card-title">專題創作團隊</span>
            <span class="card-sub">TEAM PORTRAIT</span>
          </div>
        </div>

        <!-- 指導老師獨立占位畫框 (具備相同動態與視角) -->
        <div class="team-card-flipper advisor-card-flipper ${p.advisorPhoto ? 'has-photo' : 'is-placeholder'}" role="button" tabindex="0" aria-label="指導老師：${esc(p.advisor)}" title="指導老師畫框">
          <div class="team-card-inner">
            <!-- 正面 -->
            <div class="team-card-face advisor-card-front" style="background: ${palette.advisorFrontBg};">
              <div class="artistic-frame-border">
                <span class="frame-corner tl"></span>
                <span class="frame-corner tr"></span>
                <span class="frame-corner bl"></span>
                <span class="frame-corner br"></span>
                <div class="frame-image-box advisor-box">
                  ${p.advisorPhoto ? `
                    <img src="${asset(p.advisorPhoto)}" alt="指導老師 ${esc(p.advisor)}" class="cutout-img">
                  ` : `
                    <div class="advisor-placeholder-art">
                      <div class="advisor-seal">
                        <svg class="seal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                        <span class="seal-text">ADVISOR</span>
                      </div>
                      <div class="advisor-status">
                        <span class="advisor-role-badge">指導老師</span>
                        <h4 class="advisor-name">${esc(p.advisor)}</h4>
                        <span class="advisor-await-text">悉心指導 · 桃李春風</span>
                      </div>
                    </div>
                  `}
                </div>
                <div class="flip-hint-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
                  <span>點擊翻面</span>
                </div>
              </div>
            </div>
            <!-- 背面 -->
            <div class="team-card-face advisor-card-back" style="background: ${palette.advisorBackBg};">
              <div class="artistic-frame-border">
                <span class="frame-corner tl"></span>
                <span class="frame-corner tr"></span>
                <span class="frame-corner bl"></span>
                <span class="frame-corner br"></span>
                <div class="frame-image-box advisor-quote-box">
                  <div class="quote-content">
                    <span class="quote-mark">“</span>
                    <p class="quote-text">引領思維，啟迪創意。<br>這扇門的背後，有老師一路相伴的智慧與提點。</p>
                    <span class="quote-author">—— 指導老師 ${esc(p.advisor)}</span>
                  </div>
                </div>
                <div class="flip-hint-badge">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
                  <span>點擊翻面</span>
                </div>
              </div>
            </div>
          </div>
          <div class="card-caption">
            <span class="card-title">專題指導老師</span>
            <span class="card-sub">MENTOR & ADVISOR</span>
          </div>
        </div>
      </div>
    </div>
    <button class="next-project"><span class="next-project-bg"></span><span class="next-project-content">${index === projects.length - 1 ? '回到第一扇扉' : '繼續打開下一頁'}<span class="arrow-icon">→</span></span></button>
  `;

  // 綁定團隊卡片與老師卡片點擊翻轉事件
  $('#project').querySelectorAll('.team-card-flipper').forEach(card => {
    const doFlip = () => card.classList.toggle('is-flipped');
    card.onclick = doFlip;
    card.onkeydown = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        doFlip();
      }
    };
  });

  $('.next-project').onclick = () => {
    select((current + 1) % projects.length);
    $('#project').scrollIntoView();
  };
  if (activePage === 'portfolio') history.replaceState(null, '', `#project-${p.id}`);
}

$('#prev').onclick=()=>select((current-1+projects.length)%projects.length);$('#next').onclick=()=>select((current+1)%projects.length);
$('#doors').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();select((current+(e.key==='ArrowRight'?1:-1)+projects.length)%projects.length);$('#doors').children[current].focus({preventScroll:true})}});
$('#project').addEventListener('click',e=>{if(e.target.matches('.gallery img')){const img=$('#lightbox img');img.src=e.target.src;img.alt=e.target.alt;$('#lightbox p').textContent=e.target.dataset.caption;$('#lightbox').showModal()}});$('#project').addEventListener('keydown',e=>{if(e.target.matches('.gallery img')&&['Enter',' '].includes(e.key)){e.preventDefault();e.target.click()}});$('#close-modal').onclick=()=>$('#lightbox').close();
function route(){
 const hash=decodeURIComponent(location.hash||'#home');
 const index=projects.findIndex(p=>`#project-${p.id}`===hash);
 const page=hash.startsWith('#project-')?'portfolio':({'#portfolio':'portfolio','#team':'team','#visit':'visit'}[hash]||'home');
 const changed=activePage!==page;activePage=page;clearTimeout(timer);
 document.body.dataset.page=page;
 document.querySelectorAll('main > [data-page]').forEach(el=>el.hidden=el.id!==page);
 $('footer').hidden=page==='portfolio'||page==='home';
 document.querySelectorAll('nav a').forEach(a=>{const chosen=a.hash==='#'+page;if(chosen)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 if(page==='portfolio'&&projects.length){
   if(index>=0&&index!==current)select(index,false);
   else if(current<0)select(0,false);
   if(doorSlider){syncingCarousel=true;doorSlider.update();doorSlider.slideTo(current,0);syncingCarousel=false}
   history.replaceState(null,'',`#project-${projects[current].id}`);
 }
 if(changed){window.scrollTo({top:0,behavior:'instant'});const heading=$('#'+page+' h1, #'+page+' h2');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true})}}
}
window.addEventListener('hashchange',route);
route();
(async()=>{try{const paths=await json('content/projects.json');projects=await Promise.all(paths.map(async path=>({...await json('content/'+path),base:'content/'+path.slice(0,path.lastIndexOf('/')+1)})));if(!projects.length)throw Error('沒有作品');projects=shuffleDoors(projects);$('#doors').innerHTML=projects.map((p,i)=>{
  const bg = esc(p.doorBgColor || '#3a4a58');
  const content = p.hasCover
    ? `<img class="door-cover" loading="lazy" src="${esc(p.base + p.cover)}" alt="${esc(p.title)}主視覺">`
    : `<div class="door-missing"><span class="door-missing-tag">${esc(p.category)}</span><strong class="door-missing-badge">重缺</strong><span class="door-missing-sub">主視覺尚未提供</span></div>`;
  return `<button class="door swiper-slide" aria-pressed="false" data-index="${i}"><div class="door-frame" style="background-color:${bg};">${content}</div><small>探索順序 / ${String(i+1).padStart(2,'0')}</small><strong>${esc(p.title)}</strong></button>`;
}).join('');$('#doors').querySelectorAll('button').forEach((b,i)=>{ b.dataset.dist = Math.abs(i - (current >= 0 ? current : 0)); b.onclick=()=>select(i); });document.documentElement.dataset.carouselLibrary=typeof Swiper;if(typeof Swiper==='function'){doorSlider=new Swiper('.door-stage',{
  slidesPerView: 'auto',
  centeredSlides: true,
  spaceBetween: 28,
  slideToClickedSlide: true,
  speed: matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500,
  grabCursor: true,
  watchOverflow: true,
  keyboard: { enabled: false },
  a11y: {
    enabled: true,
    slideRole: 'button',
    slideLabelMessage: '第 {{index}} 扇門，共 {{slidesLength}} 扇'
  },
  on: {
    slideChange() {
      const idx = this.activeIndex;
      document.querySelectorAll('.door').forEach((d, i) => {
        d.dataset.dist = Math.abs(i - idx);
      });
      if (activePage === 'portfolio' && !syncingCarousel && current >= 0) {
        select(idx, false);
      }
    }
  }
})}route();$('#load-status').hidden=true;const s=await json('content/site.json');$('#department').textContent=s.department;$('#credits').textContent=s.credits;$('#faculty').innerHTML=s.faculty.map(f=>`<figure><img loading="lazy" src="${esc(f.photo)}" alt="${esc(f.name)}照片"><figcaption><h3>${esc(f.name)}</h3><p>${esc(f.role)}</p><p>${esc(f.message)}</p></figcaption></figure>`).join('');$('#committee').innerHTML=s.committee.map(c=>`<p>${esc(c.role)}｜${esc(c.members)}</p>`).join('');$('#external').innerHTML=s.links.map(l=>link(l.url,l.label)).join('');$('#venue').innerHTML=`<h3>${esc(s.exhibition.venue)}</h3><p>${esc(s.exhibition.date)}</p><p>${esc(s.exhibition.address)}</p><p>${esc(s.exhibition.transport)}</p>${link(s.exhibition.mapUrl,'開啟地圖')}`;}catch(e){$('#load-status').textContent='資料載入失敗，請以本機伺服器開啟，並檢查 JSON 清單。';console.error(e)}})();
