const sleep = ms => new Promise(res => setTimeout(res, ms));
function toggleLearnMore(elementId) {
  const learnMoreElement = document.getElementById(elementId);
  if (learnMoreElement) {
    if (learnMoreElement.style.display === 'none' || learnMoreElement.style.display === '') {
      learnMoreElement.style.display = 'block';
    } else {
      learnMoreElement.style.display = 'none';
    }
  }
}


// Number Crunch
(() => {
  let round = 3, score = 0, highScore = 0, active = false;
  const startBtn = document.getElementById('nc-start');
  const seqEl = document.getElementById('nc-sequence');
  const input = document.getElementById('nc-input');
  const submit = document.getElementById('nc-submit');
  const endBtn = document.getElementById('nc-end');
  const fb = document.getElementById('nc-feedback');
  const roundEl = document.getElementById('nc-round');
  const scoreEl = document.getElementById('nc-score');
  const highEl = document.getElementById('nc-high');
  const timerEl = document.getElementById('nc-timer');
  const progressEl = document.getElementById('nc-progress');
  
  // Function to sleep/wait for a specified time
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // Function to update display elements
  function updateDisplay() {
    roundEl.textContent = round - 2; // Adjust display to show round 1 when starting at length 3
    scoreEl.textContent = score;
    highEl.textContent = highScore;
  }
  
  // Function to update progress bar
  function updateProgress() {
    const percentage = Math.min(((round - 3) / 10) * 100, 100);
    progressEl.style.width = `${percentage}%`;
  }
  
  startBtn.onclick = () => {
    if (active) return;
    active = true;
    round = 3;
    score = 0;
    fb.textContent = '';
    updateDisplay();
    updateProgress();
    // Enable the end button when the game starts
    endBtn.disabled = false;
    nextRound();
  };
  
  async function nextRound() {
    if (!active) return;
    input.value = '';
    updateDisplay();
    updateProgress();
    
    const seq = Array.from({ length: round }, () => Math.floor(Math.random() * 10)).join('');
    seqEl.textContent = seq;
    
    // Countdown timer
    for (let i = 3; i > 0; i--) {
      timerEl.textContent = i;
      await sleep(1000);
    }
    timerEl.textContent = '--';
    
    seqEl.textContent = '';
    input.disabled = false;
    submit.disabled = false;
    input.focus();
    
    const user = await new Promise(res => {
      submit.onclick = () => res(input.value.trim());
    });
    
    input.disabled = true;
    submit.disabled = true;
    
    if (user === null) {
      fb.textContent = `Game ended. You reached round ${round - 2}.`;
      active = false;
      endBtn.disabled = true;
    } else if (user === seq) {
      fb.textContent = '✅ Correct!';
      score += round;
      highScore = Math.max(highScore, score);
      round++;
      updateDisplay();
      nextRound();
    } else {
      fb.textContent = `❌ Wrong! It was ${seq}. You reached round ${round - 2}.`;
      highScore = Math.max(highScore, score);
      updateDisplay();
      active = false;
      endBtn.disabled = true;
    }
  }
  
  // End button handler for Number Crunch
  endBtn.onclick = () => {
    if (!active) return;
    active = false;
    input.disabled = true;
    submit.disabled = true;
    endBtn.disabled = true;
    fb.textContent = `Game ended. You reached round ${round - 2}.`;
    highScore = Math.max(highScore, score);
    updateDisplay();
  };
  
  // Initialize display
  updateDisplay();
})();

