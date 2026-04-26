const vibeMeta = {
  romantic: {
    title: 'Romantic Rose',
    blurb: 'Soft rose-tinted light, tender longing, and golden evening warmth.',
    seal: 'ROMANCE',
    stamp: 'Rose Air Mail',
    icon: '✿'
  },
  dreamy: {
    title: 'Dreamy Moonmist',
    blurb: 'Lavender twilight, luminous hush, and drifting moonlit tenderness.',
    seal: 'MOONMIST',
    stamp: 'Cloud Post',
    icon: '☾'
  },
  melancholy: {
    title: 'Melancholy Rainletter',
    blurb: 'Faded skies, silver rain, and a quiet ache pressed into paper.',
    seal: 'RAIN',
    stamp: 'Duskhour Mail',
    icon: '☔'
  },
  adventure: {
    title: 'Adventure Compass',
    blurb: 'Sun-warmed maps, far stations, moving trains, and brave bright footsteps.',
    seal: 'VOYAGE',
    stamp: 'Atlas Post',
    icon: '✦'
  },
  classic: {
    title: 'Classic Gilded',
    blurb: 'Timeless elegance, polished sentiment, and old-world golden detail.',
    seal: 'GILDED',
    stamp: 'Heritage Mail',
    icon: '✷'
  },
  darkacademia: {
    title: 'Dark Academia Ink',
    blurb: 'Antique pages, candlelit ink, autumn libraries, and literary shadows.',
    seal: 'INK',
    stamp: 'Library Post',
    icon: '🕮'
  }
};

const strengthMap = ['light', 'balanced', 'rich'];
const strengthLabelMap = ['Light', 'Balanced', 'Rich vintage'];

const destinationEl = document.getElementById('destination');
const senderEl = document.getElementById('sender');
const recipientEl = document.getElementById('recipient');
const vibeEl = document.getElementById('vibe');
const messageEl = document.getElementById('message');
const strengthEl = document.getElementById('rewriteStrength');
const strengthLabelEl = document.getElementById('strengthLabel');
const statusEl = document.getElementById('status');
const generatedTextEl = document.getElementById('generatedText');
const signatureLineEl = document.getElementById('signatureLine');
const displayRecipientEl = document.getElementById('displayRecipient');
const displayDestinationEl = document.getElementById('displayDestination');
const displayDestinationTopEl = document.getElementById('displayDestinationTop');
const displayYearEl = document.getElementById('displayYear');
const themeTitleEl = document.getElementById('themeTitle');
const themeBlurbEl = document.getElementById('themeBlurb');
const sealTextEl = document.getElementById('sealText');
const stampBoxEl = document.getElementById('stampBox');
const postcardFrameEl = document.getElementById('postcardFrame');
const historyListEl = document.getElementById('historyList');

let lastGenerated = '';

function applyTheme() {
  const vibe = vibeEl.value;
  const meta = vibeMeta[vibe];
  document.body.dataset.theme = vibe;
  postcardFrameEl.className = `postcard-frame theme-${vibe} reveal-card`;
  themeTitleEl.textContent = meta.title;
  themeBlurbEl.textContent = meta.blurb;
  sealTextEl.textContent = meta.seal;
  stampBoxEl.querySelector('.stamp-name').textContent = meta.stamp;
  stampBoxEl.querySelector('.stamp-icon').textContent = meta.icon;
}

function updateStaticFields() {
  const destination = destinationEl.value.trim() || 'Paris';
  const recipient = recipientEl.value.trim() || 'Eleanor Hart';
  const sender = senderEl.value.trim() || 'Clara Bennett';
  displayDestinationEl.textContent = destination;
  displayDestinationTopEl.textContent = destination.split(',')[0].trim().toUpperCase().slice(0, 12);
  displayRecipientEl.textContent = `To ${recipient}`;
  signatureLineEl.textContent = `Yours, ${sender}`;
  const year = 1921 + (destination.length + recipient.length + sender.length) % 9;
  displayYearEl.textContent = year;
}

function setStatus(text, mode = 'normal') {
  statusEl.textContent = text;
  statusEl.style.color = mode === 'error' ? '#ffd0d0' : '#f7e9d8';
}

function typeInText(text) {
  generatedTextEl.textContent = '';
  let i = 0;
  const speed = 9;
  const timer = setInterval(() => {
    generatedTextEl.textContent = text.slice(0, i);
    i += 1;
    if (i > text.length) clearInterval(timer);
  }, speed);
}

function saveHistory(item) {
  const current = JSON.parse(localStorage.getItem('moonlitPostHistory') || '[]');
  current.unshift(item);
  const trimmed = current.slice(0, 8);
  localStorage.setItem('moonlitPostHistory', JSON.stringify(trimmed));
  renderHistory();
}

