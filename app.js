'use strict';
const $ = s => document.querySelector(s);
const dialogs = document.querySelectorAll('dialog');
let returnFocus;
function openDialog(dialog) { returnFocus = document.activeElement; dialog.showModal(); }
dialogs.forEach(dialog => {
  dialog.querySelector('.close-dialog').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { if (dialog.id === 'video-dialog') $('#video-mount').replaceChildren(); returnFocus?.focus(); });
});
let toastTimeout;
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => $('#toast').classList.remove('visible'), 3000); }
function readStorage(key) { try { return localStorage.getItem(key); } catch { return null; } }
function writeStorage(key, value) { try { value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value); return true; } catch { toast('브라우저 저장이 제한되어 저장할 수 없어요.'); return false; } }
function updateClock() { $('#clock').textContent = new Intl.DateTimeFormat('ko-KR', { hour:'2-digit', minute:'2-digit', hour12:false }).format(new Date()); }
updateClock(); setInterval(updateClock, 30000);

function playVideo() {
  const frame = document.createElement('iframe');
  frame.src = 'https://www.youtube-nocookie.com/embed/9Y0_CVX1hok'; frame.title = '夜は仄か — Eve 공식 뮤직비디오';
  frame.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture'; frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  $('#video-mount').replaceChildren(frame); openDialog($('#video-dialog'));
}
$('#play-cover').addEventListener('click', playVideo); $('#play-track').addEventListener('click', playVideo);
function updateLike(liked) { $('#like-track').textContent = liked ? '♥' : '♡'; $('#like-track').setAttribute('aria-pressed', String(liked)); $('#like-track').setAttribute('aria-label', liked ? '즐겨찾기 해제' : '이 곡 즐겨찾기'); }
updateLike(readStorage('honoka-liked') === 'true');
$('#like-track').addEventListener('click', () => { const liked = $('#like-track').getAttribute('aria-pressed') !== 'true'; if(writeStorage('honoka-liked', String(liked))) { updateLike(liked); toast(liked ? '좋아하는 곡으로 남겨 두었어요.' : '즐겨찾기를 해제했어요.'); } });

const entries = [
  { title:'돌아가는 길을 조금 돌아서', text:'늘 지나던 골목에서 한 번쯤 다른 방향으로 걸어 보고 싶었다.\n\n비가 그친 뒤의 길은 낮보다 많은 색을 가지고 있었다. 가로등 아래 물웅덩이, 아직 꺼지지 않은 창문, 멀리서 바뀌는 신호등. 모두 잠깐 멈춰 서도 괜찮다고 말하는 것 같았다.\n\n집에 도착하는 시간은 조금 늦어졌다. 대신 오늘의 끝이 조금 길어졌다.' },
  { title:'한 곡을 오래 듣는 밤', text:'새로운 노래를 찾는 대신, 오늘은 같은 곡을 다시 틀었다.\n\n처음에는 멜로디가 들렸고, 다음에는 악기 하나가 들렸다. 몇 번째인지 모를 반복 끝에는 음악 사이의 빈 공간이 들렸다. 그 틈에 내 생각을 조용히 놓아 두었다.\n\n어떤 밤에는 더 많은 말보다, 익숙한 소리 하나가 필요하다.' },
  { title:'아무것도 아닌 작은 빛', text:'커튼 사이로 아주 작은 빛이 들어왔다. 무슨 빛인지 알아보려고 일어나지는 않았다.\n\n세상에는 이름을 붙이기 전에 좋아하게 되는 것들이 있다. 새벽 공기의 온도나, 아무도 없는 거리의 색이나, 우연히 들은 노래의 첫 소절 같은 것.\n\n오늘은 그것들을 설명하지 않고 기억하기로 했다.' }
];
document.querySelectorAll('[data-entry]').forEach(button => button.addEventListener('click', () => { const entry = entries[Number(button.dataset.entry)]; $('#entry-title').textContent = entry.title; $('#entry-text').textContent = entry.text; openDialog($('#entry-dialog')); }));
const scenes = [ ['달이 머무는 곳','구름 사이로 잠깐 드러난 빛. 골목의 끝에서 천천히 밤을 바라봅니다.'], ['잠시 멈춘 시간','붉은 신호가 켜진 동안, 아무 데도 서두르지 않는 잠깐의 여유.'], ['비가 지난 자리','젖은 길 위에 남은 불빛이, 지나간 비의 모양을 기억합니다.'] ];
document.querySelectorAll('[data-scene]').forEach(button => button.addEventListener('click', () => { const scene = scenes[Number(button.dataset.scene)]; $('#scene-title').textContent = scene[0]; $('#scene-description').textContent = scene[1]; openDialog($('#scene-dialog')); }));

function renderNote() { const value = readStorage('honoka-note') || ''; $('#saved-note').hidden = !value; $('#saved-text').textContent = value; }
function updateCount() { $('#char-count').textContent = `${$('#note-input').value.length} / 2000`; }
function editNote() { $('#note-input').value = readStorage('honoka-note') || ''; updateCount(); openDialog($('#note-dialog')); }
$('#write-note').addEventListener('click', editNote); $('#edit-note').addEventListener('click', editNote); $('#note-input').addEventListener('input', updateCount);
$('#note-form').addEventListener('submit', e => { e.preventDefault(); const value = $('#note-input').value.trim(); if (!value) { toast('남겨 둘 생각을 먼저 적어 주세요.'); $('#note-input').focus(); return; } if (writeStorage('honoka-note', value)) { renderNote(); $('#note-dialog').close(); toast('오늘 밤의 마음을 남겨 두었어요.'); } });
$('#delete-note').addEventListener('click', () => { if (writeStorage('honoka-note', null)) { renderNote(); $('#note-dialog').close(); toast('메모를 삭제했어요.'); } }); renderNote();

let audioContext, rainSource, rainGain, rainOn = false;
$('#rain-toggle').addEventListener('click', async () => {
  const toggle = $('#rain-toggle'); toggle.disabled = true;
  try {
    if (!audioContext) {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) throw new Error('unsupported');
      audioContext = new Audio();
      const size = audioContext.sampleRate * 5; const buffer = audioContext.createBuffer(2, size, audioContext.sampleRate);
      for(let channel = 0; channel < 2; channel++) { const data = buffer.getChannelData(channel); let last = 0; for(let i = 0; i < size; i++) { const white = Math.random() * 2 - 1; last = (last + .03 * white) / 1.03; data[i] = last * 4; } }
      rainSource = audioContext.createBufferSource(); rainSource.buffer = buffer; rainSource.loop = true;
      const filter = audioContext.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 1800;
      rainGain = audioContext.createGain(); rainGain.gain.value = 0;
      rainSource.connect(filter); filter.connect(rainGain); rainGain.connect(audioContext.destination); rainSource.start();
    }
    await audioContext.resume(); rainOn = !rainOn;
    rainGain.gain.cancelScheduledValues(audioContext.currentTime); rainGain.gain.setTargetAtTime(rainOn ? .32 : 0, audioContext.currentTime, .25);
    toggle.setAttribute('aria-pressed', String(rainOn)); $('#rain-label').textContent = rainOn ? '빗소리 ON' : '빗소리 OFF';
    toast(rainOn ? '잔잔한 빗소리를 켰어요.' : '빗소리를 껐어요.');
  } catch { toast('이 브라우저에서는 빗소리를 재생할 수 없어요.'); }
  finally { toggle.disabled = false; }
});