// Location Recall
(() => {
  let size = 3,
      targets = 2,
      active = false,
      score = 0,
      round = 0,
      timerInterval = null,
      maxRounds = 10,
      highScore = 0;

  const startBtn = document.getElementById('lr-start');
  const gridEl = document.getElementById('lr-grid');
  const endBtn = document.getElementById('lr-end');
  const fb = document.getElementById('lr-feedback');
  const progressEl = document.getElementById('lr-progress');
  const timerEl = document.getElementById('lr-timer');
  const sizeEl = document.getElementById('lr-size');
  const targetsEl = document.getElementById('lr-targets');
  const scoreEl = document.getElementById('lr-score');
  const highEl = document.getElementById('lr-high');

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  startBtn.onclick = () => {
    if (active) return;
    active = true;
    size = 3;
    targets = 2;
    score = 0;
    round = 0;
    fb.textContent = '';
    endBtn.disabled = false;
    timerEl.textContent = '--';
    clearInterval(timerInterval);
    updateProgress();
    updateStats();
    playRound();
  };

  function genGrid() {
    const symbols = '★■▲◆●'.slice(0, targets).split('');
    const cells = Array(size * size).fill('□');
    const positions = [];
    while (positions.length < symbols.length) {
      const idx = Math.floor(Math.random() * cells.length);
      if (cells[idx] === '□') {
        cells[idx] = symbols[positions.length];
        positions.push(idx);
      }
    }
    return { cells, positions, symbols };
  }

  function displayGrid(cells) {
    let gridDisplay = '';
    for (let i = 0; i < size; i++) {
      gridDisplay += cells.slice(i * size, (i + 1) * size).join(' ');
      if (i < size - 1) gridDisplay += '\n';
    }
    gridEl.innerHTML = `<pre style="font-size: 24px; line-height: 1.5;">${gridDisplay}</pre>`;
  }

  function updateProgress() {
    const percentage = Math.min((round / maxRounds) * 100, 100);
    progressEl.style.width = `${percentage}%`;
  }

  async function playRound() {
    if (!active) return;
    round++;
    updateProgress();
    updateStats();

    const { cells, positions, symbols } = genGrid();
    displayGrid(cells);

    for (let i = 3; i > 0; i--) {
      timerEl.textContent = i;
      await sleep(1000);
    }
    timerEl.textContent = '--';

    displayGrid(Array(size * size).fill('□'));
    gridEl.innerHTML = '';

    const table = document.createElement('table');
    table.style.margin = '0 auto';
    table.style.borderCollapse = 'collapse';
    const clickedPositions = [];

    for (let i = 0; i < size; i++) {
      const rowEl = document.createElement('tr');
      for (let j = 0; j < size; j++) {
        const cell = document.createElement('td');
        const idx = i * size + j;
        cell.textContent = '□';
        cell.style.cssText = 'width:40px;height:40px;text-align:center;border:1px solid #ccc;cursor:pointer;font-size:24px;transition:background-color .2s';
        cell.onmouseover = () => { if (!cell.clicked) cell.style.backgroundColor = '#f0f0f0'; };
        cell.onmouseout = () => { if (!cell.clicked) cell.style.backgroundColor = ''; };
        cell.onclick = () => {
          if (!active || clickedPositions.length >= targets || cell.clicked) return;
          cell.clicked = true;
          cell.style.backgroundColor = '#ddd';
          clickedPositions.push(idx);
          cell.textContent = clickedPositions.length;
          if (clickedPositions.length === positions.length) {
            setTimeout(() => {
              const correct = positions.every(p => clickedPositions.includes(p));
              if (correct) {
                score += size * targets;
                fb.textContent = '✅ Correct! Advancing to next round.';
                if (round % 2 === 0) {
                  if (targets < 5) targets++;
                  else if (size < 5) { size++; targets = Math.max(2, targets - 1); }
                }
              } else {
                fb.textContent = `❌ Incorrect! Correct positions were: ${positions.map((p,i)=>`${symbols[i]} at (${Math.floor(p/size)+1},${p%size+1})`).join(' | ')}`;
                if (targets > 2) targets--;
              }
              updateStats();
              if (active) setTimeout(playRound, correct ? 1500 : 3000);
            }, 500);
          }
        };
        rowEl.appendChild(cell);
      }
      table.appendChild(rowEl);
    }
    gridEl.appendChild(table);
  }

  function updateStats() {
    sizeEl.textContent = `${size}×${size}`;
    targetsEl.textContent = targets;
    scoreEl.textContent = score;
    if (highEl) highEl.textContent = highScore;
    const roundEl = document.getElementById('lr-round');
    if (roundEl) roundEl.textContent = round;
  }

  // Helper to terminate the game
  function endGame(message) {
    highScore = Math.max(highScore, score);
    updateStats();
    fb.textContent = message || `Game ended at round ${round}, ${size}×${size} grid with ${targets} targets. Final score: ${score}`;
    endBtn.disabled = true;
    timerEl.textContent = '--';
    active = false;
  }

  endBtn.onclick = () => {
    if (!active) return;
    endGame('Game ended by player.');
  };

  // Initial setup
  updateStats();
  timerEl.textContent = '--';
  endBtn.disabled = true;
})();