function renderHistory() {
  const items = JSON.parse(localStorage.getItem('moonlitPostHistory') || '[]');
  historyListEl.innerHTML = '';
  if (!items.length) {
    historyListEl.innerHTML = '<div class="history-item">No postcards saved yet.</div>';
    return;
  }
  items.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'history-item';
    el.innerHTML = `
      <strong>${item.vibeTitle}</strong><br>
      <small>${item.destination} · ${item.date}</small>
      <div style="margin-top:8px; color: rgba(255,255,255,.8)">${item.text.slice(0, 120)}${item.text.length > 120 ? '…' : ''}</div>
      <button data-index="${index}">Load again</button>
    `;
    historyListEl.appendChild(el);
  });

  historyListEl.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemsAgain = JSON.parse(localStorage.getItem('moonlitPostHistory') || '[]');
      const item = itemsAgain[Number(btn.dataset.index)];
      if (!item) return;
      vibeEl.value = item.vibe;
      destinationEl.value = item.destination;
      recipientEl.value = item.recipient;
      senderEl.value = item.sender;
      messageEl.value = item.originalMessage;
      strengthEl.value = item.strengthIndex;
      strengthLabelEl.textContent = strengthLabelMap[item.strengthIndex];
      applyTheme();
      updateStaticFields();
      lastGenerated = item.text;
      generatedTextEl.textContent = item.text;
      signatureLineEl.textContent = `Yours, ${item.sender}`;
      setStatus('Loaded a saved postcard.');
    });
  });
}

async function generatePostcard() {
  const destination = destinationEl.value.trim();
  const sender = senderEl.value.trim() || 'Clara Bennett';
  const recipient = recipientEl.value.trim() || 'Eleanor Hart';
  const message = messageEl.value.trim();
  const vibe = vibeEl.value;
  const rewriteStrength = strengthMap[Number(strengthEl.value)];

  if (!destination || !message) {
    setStatus('Please add both a destination and your real message first.', 'error');
    return;
  }

  updateStaticFields();
  setStatus('Writing your postcard with a more faithful vintage voice...');
  generatedTextEl.textContent = 'Composing by candlelight...';

  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vibe,
        destination,
        sender,
        recipient,
        message,
        rewriteStrength
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Generation failed.');
    }

    lastGenerated = data.text;
    typeInText(lastGenerated);
    signatureLineEl.textContent = `Yours, ${sender}`;
    setStatus(`Postcard generated using ${data.model}.`);

    saveHistory({
      vibe,
      vibeTitle: vibeMeta[vibe].title,
      destination,
      sender,
      recipient,
      originalMessage: message,
      text: lastGenerated,
      date: new Date().toLocaleString(),
      strengthIndex: Number(strengthEl.value)
    });
  } catch (error) {
    generatedTextEl.textContent = 'The letter was delayed on the route. Please try again.';
    setStatus(error.message || 'Something went wrong.', 'error');
  }
}

function clearAll() {
  destinationEl.value = '';
  senderEl.value = '';
  recipientEl.value = '';
  messageEl.value = '';
  generatedTextEl.textContent = 'Your finished postcard will appear here.';
  signatureLineEl.textContent = 'Yours, Clara Bennett';
  lastGenerated = '';
  updateStaticFields();
  setStatus('Cleared. Ready for a new postcard.');
}

async function copyText() {
  const text = lastGenerated || generatedTextEl.textContent.trim();
  if (!text || text === 'Your finished postcard will appear here.') {
    setStatus('Generate a postcard first before copying.', 'error');
    return;
  }
  await navigator.clipboard.writeText(text);
  setStatus('Postcard text copied.');
}

function downloadText() {
  const text = lastGenerated || generatedTextEl.textContent.trim();
  if (!text || text === 'Your finished postcard will appear here.') {
    setStatus('Generate a postcard first before downloading text.', 'error');
    return;
  }
  const blob = new Blob([text], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'moonlit-postcard.txt';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function downloadPng() {
  const captureArea = document.getElementById('captureArea');
  setStatus('Preparing a prettier PNG export...');
  const canvas = await html2canvas(captureArea, {
    scale: 2,
    backgroundColor: null,
    useCORS: true
  });
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'moonlit-postcard.png';
  link.click();
  setStatus('PNG downloaded.');
}

vibeEl.addEventListener('change', () => {
  applyTheme();
  updateStaticFields();
});
[destinationEl, senderEl, recipientEl].forEach(el => el.addEventListener('input', updateStaticFields));
strengthEl.addEventListener('input', () => {
  strengthLabelEl.textContent = strengthLabelMap[Number(strengthEl.value)];
});

document.getElementById('generateBtn').addEventListener('click', generatePostcard);
document.getElementById('regenerateBtn').addEventListener('click', generatePostcard);
document.getElementById('clearBtn').addEventListener('click', clearAll);
document.getElementById('copyBtn').addEventListener('click', copyText);
document.getElementById('downloadTextBtn').addEventListener('click', downloadText);
document.getElementById('downloadPngBtn').addEventListener('click', downloadPng);

applyTheme();
updateStaticFields();
renderHistory();
