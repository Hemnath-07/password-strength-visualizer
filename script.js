// script.js
// Requires: zxcvbn (global), p5 (global)

let p5Instance = null;
let lastAnalysis = null;

document.addEventListener('DOMContentLoaded', () => {
  const pwd = document.getElementById('password');
  const toggle = document.getElementById('toggle-visibility');
  const copyBtn = document.getElementById('copy-btn');
  const suggestionsEl = document.getElementById('suggestions');
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');
  const entropyEl = document.getElementById('entropy');
  const cracktimeEl = document.getElementById('cracktime');
  const exportBtn = document.getElementById('export-btn');

  // p5 sketch attached to #p5-container
  function createSketch() {
    const sketch = (s) => {
      let w, h;
      s.setup = () => {
        const container = document.getElementById('p5-container');
        w = container.clientWidth;
        h = container.clientHeight;
        s.createCanvas(w, h);
        s.noStroke();
      };

      s.windowResized = () => {
        const container = document.getElementById('p5-container');
        w = container.clientWidth;
        h = container.clientHeight;
        s.resizeCanvas(w, h);
      };

      s.draw = () => {
        s.clear();
        const info = lastAnalysis || { score: 0, entropy: 0, crackTime: '—' };
        const t = s.millis() / 1000;
        const score = info.score || 0;
        // map score to parameters
        const density = 30 + score * 40 + Math.abs(Math.sin(t)) * 20;
        const hueBase = mapRange(score, 0, 4, 200, 40); // blue -> green -> yellow
        // background subtle gradient
        for (let i = 0; i < 6; i++) {
          s.fill(hslToRgb(hueBase/360, 0.3, 0.06 + i*0.02, 0.02));
          s.rect(0, i * (h/6), w, h / 6);
        }
        // draw pattern particles influenced by entropy
        const entropy = info.entropy || 10;
        for (let i = 0; i < density; i++) {
          const mx = (s.noise(i * 0.1, t * 0.05) - 0.5) * w * (1 - score*0.15);
          const x = s.width/2 + mx + Math.sin(t * (0.5 + i*0.01) + i) * (50 + entropy * 2);
          const y = (i / density) * s.height + Math.cos(t + i) * 10;
          const size = Math.max(4, 12 * (0.6 + (entropy % 10) / 15) * (0.4 + score*0.4));
          s.fill(hslToRgb((hueBase + i*6) / 360, 0.7, 0.5, 0.85));
          s.ellipse(x % (s.width + 200) - 100, (y + s.height) % s.height, size, size);
        }
      };
    };
    return new p5(sketch, document.getElementById('p5-container'));
  }

  // setup the p5 instance
  p5Instance = createSketch();

  // helpers
  function mapRange(v, a, b, c, d) {
    return c + (d - c) * ((v - a) / (b - a));
  }

  // small helper to convert HSL-ish to rgba using canvas-friendly values
  function hslToRgb(h, s, l, alpha=1){
    // fallback: use simple HSL string for p5
    return `hsla(${h*360}, ${Math.round(s*100)}%, ${Math.round(l*100)}%, ${alpha})`;
  }

  function formatCrackTime(estimate) {
    // zxcvbn provides display string in crack_times_display; prefer offline_guess etc.
    if (!estimate) return '—';
    // if estimate is number of seconds, convert:
    if (typeof estimate === 'number') {
      const seconds = estimate;
      if (seconds < 1) return 'less than 1 second';
      const units = [
        { u: 'years', s: 60*60*24*365 },
        { u: 'days', s: 60*60*24 },
        { u: 'hours', s: 60*60 },
        { u: 'minutes', s: 60 },
        { u: 'seconds', s: 1 },
      ];
      for (const unit of units) {
        if (seconds >= unit.s) {
          const val = Math.round(seconds / unit.s);
          return `${val} ${unit.u}`;
        }
      }
    }
    return estimate;
  }

  function analyzeAndRender(value) {
    if (!window.zxcvbn) {
      console.warn('zxcvbn not loaded');
      return;
    }
    const res = zxcvbn(value);
    // store something for p5
    lastAnalysis = {
      score: res.score, // 0..4
      entropy: Math.round(res.entropy),
      crackTime: res.crack_times_seconds?.offline_slow_hashing_1e4_per_second || res.crack_times_seconds?.offline_fast_hashing_1e10_per_second || 0,
      suggestions: res.feedback || {}
    };

    // UI updates
    const pct = ((res.score) / 4) * 100;
    strengthBar.style.setProperty('--score', res.score);
    strengthBar.querySelector('::after'); // no-op: we update via style transform
    strengthBar.style.position = 'relative';
    // set pseudo width via element style (we defined ::after earlier, but JS cannot set it — so set inner gradient width instead)
    // technique: change background size
    strengthBar.style.background = 'rgba(255,255,255,0.06)';
    strengthBar.innerHTML = ''; // remove children
    const inner = document.createElement('div');
    inner.style.height = '100%';
    inner.style.width = `${pct}%`;
    inner.style.borderRadius = '8px';
    inner.style.transition = 'width 300ms ease';
    inner.style.background = `linear-gradient(90deg, ${getColorForScore(res.score)}, ${getColorForScore(res.score, true)})`;
    strengthBar.appendChild(inner);

    const texts = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
    strengthText.textContent = texts[res.score] || '—';

    entropyEl.textContent = `Entropy: ${Math.round(res.entropy)} bits`;
    cracktimeEl.textContent = `Estimated crack time: ${formatCrackTime(lastAnalysis.crackTime)}`;

    // suggestions & feedback
    const fb = res.feedback;
    let sugHtml = '';
    if (fb.warning) sugHtml += `<div><strong>Warning:</strong> ${escapeHtml(fb.warning)}</div>`;
    if (fb.suggestions && fb.suggestions.length) {
      sugHtml += '<ul>';
      for (const s of fb.suggestions) {
        sugHtml += `<li>${escapeHtml(s)}</li>`;
      }
      sugHtml += '</ul>';
    } else {
      if (res.score >= 3) sugHtml = '<div>Nice — this password looks strong. Consider using a passphrase to improve memorability.</div>';
    }
    suggestionsEl.innerHTML = sugHtml;

    // p5 will use lastAnalysis variable in its draw loop
  }

  function getColorForScore(score, lighter=false) {
    // map score 0..4 to colors
    if (score <= 1) return lighter ? '#fca5a5' : '#ef4444'; // red
    if (score === 2) return lighter ? '#fbd38d' : '#f59e0b'; // amber
    if (score === 3) return lighter ? '#86efac' : '#22c55e'; // green
    return lighter ? '#93c5fd' : '#0ea5e9'; // blueish/cyan
  }

  function escapeHtml(s){ if(!s) return ''; return s.replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); }

  // events
  pwd.addEventListener('input', (e) => {
    analyzeAndRender(e.target.value);
  });

  toggle.addEventListener('click', () => {
    if (pwd.type === 'password') { pwd.type = 'text'; toggle.textContent = 'Hide'; }
    else { pwd.type = 'password'; toggle.textContent = 'Show'; }
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(pwd.value);
      copyBtn.textContent = 'Copied';
      setTimeout(()=> copyBtn.textContent = 'Copy', 1200);
    } catch (err) {
      copyBtn.textContent = 'Failed';
      setTimeout(()=> copyBtn.textContent = 'Copy', 1200);
    }
  });

  exportBtn.addEventListener('click', (ev) => {
    ev.preventDefault();
    // export current p5 canvas as image
    if (p5Instance && p5Instance.canvas) {
      const data = p5Instance.canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = data;
      a.download = 'password-art.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  });

  // initial analyze empty
  analyzeAndRender('');
});
