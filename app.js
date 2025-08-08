// v6.1 mobile-optimized, embedded music, i18n modal

const I18N = {
  az: {
    app_title: 'Mini Oyunlar • Azeri Casino Stili',
    back: 'Geri',
    coins_label: 'Sikkələr',
    plays: 'Cəhdlər:',
    pick_game: 'Oyun seçin',
    slots: 'Slot maşını', dice: 'Zər atma', cards: 'Kart aç',
    slots_desc: '3×3, WILD, xətt', dice_desc: '3D kub', cards_desc: 'Flip animasiya',
    spin: 'Fırlat', roll: 'At', choose_higher: 'Yuxarı gələcək', choose_lower: 'Aşağı gələcək',
    bet_place: 'Bahis qoy: 5', you_won: 'Uduş!', you_lost: 'Uduzdu',
    no_coins: 'Sikkələr kifayət deyil', rolled: 'Zər nəticəsi', pick_a_card: 'Kart seçin',
    card_prize: 'Mükafat', swap_bg: 'Fon dəyiş',
    ad_title_big: 'Təbrik edirik!', ad_copy_center: 'Sizi burada gözləyirik — Dicebet.', ad_go_center: 'Buraya keç', ad_close: 'Bağla'
  },
  ru: {
    app_title: 'Мини‑игры • Азербайджанский стиль',
    back: 'Назад',
    coins_label: 'Монеты',
    plays: 'Попытки:',
    pick_game: 'Выберите игру',
    slots: 'Слот‑машина', dice: 'Кости', cards: 'Выбор карты',
    slots_desc: '3×3, WILD, линия', dice_desc: '3D куб', cards_desc: 'Flip‑анимация',
    spin: 'Крутить', roll: 'Бросить', choose_higher: 'Выпадет выше', choose_lower: 'Выпадет ниже',
    bet_place: 'Ставка: 5', you_won: 'Выигрыш!', you_lost: 'Проигрыш',
    no_coins: 'Недостаточно монет', rolled: 'Результат броска', pick_a_card: 'Выберите карту',
    card_prize: 'Приз', swap_bg: 'Сменить фон',
    ad_title_big: 'Поздравляем!', ad_copy_center: 'Ждём вас здесь — Dicebet.', ad_go_center: 'Перейти', ad_close: 'Закрыть'
  }
};

const ICONS = ['\u{1F352}','\u2615\uFE0F','\u{1F33F}','\u{1F369}','\u2B50'];
const WILD = '\u2B50';

