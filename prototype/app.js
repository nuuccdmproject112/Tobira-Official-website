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
    : '';

  const teamFrontSrc = p.teamFront || p.team;
  const teamBackSrc = p.teamBack || p.teamFront || p.team;

  // 組合專題作品展示區 HTML
  $('#project').innerHTML = `
    <div class="project-banner-bar${visualCardHtml ? '' : ' without-visual'}">
      <div class="project-meta-col">
        <span class="tag">${esc(p.category)}</span>
        <h2 class="project-title-main">${esc(titleInfo.main)}</h2>
        ${subTitleHtml}
        <p class="project-summary-box">${esc(p.summary)}</p>
      </div>
      ${visualCardHtml ? `<div class="project-visual-col">${visualCardHtml}</div>` : ''}
    </div>
    <div class="sections" ${p.sections.length ? '' : 'hidden'}>
      ${p.sections.map(s => `<section><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></section>`).join('')}
    </div>
    <div class="gallery" ${p.gallery.length ? '' : 'hidden'}>
      ${p.gallery.map(g => `<figure><img loading="lazy" src="${asset(g.src)}" alt="${esc(g.alt)}" data-caption="${esc(g.caption)}">${g.caption ? `<figcaption>${esc(g.caption)}</figcaption>` : ''}</figure>`).join('')}
    </div>
    <div class="links">
      ${link(p.demoUrl, '體驗作品')}
      ${link(p.video?.url, p.video?.title || '觀看影片')}
      ${p.links.map(l => link(l.url, l.label)).join('')}
    </div>
    ${!p.video?.url ? '<p class="empty">展示影片待補。</p>' : ''}
    ${p.poster ? `<details>
      <summary>檢視專題海報</summary>
      <img class="cover" loading="lazy" src="${asset(p.poster)}" alt="${esc(p.title)} 專題海報">
    </details>` : ''}
    <div class="project-team">
      <div class="team-meta-header">
        <span class="tag">THE PEOPLE</span>
        <h3>這扇門扉的創作者</h3>
        <p class="team-members-list">${p.members.map(esc).join(' ／ ')}</p>
      </div>

      <div class="team-stage">
        <!-- 團隊 3D 翻面畫框 -->
        ${teamFrontSrc ? `<div class="team-card-flipper" id="team-photo-flipper" role="button" tabindex="0" aria-label="點擊翻轉團隊合照" title="點擊翻面查看另一張照片">
          <div class="team-card-inner">
            <!-- 正面 -->
            <div class="team-card-face team-card-front">
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
            <div class="team-card-face team-card-back" inert>
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

        ` : '<p class="empty">團隊合照待補。</p>'}

        <!-- 指導老師獨立占位畫框 (具備相同動態與視角) -->
        <div class="team-card-flipper advisor-card-flipper ${p.advisorPhoto ? 'has-photo' : 'is-placeholder'}" role="button" tabindex="0" aria-label="指導老師：${esc(p.advisor)}" title="指導老師畫框">
          <div class="team-card-inner">
            <!-- 正面 -->
            <div class="team-card-face advisor-card-front">
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
            <div class="team-card-face advisor-card-back" inert>
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

  enableImageViewing($('#project'));

  // 綁定團隊卡片與老師卡片點擊翻轉事件
  $('#project').querySelectorAll('.team-card-flipper').forEach(card => {
    const doFlip = () => {
      const flipped = card.classList.toggle('is-flipped');
      const [front, back] = card.querySelectorAll('.team-card-face');
      front.inert = flipped;
      back.inert = !flipped;
    };
    card.onclick = doFlip;
    card.onkeydown = (e) => {
      if (e.target === card && (e.key === 'Enter' || e.key === ' ')) {
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
const lightbox = $('#lightbox');
const lightboxView = lightbox.querySelector('.lightbox-view');
const lightboxButton = lightbox.querySelector('.lightbox-image');
const lightboxImage = lightboxButton.querySelector('img');
const lightboxCaption = lightbox.querySelector('p');

function enableImageViewing(scope) {
  scope.querySelectorAll('img').forEach(img => {
    if (img.closest('a, button, #lightbox, [aria-hidden="true"]')) return;
    img.dataset.viewImage = '';
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    const label = img.alt || img.closest('figure')?.querySelector('figcaption strong')?.textContent || '照片';
    img.setAttribute('aria-label', `檢視${label}`);
  });
}

function openImage(img, trigger) {
  if (!img?.naturalWidth || lightbox.open) return;
  lightboxImage.src = img.currentSrc || img.src;
  lightboxImage.alt = img.alt;
  lightboxCaption.textContent = img.dataset.caption || '';
  lightboxCaption.hidden = !lightboxCaption.textContent;
  lightbox.showModal();
  lightbox.addEventListener('close', () => {
    setImageZoom(false);
    lightboxImage.removeAttribute('src');
    if (trigger.isConnected) trigger.focus({preventScroll:true});
  }, {once:true});
}

function setImageZoom(zoom, event) {
  if (zoom && !lightboxImage.naturalWidth) return;
  const rect = lightboxImage.getBoundingClientRect();
  const x = event?.detail ? (event.clientX - rect.left) / rect.width : .5;
  const y = event?.detail ? (event.clientY - rect.top) / rect.height : .5;
  if (zoom) lightboxButton.style.setProperty('--zoom-width', `${rect.width * 2.5}px`);
  lightbox.classList.toggle('is-zoomed', zoom);
  lightboxButton.setAttribute('aria-pressed', String(zoom));
  lightboxButton.setAttribute('aria-label', zoom ? '縮回完整圖片' : '放大圖片');
  lightboxView.scrollTo({
    left: zoom ? lightboxImage.offsetWidth * x - lightboxView.clientWidth / 2 : 0,
    top: zoom ? lightboxImage.offsetHeight * y - lightboxView.clientHeight / 2 : 0,
    behavior: 'instant'
  });
}

document.addEventListener('click', event => {
  const img = event.target.closest('img[data-view-image]');
  if (!img) return;
  event.stopPropagation();
  openImage(img, img);
}, true);
document.addEventListener('keydown', event => {
  if (!event.target.matches('img[data-view-image]') || !['Enter',' '].includes(event.key)) return;
  event.preventDefault();
  openImage(event.target, event.target);
});
lightboxButton.onclick = event => setImageZoom(!lightbox.classList.contains('is-zoomed'), event);
lightbox.addEventListener('keydown', event => {
  if (!['+','=','-'].includes(event.key) || (event.key !== '-' && lightbox.classList.contains('is-zoomed'))) return;
  event.preventDefault();
  setImageZoom(event.key !== '-');
});
lightboxView.onclick = event => { if (event.target === lightboxView) lightbox.close(); };
$('#close-modal').onclick = () => lightbox.close();
enableImageViewing(document.querySelector('main'));
enableImageViewing(document.querySelector('footer'));

const staffDialog = $('#staff-profile');

function renderCommittee(members, duties) {
  const roster = $('#committee');
  roster.innerHTML = members.map((member, index) => `
    <li class="committee-card">
      <button class="committee-frame" type="button" data-member="${index}" aria-haspopup="dialog">
        <span class="committee-portrait">
          ${member.photo
            ? `<img src="${esc(member.photo)}" alt="" width="480" height="600" loading="lazy">`
            : '<span>照片待補</span>'}
        </span>
        <span class="committee-label"><strong>${esc(member.name)}</strong><span>${esc(member.role)}</span></span>
      </button>
    </li>
  `).join('');

  roster.onclick = event => {
    const trigger = event.target.closest('button[data-member]');
    if (!trigger || staffDialog.open) return;
    const member = members[Number(trigger.dataset.member)];
    const portrait = staffDialog.querySelector('img');
    portrait.hidden = !member.photo;
    if (member.photo) portrait.src = member.photo;
    else portrait.removeAttribute('src');
    staffDialog.classList.toggle('has-portrait', Boolean(member.photo));
    staffDialog.querySelector('#staff-name').textContent = member.name;
    staffDialog.querySelector('.staff-role').textContent = member.role;
    staffDialog.querySelector('.staff-duty').textContent = duties[member.role] || '';
    staffDialog.showModal();
    staffDialog.addEventListener('close', () => trigger.focus({preventScroll:true}), {once:true});
  };
}

staffDialog.addEventListener('click', event => {
  if (event.target === staffDialog) staffDialog.close();
});

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
})}route();$('#load-status').hidden=true;const s=await json('content/site.json');$('#department').textContent=s.department;$('#credits').textContent=s.credits;const faculty = s.faculty.filter(person => !person.name.endsWith('待確認'));
$('#faculty-area').hidden = !faculty.length;
$('#faculty').innerHTML = faculty.map(f => `<figure>${f.photo ? `<img loading="lazy" src="${esc(f.photo)}" alt="${esc(f.name)}照片">` : ''}<figcaption><h3>${esc(f.name)}</h3><p>${esc(f.role)}</p><p>${esc(f.message)}</p></figcaption></figure>`).join('');
renderCommittee(s.committee, s.committeeDuties);
$('#external').innerHTML=s.links.map(l=>link(l.url,l.label)).join('');$('#venue').innerHTML=`<h3>${esc(s.exhibition.venue)}</h3><p>${esc(s.exhibition.date)}</p><p>${esc(s.exhibition.address)}</p><p>${esc(s.exhibition.transport)}</p>${link(s.exhibition.mapUrl,'開啟地圖')}`;enableImageViewing($('#team'));}catch(e){$('#load-status').textContent='資料載入失敗，請以本機伺服器開啟，並檢查 JSON 清單。';console.error(e)}})();
