const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
const opening=document.querySelector('#opening');
const homeScene=document.querySelector('#home');
const replayButton=document.querySelector('.replay-opening');
let openingTimer;
function replayOpening(){
 clearTimeout(openingTimer);
 homeScene.classList.remove('intro-running');
 void homeScene.offsetWidth;
 homeScene.classList.add('intro-running');
 replayButton.textContent='↺ 重新播放';
 openingTimer=setTimeout(()=>{homeScene.classList.remove('intro-running');replayButton.textContent='↺ 重播開場'},3600);
}
replayButton.addEventListener('click',replayOpening);
const shouldAutoPlay=opening.classList.contains('play')&&!reducedMotion.matches&&!homeScene.hidden;
opening.classList.remove('play','demo-play');
if(shouldAutoPlay)replayOpening();
window.addEventListener('hashchange',()=>{if(homeScene.hidden){clearTimeout(openingTimer);homeScene.classList.remove('intro-running');replayButton.textContent='↺ 重播開場'}});
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');observer.unobserve(e.target)}}),{threshold:.08});
function observeArt(){document.querySelectorAll('.gallery figure,.sections section,.project-team,#faculty figure,.visit-grid>*,#project>.cover').forEach(el=>{if(el.dataset.observed)return;el.dataset.observed='true';el.classList.add('reveal');observer.observe(el)})}
new MutationObserver(observeArt).observe(document.querySelector('main'),{childList:true,subtree:true});observeArt();
// Never leave content invisible when a reveal observer or asset fails.
document.addEventListener('error',event=>{
 const img=event.target;if(!(img instanceof HTMLImageElement)||img.classList.contains('image-error'))return;
 img.classList.add('image-error');const note=document.createElement('span');note.className='image-error-note';note.textContent='圖片暫時無法載入，請確認素材檔案。';img.after(note);
},true);