let state = {
  lang: localStorage.getItem('lang') || 'az',
  coins: Number(localStorage.getItem('coins') || 100),
  screen: 'menu',
  plays: 0,
  adShown: false,
  muted: localStorage.getItem('muted') === '1'
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function save(){ localStorage.setItem('lang', state.lang);
  localStorage.setItem('coins', String(state.coins));
  localStorage.setItem('muted', state.muted ? '1':'0');
}

function t(key){ return I18N[state.lang][key] || key; }
function fmt(){
  $$('#app [data-i18n]').forEach(n => n.textContent = t(n.dataset.i18n));
  // modal i18n too:
  $$('#adModal [data-i18n]').forEach(n => n.textContent = t(n.dataset.i18n));

  $('#appTitle').textContent = t('app_title');
  $('#coins').textContent = state.coins;
  $('#playsCounter').textContent = state.plays + '/3';
  $('#backBtn').hidden = (state.screen === 'menu');
  document.documentElement.lang = state.lang;
  $('#muteBtn').textContent = state.muted ? '🔈' : '🔊';
}

function goto(screen){
  state.screen = screen;
  $$('.screen').forEach(s => s.classList.add('hidden'));
  $('#screen' + cap(screen)).classList.remove('hidden');
  const ids = ['bg1','bg2','bg3'];
  const next = ids[Math.floor(Math.random()*ids.length)];
  ids.forEach(id => $('#'+id).classList.add('hidden'));
  $('#'+next).classList.remove('hidden');
  fmt(); save();
}
function cap(s){ return s.charAt(0).toUpperCase() + s.slice(1); }

function onPlayed(){
  state.plays += 1; fmt();
  if (!state.adShown && state.plays >= 3) {
    state.adShown = true;
    const m = $('#adModal'); m.classList.remove('hidden'); m.style.display='grid';
  }
}

function addCoins(n){ state.coins += n; fmt(); save(); }
function spendCoins(n){
  if (state.coins < n) { alert(t('no_coins')); return false; }
  state.coins -= n; fmt(); save(); return true;
}

// Language
$('#langAZ').onclick = ()=>{ state.lang='az'; fmt(); save(); };
$('#langRU').onclick = ()=>{ state.lang='ru'; fmt(); save(); };

// Music embedded
const bgm = $('#bgm');
bgm.muted = state.muted;
const tryPlay = ()=>{ if (!state.muted) bgm.play().catch(()=>{}); };
window.addEventListener('click', tryPlay, { once: true });
$('#muteBtn').onclick = ()=>{
  state.muted = !state.muted; bgm.muted = state.muted; fmt(); save();
  if (!state.muted) tryPlay();
};

// Telegram hook
try { if (window.Telegram && Telegram.WebApp){ Telegram.WebApp.ready(); Telegram.WebApp.expand(); } } catch(e){}

// Nav
$('#backBtn').onclick = ()=> goto('menu');
$$('.gamecard').forEach(el => el.onclick = () => goto(el.dataset.next));

// Auto rotate bg
setInterval(()=>{
  const ids = ['bg1','bg2','bg3'];
  const visible = ids.find(id=> !$('#'+id).classList.contains('hidden'));
  let next;
  do { next = ids[Math.floor(Math.random()*ids.length)]; } while(next===visible);
  $('#'+visible).classList.add('hidden');
  $('#'+next).classList.remove('hidden');
}, 25000);

// Slots
function rollSymbol(){
  const pool = ICONS.slice();
  if (Math.random() < 0.6) pool.splice(pool.indexOf(WILD),1);
  return pool[Math.floor(Math.random()*pool.length)];
}
$('#spinBtn').onclick = async () => {
  if (!spendCoins(5)) return;
  const cells = [...Array(9).keys()].map(i=>$('#cell'+i));
  cells.forEach(c=>c.classList.remove('win'));
  for(let f=0; f<14; f++){
    for(const c of cells){ c.textContent = rollSymbol(); }
    await wait(45);
  }
  const grid = cells.map(()=>rollSymbol());
  grid.forEach((v,i)=> cells[i].textContent = v);

  const lines = [[0,1,2],[3,4,5],[6,7,8]];
  let won = 0;
  for(const L of lines){
    const [a,b,c]=L.map(i=>grid[i]);
    const base = (a===WILD?b:a) || a;
    const match = [a,b,c].every(s=> s===base || s===WILD);
    if(match){ won += (base===WILD?20:12); L.forEach(i => cells[i].classList.add('win')); }
  }
  const msg = $('#slotsMsg');
  if(won>0){ addCoins(won); msg.textContent = t('you_won') + ` +${won}`; }
  else { msg.textContent = t('you_lost'); }
  onPlayed();
};
$('#swapBgBtn').onclick = ()=>{
  const ids=['bg1','bg2','bg3']; const visible = ids.find(id=> !$('#'+id).classList.contains('hidden'));
  const next = ids[(ids.indexOf(visible)+1)%ids.length];
  $('#'+visible).classList.add('hidden'); $('#'+next).classList.remove('hidden');
};

// Dice
let dicePick = 'higher';
$('#pickHigher').onclick = ()=>{ dicePick='higher'; $('#pickHigher').dataset.selected=true; $('#pickLower').dataset.selected=false; };
$('#pickLower').onclick = ()=>{ dicePick='lower'; $('#pickLower').dataset.selected=true; $('#pickHigher').dataset.selected=false; };
const cube = $('#diceCube');
function orientFor(n){
  switch(n){
    case 1: return 'rotateY(0deg) rotateX(0deg)';
    case 2: return 'rotateY(-90deg)';
    case 3: return 'rotateY(180deg)';
    case 4: return 'rotateY(90deg)';
    case 5: return 'rotateX(-90deg)';
    case 6: return 'rotateX(90deg)';
  }
}
$('#rollBtn').onclick = () => {
  if (!spendCoins(5)) return;
  const r = 1 + Math.floor(Math.random()*6);
  cube.style.transform = `rotateX(${360*2 + (Math.random()*45)}deg) rotateY(${360*3 + (Math.random()*45)}deg)`;
  setTimeout(()=>{
    cube.style.transform = orientFor(r);
    const success = (dicePick==='higher' && r>=4) || (dicePick==='lower' && r<=3);
    $('#diceResult').textContent = `${t('rolled')}: ${r} • ${success?t('you_won'):t('you_lost')}`;
    if (success) { addCoins(10); }
    onPlayed();
  }, 700);
};

// Cards
let prizes = shuffle([0,0,10]);
let chosen = false;
$$('.flip').forEach(card => card.addEventListener('click', ()=>{
  if (chosen) return;
  if (!spendCoins(5)) return;
  const idx = Number(card.dataset.idx);
  const prize = prizes[idx];
  chosen = true;
  card.classList.add('active');
  setTimeout(()=>{
    $('#cardsMsg').textContent = prize>0 ? `${t('card_prize')}: +${prize}` : t('you_lost');
    if (prize>0) { addCoins(prize); }
    setTimeout(()=>{
      prizes = shuffle([0,0,10]); chosen=false;
      $$('.flip').forEach(c=>c.classList.remove('active'));
      $('#cardsMsg').textContent = '';
    }, 900);
    onPlayed();
  }, 450);
}));

// Modal close
function hideAd(){ const m=$('#adModal'); if(m){ m.classList.add('hidden'); m.style.display='none'; } }
$('#closeAd').onclick = hideAd;
$('#adBackdrop').onclick = hideAd;
window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') hideAd(); });

// Helpers
function wait(ms){ return new Promise(res=>setTimeout(res, ms)); }
function shuffle(a){ a=[...a]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }

// Init
try { if (Telegram && Telegram.WebApp) { Telegram.WebApp.ready(); Telegram.WebApp.expand(); } } catch(e){}
const _ad = $('#adModal'); if (_ad){ _ad.classList.add('hidden'); _ad.style.display='none'; }
fmt(); goto('menu');
