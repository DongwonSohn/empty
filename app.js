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
function writeStorage(key, value) { try { value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value); return true; } catch { toast('Your browser is blocking local storage. Your changes could not be saved.'); return false; } }
function updateClock() { $('#clock').textContent = new Intl.DateTimeFormat('en-US', { hour:'2-digit', minute:'2-digit', hour12:false }).format(new Date()); }
updateClock(); setInterval(updateClock, 30000);

function playVideo() {
  const frame = document.createElement('iframe');
  frame.src = 'https://www.youtube-nocookie.com/embed/9Y0_CVX1hok'; frame.title = '夜は仄か — Eve official music video';
  frame.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture'; frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  $('#video-mount').replaceChildren(frame); openDialog($('#video-dialog'));
}
$('#play-cover').addEventListener('click', playVideo); $('#play-track').addEventListener('click', playVideo);
function updateLike(liked) { $('#like-track').textContent = liked ? '♥' : '♡'; $('#like-track').setAttribute('aria-pressed', String(liked)); $('#like-track').setAttribute('aria-label', liked ? 'Remove from favorites' : 'Save this song'); }
updateLike(readStorage('honoka-liked') === 'true');
$('#like-track').addEventListener('click', () => { const liked = $('#like-track').getAttribute('aria-pressed') !== 'true'; if(writeStorage('honoka-liked', String(liked))) { updateLike(liked); toast(liked ? 'This song is now in your favorites.' : 'Removed from your favorites.'); } });

const entries = [
  { title:'The longer way home', text:'For once, I wanted to turn down a different street instead of taking the familiar way home.\n\nAfter the rain, the road held more colors than it did in daylight. Puddles beneath the streetlights, windows still glowing, a traffic signal changing in the distance. They all seemed to say it was all right to pause for a while.\n\nI arrived home a little later. In return, the end of the day lasted a little longer.' },
  { title:'One song, all night', text:'Instead of looking for something new, I played the same song again tonight.\n\nFirst I heard the melody, then a single instrument. After more repeats than I could count, I began to hear the quiet spaces between the notes. I left my thoughts there, gently.\n\nSome nights call for one familiar sound rather than more words.' },
  { title:'A small, unnamed light', text:'A sliver of light slipped through the curtains. I did not get up to find out where it came from.\n\nThere are things we come to love before we give them names: the temperature of the air before dawn, the color of an empty street, the opening line of a song heard by chance.\n\nTonight, I decided to remember them without trying to explain them.' }
];
document.querySelectorAll('[data-entry]').forEach(button => button.addEventListener('click', () => { const entry = entries[Number(button.dataset.entry)]; $('#entry-title').textContent = entry.title; $('#entry-text').textContent = entry.text; openDialog($('#entry-dialog')); }));
const scenes = [ ['Where the moon lingers','A light appears briefly between the clouds. At the end of the lane, there is time to take in the night.'], ['A moment on pause','While the signal glows red, a small moment opens up with nowhere to hurry.'], ['After the rain','The lights lingering on the wet road remember the shape of the rain that has passed.'] ];
document.querySelectorAll('[data-scene]').forEach(button => button.addEventListener('click', () => { const scene = scenes[Number(button.dataset.scene)]; $('#scene-title').textContent = scene[0]; $('#scene-description').textContent = scene[1]; openDialog($('#scene-dialog')); }));

function renderNote() { const value = readStorage('honoka-note') || ''; $('#saved-note').hidden = !value; $('#saved-text').textContent = value; }
function updateCount() { $('#char-count').textContent = `${$('#note-input').value.length} / 2000`; }
function editNote() { $('#note-input').value = readStorage('honoka-note') || ''; updateCount(); openDialog($('#note-dialog')); }
$('#write-note').addEventListener('click', editNote); $('#edit-note').addEventListener('click', editNote); $('#note-input').addEventListener('input', updateCount);
$('#note-form').addEventListener('submit', e => { e.preventDefault(); const value = $('#note-input').value.trim(); if (!value) { toast('Write a thought you would like to keep first.'); $('#note-input').focus(); return; } if (writeStorage('honoka-note', value)) { renderNote(); $('#note-dialog').close(); toast('Your thought for tonight has been saved.'); } });
$('#delete-note').addEventListener('click', () => { if (writeStorage('honoka-note', null)) { renderNote(); $('#note-dialog').close(); toast('Your note has been deleted.'); } }); renderNote();

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
    toggle.setAttribute('aria-pressed', String(rainOn)); $('#rain-label').textContent = rainOn ? 'Rain ON' : 'Rain OFF';
    toast(rainOn ? 'Gentle rain is now playing.' : 'Rain sounds are now off.');
  } catch { toast('Rain sounds are not supported in this browser.'); }
  finally { toggle.disabled = false; }
});