//False Memory
(() => {
  let round = 0, score = 0, highScore = 0, active = false;
  let correctCount = 0, falseCount = 0;

  const startBtn = document.getElementById('fm-start');
  const endBtn = document.getElementById('fm-end');
  const roundEl = document.getElementById('fm-sets');
  const wordsEl = document.getElementById('fm-words');
  const input = document.getElementById('fm-input');
  const submit = document.getElementById('fm-submit');
  const fb = document.getElementById('fm-feedback');
  const correctEl = document.getElementById('fm-correct');
  const falseEl = document.getElementById('fm-false');
  const timerEl = document.getElementById('fm-timer');
  const progressEl = document.getElementById('fm-progress');

  const wordLists = [
    { words: ["bed", "rest", "awake", "tired", "dream", "wake", "snooze", "blanket", "doze", "slumber"], lure: "sleep" },
    { words: ["sour", "candy", "sugar", "bitter", "good", "taste", "tooth", "nice", "honey", "soda"], lure: "sweet" },
    { words: ["note", "sound", "piano", "sing", "radio", "band", "melody", "horn", "concert", "instrument"], lure: "music" }
  ];

  function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  function updateDisplay() {
    roundEl.textContent = round + 1;
    correctEl.textContent = correctCount;
    falseEl.textContent = falseCount;
    const percentage = Math.min((round / wordLists.length) * 100, 100);
    progressEl.style.width = `${percentage}%`;
  }

  startBtn.onclick = async () => {
    if (active) return;
    active = true;
    round = 0;
    score = 0;
    correctCount = 0;
    falseCount = 0;
    fb.textContent = '';
    endBtn.disabled = false;
    await playRound();
  };

  endBtn.onclick = () => {
    if (!active) return;
    active = false;
    input.disabled = true;
    submit.disabled = true;
    endBtn.disabled = true;
    fb.textContent = `Game ended. You completed ${round + 1} sets.`;
    updateDisplay();
  };

  async function playRound() {
    while (active && round < wordLists.length) {
      const { words, lure } = wordLists[round];
      updateDisplay();
      input.value = '';
      input.disabled = true;
      submit.disabled = true;

      // Show words
      wordsEl.textContent = words.join(', ');
      for (let i = 3; i > 0; i--) {
        timerEl.textContent = i;
        await sleep(1000);
      }
      wordsEl.textContent = '';
      timerEl.textContent = '--';

      // Wait for user input
      input.disabled = false;
      submit.disabled = false;
      input.focus();

      const response = await new Promise(res => {
        submit.onclick = () => res(input.value.trim().toLowerCase());
      });

      input.disabled = true;
      submit.disabled = true;

      const recalled = response.split(',').map(w => w.trim());
      const correctSet = new Set(words);
      const hasLure = recalled.includes(lure);
      const matched = recalled.filter(w => correctSet.has(w));
      const matchedCount = matched.length;

      if (hasLure) {
        fb.textContent = `❌ You falsely remembered "${lure}". Game over.`;
        falseCount++;
        active = false;
        endBtn.disabled = true;
      } else if (matchedCount === words.length) {
        fb.textContent = `✅ Perfect recall! All ${matchedCount} words correct.`;
        correctCount++;
        round++;
      } else {
        fb.textContent = `✅ Partial recall: ${matchedCount}/${words.length} correct.`;
        correctCount++;
        round++;
      }

      updateDisplay();
      await sleep(2000);
    }

    if (round >= wordLists.length && active) {
      fb.textContent = `🎉 Great job! You completed all ${wordLists.length} sets.`;
      active = false;
      endBtn.disabled = true;
    }
  }

  updateDisplay();
})();

