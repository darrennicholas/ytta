const yesButton = document.querySelector('#yes-button');
const noButton = document.querySelector('#no-button');
const stage = document.querySelector('#button-stage');
const cat = document.querySelector('#cat');
const question = document.querySelector('#question');
const subtitle = document.querySelector('#subtitle');
const hint = document.querySelector('#hint');
const survey = document.querySelector('#love-survey');
const loveForm = document.querySelector('#love-form');
const formMessage = document.querySelector('#form-message');

// The eight GIFs rotate as No is clicked, so the same expression does not repeat in a row.
const catGifs = [
  { url: 'https://media.giphy.com/media/D4eCf2qoc7Z2tqLcXu/giphy.gif', alt: 'A disappointed cat meme' },
  { url: 'https://media.giphy.com/media/vAeB18YnyYfKaS2V4z/giphy.gif', alt: 'A cat crying dramatically' },
  { url: 'https://media.giphy.com/media/9tJfy6FpyQ4PQ4fXTQ/giphy.gif', alt: 'A sad little crying cat' },
  { url: 'https://media.giphy.com/media/FJfPU9NlzX3Nl5DjqI/giphy.gif', alt: 'An angry but cute cat' },
  { url: 'https://media.giphy.com/media/f54Or4wFysQ7vVGeKb/giphy.gif', alt: 'A stressed and annoyed cat meme' },
  { url: 'https://media.giphy.com/media/7AzEXdIb1wyCTWJntb/giphy.gif', alt: 'A sad cat with big feelings' },
  { url: 'https://media.giphy.com/media/GwskZm1jXg8cDvuZJ6/giphy.gif', alt: 'A dramatic cat crying' },
  { url: 'https://media.giphy.com/media/F2gEOgGwXrgeja8hHT/giphy.gif', alt: 'A cute disappointed cat staring sadly' }
];
const happyGif = 'https://media.giphy.com/media/bOXnd3kig533u93OND/giphy.gif';
let noClicks = 0;

function setGif(image, url, alt) {
  image.alt = alt;
  image.dataset.fallbackTried = '';
  image.src = `${url}?v=${Date.now()}`;
}

// GIPHY may serve GIFs from different CDN hosts; try the alternate hostname once on failure.
document.querySelectorAll('.cat-frame img').forEach((image) => {
  image.addEventListener('error', () => {
    const gifId = image.src.match(/\/media\/([^/?]+)/)?.[1];
    if (gifId && !image.dataset.fallbackTried) {
      image.dataset.fallbackTried = 'true';
      image.src = `https://media3.giphy.com/media/${gifId}/giphy.gif`;
    }
  });
  image.addEventListener('load', () => { image.dataset.fallbackTried = ''; });
});

function moveNoButton() {
  const stageRect = stage.getBoundingClientRect();
  const buttonRect = noButton.getBoundingClientRect();
  const yesRect = yesButton.getBoundingClientRect();
  const padding = 4;
  const maxX = Math.max(padding, stageRect.width - buttonRect.width - padding);
  const maxY = Math.max(padding, stageRect.height - buttonRect.height - padding);
  let x = padding;
  let y = padding;

  for (let attempt = 0; attempt < 24; attempt++) {
    x = padding + Math.random() * (maxX - padding);
    y = padding + Math.random() * (maxY - padding);
    const candidate = {
      left: stageRect.left + x, top: stageRect.top + y,
      right: stageRect.left + x + buttonRect.width,
      bottom: stageRect.top + y + buttonRect.height
    };
    const overlapsYes = candidate.left < yesRect.right + 8 && candidate.right > yesRect.left - 8 &&
      candidate.top < yesRect.bottom + 8 && candidate.bottom > yesRect.top - 8;
    if (!overlapsYes) break;
  }

  noButton.classList.add('moving');
  noButton.style.left = `${x}px`;
  noButton.style.top = `${y}px`;
}

noButton.addEventListener('click', () => {
  noClicks += 1;
  yesButton.style.setProperty('--yes-scale', String(Math.min(1 + noClicks * 0.16, 2.05)));
  const gif = catGifs[(noClicks - 1) % catGifs.length];
  setGif(cat, gif.url, gif.alt);
  hint.textContent = ['Are you sure? 🥺', 'My heart says try again 💗', 'The Yes button is waiting 🌸', 'You know you miss me! 🐱'][Math.min(noClicks - 1, 3)];
  moveNoButton();
});