// Change Blindness Emoji Game
(() => {
  let round = 1, score = 0, highScore = 0, active = false;
  const startBtn = document.getElementById('cb-start');
  const gridEl = document.getElementById('cb-grid');
  const input = document.getElementById('cb-input');
  const submit = document.getElementById('cb-submit');
  const endBtn = document.getElementById('cb-end');
  const fb = document.getElementById('cb-feedback');
  const roundEl = document.getElementById('cb-round');
  const scoreEl = document.getElementById('cb-score');
  const highEl = document.getElementById('cb-high');
  const timerEl = document.getElementById('cb-timer');
  const progressEl = document.getElementById('cb-progress');

  const emojiPool = ['🐶','🐱','🦊','🐼','🐵','🦁','🐸','🐧','🐷','🐮'];

  function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  function updateDisplay() {
    roundEl.textContent = round;
    scoreEl.textContent = score;
    highEl.textContent = highScore;
  }

  function updateProgress() {
    const percent = Math.min((round / 10) * 100, 100);
    progressEl.style.width = `${percent}%`;
  }

  function generateGrid(changeIndex = null) {
    const grid = [];
    for (let i = 0; i < 9; i++) {
      grid.push(emojiPool[Math.floor(Math.random() * emojiPool.length)]);
    }
    const original = [...grid];
    if (changeIndex !== null) {
      let newEmoji;
      do {
        newEmoji = emojiPool[Math.floor(Math.random() * emojiPool.length)];
      } while (newEmoji === grid[changeIndex]);
      grid[changeIndex] = newEmoji;
    }
    return [original, grid];
  }

  startBtn.onclick = () => {
    if (active) return;
    active = true;
    round = 1;
    score = 0;
    fb.textContent = '';
    updateDisplay();
    updateProgress();
    endBtn.disabled = false;
    nextRound();
  };

  async function nextRound() {
    if (!active) return;
    input.value = '';
    updateDisplay();
    updateProgress();

    const changeIndex = Math.floor(Math.random() * 9);
    const [grid1, grid2] = generateGrid(changeIndex);

    // Show original grid
    gridEl.innerHTML = formatGrid(grid1);
    for (let i = 3; i > 0; i--) {
      timerEl.textContent = i;
      await sleep(1000);
    }

    // Flash transition
    gridEl.innerHTML = '⚡';
    await sleep(500);

    // Show changed grid
    gridEl.innerHTML = formatGrid(grid2);
    timerEl.textContent = '--';
    input.disabled = false;
    submit.disabled = false;
    input.focus();

    const userGuess = await new Promise(res => {
      submit.onclick = () => res(parseInt(input.value.trim(), 10) - 1);
    });

    input.disabled = true;
    submit.disabled = true;

    if (userGuess === changeIndex) {
      fb.textContent = '✅ Correct!';
      score += 1;
      highScore = Math.max(highScore, score);
      round++;
      nextRound();
    } else {
      fb.textContent = `❌ Wrong! The changed emoji was at position ${changeIndex + 1}.`;
      highScore = Math.max(highScore, score);
      active = false;
      endBtn.disabled = true;
      updateDisplay();
    }
  }

  function formatGrid(grid) {
    return grid.map((emoji, i) =>
      `<span style="display:inline-block;width:2em;text-align:center;">${emoji}<br><small>${i+1}</small></span>`
    ).join('');
  }

  endBtn.onclick = () => {
    if (!active) return;
    active = false;
    input.disabled = true;
    submit.disabled = true;
    endBtn.disabled = true;
    fb.textContent = `Game ended. You reached round ${round}.`;
    highScore = Math.max(highScore, score);
    updateDisplay();
  };

  updateDisplay();
})();