yesButton.addEventListener('click', () => {
  question.textContent = 'Yay! I knew it!';
  subtitle.innerHTML = 'I miss you even more <span>♥</span>';
  hint.textContent = 'Sending you the biggest hug! 🫂';
  noButton.hidden = true;
  setGif(cat, happyGif, 'A happy cat celebrating with confetti');
  document.body.classList.add('survey-open');
  survey.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => survey.classList.add('visible'));
  launchCelebration();
});

loveForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const answers = [...loveForm.querySelectorAll('.quiz-question')].map((step) => {
    const selected = step.querySelector('input:checked');
    return selected ? selected.closest('label').textContent.trim() : '';
  });
  if (answers.some((answer) => !answer)) {
    formMessage.textContent = 'Please answer all three questions first 💕';
    return;
  }

  const sendButton = document.querySelector('#quiz-submit');
  sendButton.disabled = true;
  formMessage.textContent = 'Sending your answers... 💌';
  try {
    const response = await fetch('https://formsubmit.co/ajax/darrensuwito18@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        _subject: 'A little love quiz 💕',
        'What should we do together next?': answers[0],
        'Pick our perfect mood': answers[1],
        'How much did you miss me?': answers[2],
        'Little note': document.querySelector('#love-note').value.trim() || '(No note)',
        _template: 'table',
        _url: window.location.href
      })
    });
    const result = await response.json();
    if (!response.ok || String(result.success) !== 'true') {
      const message = typeof result.message === 'string' ? result.message : '';
      if (/activat|actived/i.test(message)) {
        throw new Error('Email tujuan perlu diaktifkan. Buka email dari FormSubmit di inbox atau spam, klik Activate Form, lalu kirim ulang.');
      }
      throw new Error(message || `Layanan menolak pengiriman (HTTP ${response.status}).`);
    }
    const ending = document.querySelector('#love-ending');
    ending.setAttribute('aria-hidden', 'false');
    survey.setAttribute('aria-hidden', 'true');
    survey.inert = true;
    requestAnimationFrame(() => ending.classList.add('visible'));
    launchCelebration('#ending-celebration');
    document.querySelector('#ending-title').focus({ preventScroll: true });
  } catch (error) {
    formMessage.textContent = error instanceof TypeError
      ? 'Tidak dapat menghubungi FormSubmit. Periksa internet atau pemblokir browser, lalu coba lagi. 💌'
      : `Pengiriman belum berhasil: ${error.message}`;
  } finally {
    sendButton.disabled = false;
  }
});

const steps = [...document.querySelectorAll('.quiz-question')];
const nextButton = document.querySelector('#quiz-next');
const backButton = document.querySelector('#quiz-back');
const submitButton = document.querySelector('#quiz-submit');
const noteWrap = document.querySelector('#note-wrap');
let currentStep = 0;

function showStep() {
  steps.forEach((step, index) => { step.hidden = index !== currentStep; });
  backButton.hidden = currentStep === 0;
  nextButton.hidden = currentStep === steps.length - 1;
  submitButton.hidden = currentStep !== steps.length - 1;
  noteWrap.hidden = currentStep !== steps.length - 1;
  document.querySelector('#quiz-progress').textContent = `Question ${currentStep + 1} of ${steps.length}`;
  formMessage.textContent = '';
}

nextButton.addEventListener('click', () => {
  if (!steps[currentStep].querySelector('input:checked')) {
    formMessage.textContent = 'Pick an answer first, sweetheart 💕';
    return;
  }
  currentStep++;
  showStep();
});
backButton.addEventListener('click', () => { currentStep--; showStep(); });

function launchCelebration(selector = '#celebration') {
  const layer = document.querySelector(selector);
  const symbols = ['🌸', '🌷', '💖', '✨', '🌼', '💕', '🦋', '🌈'];
  for (let i = 0; i < 36; i++) {
    const particle = document.createElement('span');
    particle.textContent = symbols[i % symbols.length];
    particle.className = 'celebration-piece';
    particle.style.setProperty('--x', `${Math.random() * 100}%`);
    particle.style.setProperty('--delay', `${Math.random() * 1.4}s`);
    particle.style.setProperty('--duration', `${2.8 + Math.random() * 2.5}s`);
    particle.style.setProperty('--drift', `${Math.random() * 160 - 80}px`);
    layer.appendChild(particle);
  }
  setTimeout(() => { layer.replaceChildren(); }, 6500);
}
