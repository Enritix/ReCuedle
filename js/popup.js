function openGeneralPopup() {
  const popup = document.getElementById('general-popup');
  popup.style.display = 'flex';
}

function closeGeneralPopup() {
  const popup = document.getElementById('general-popup');
  popup.style.display = 'none';
}

function setupGeneralPopup(selector) {
  const generalPopup = document.getElementById("general-popup");
  const generalPopupContent = generalPopup.querySelector(".popup-content");
  generalPopupContent.textContent = "";
  if (selector === "info") {
    generalPopupContent.insertAdjacentHTML('beforeend',
      `<span id="close-general-popup" class="close-btn">&times;</span>
            <h2>Info</h2>
            <p>ReCuedle is a remake of radio.co's Cuedle. It's a daily music game where you have to guess the song of each decade.</p>
            <h2>How to play?</h2>
            <p>Press 'Cue' and listen to the song. Then try and guess the correct song. You get 6 guesses per song.</p>`);
  } else if (selector === "contact") {
    generalPopupContent.insertAdjacentHTML('beforeend',
      `<span id="close-general-popup" class="close-btn">&times;</span>
            <h2>Contact</h2>
            <p>Have you any questions/recommendations or did you find a bug? Please contact me @ReCuedle on Twitter or mail me: <a href="mailto:enrico@recuedle.com">enrico@recuedle.com</a></p>
            <h2>Support</h2>
            <p>Loving ReCuedle? Hosting the website and maintaining the song database come with costs, so your support means the world to me!☺️</p>
            <a id="kofi-button" href="https://ko-fi.com/enritix" target="_blank">
            <img class="shake" src="/assets/images/kofi_symbol.png" alt="Ko-fi logo">Consider buying me a coffee</a>`);
    document.querySelector('#kofi-button').addEventListener('click', function () {
      cheersKofiButton();
    });
  } else if (selector === "stats") {
    const gamesPlayed = JSON.parse(localStorage.getItem('gamesPlayed')) || 0;
    const gamesWon = JSON.parse(localStorage.getItem('gamesWon')) || 0;
    const winPercentage = JSON.parse(localStorage.getItem('winPercentage')) || 0;
    const currentStreak = JSON.parse(localStorage.getItem('currentStreak')) || 0;
    const maxStreak = JSON.parse(localStorage.getItem('maxStreak')) || 0;

    const guessesPerDay = JSON.parse(localStorage.getItem('guessesPerDay')) || {};

    generalPopupContent.insertAdjacentHTML('beforeend',
      `<span id="close-general-popup" class="close-btn">&times;</span>
            <h2>Statistics</h2>
            <div class="stats-container">
              <div class="stats-item">
                <p class="stats-value">${gamesPlayed}</p>
                <p class="stats-label">Games Played</p>
              </div>
              <div class="stats-item">
                <p class="stats-value">${gamesWon}</p>
                <p class="stats-label">Games Won</p>
              </div>
              <div class="stats-item">
                <p class="stats-value">${winPercentage}%</p>
                <p class="stats-label">Win Percentage</p>
              </div>
              <div class="stats-item">
                <p class="stats-value">${currentStreak}</p>
                <p class="stats-label">Current Streak</p>
              </div>
              <div class="stats-item">
                <p class="stats-value">${maxStreak}</p>
                <p class="stats-label">Max Streak</p>
              </div>
            </div>
            <div id="guessDistribution" class="guess-distribution">
            <h3>Guesses</h3></div>`);

    createGuessDistribution(guessesPerDay);
  }

  document.getElementById('close-general-popup').addEventListener('click', closeGeneralPopup);
}

function createGuessDistribution(guessesPerDay) {
  const totalGuesses = Object.values(guessesPerDay).reduce((acc, category) => {
    return acc + Object.values(category).length;
  }, 0);

  const guessCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 };
  Object.values(guessesPerDay).forEach(category => {
    Object.values(category).forEach(guess => {
      guessCounts[guess]++;
    });
  });

  const percentages = totalGuesses === 0
    ? Object.keys(guessCounts).map(() => 0)
    : Object.keys(guessCounts).map(key => (guessCounts[key] / totalGuesses) * 100);

  const guessDistribution = document.getElementById('guessDistribution');
  const labels = ['1 Guess', '2 Guesses', '3 Guesses', '4 Guesses', '5 Guesses', '6 Guesses', 'Failed (X)'];
  const colors = ['#1cc88a', '#66c2a5', '#a6d96a', '#fdae61', '#f46d43', '#d73027', '#a50026'];

  labels.forEach((label, index) => {
    const key = label === 'Failed (X)' ? 'X' : (index + 1).toString();
    const percentage = percentages[index];
    const count = guessCounts[key];
    const color = colors[index];
    guessDistribution.insertAdjacentHTML('beforeend', `
      <div class="guess-bar">
        <span>${label}</span>
        <div class="bar-container">
          <div class="bar" style="width: ${percentage}%; background-color: ${color};">
            <span class="count">${count}</span>
          </div>
        </div>
        <span class="percentage">${percentage.toFixed(2)}%</span>
      </div>
    `);
  });
}

function cheersKofiButton() {
  const kofiButton = document.querySelector("#kofi-button");
  kofiButton.innerHTML = `<img id="cheer1" src="/assets/images/kofi_symbol.png" alt="Ko-fi logo">
                            <img id="cheer2" src="/assets/images/kofi_symbol.png" alt="Ko-fi logo">
                            Cheers!`;
  let styleSheet = document.styleSheets[1];

  for (let i = 0; i < styleSheet.cssRules.length; i++) {
    if (styleSheet.cssRules[i].selectorText === '.popup-content #kofi-button::after') {
      styleSheet.deleteRule(i);
      break;
    }
  }

  styleSheet.insertRule(`
                        .popup-content #kofi-button::after {
                          content: '';
                        }
                        `, styleSheet.cssRules.length);
}

document.getElementById('general-popup').addEventListener('click', function (event) {
  if (event.target === document.getElementById('general-popup')) {
    closeGeneralPopup();
  }
});

document.querySelector('#info').addEventListener('click', function (event) {
  event.preventDefault();
  setupGeneralPopup("info");
  openGeneralPopup();
});

document.querySelector('#stats').addEventListener('click', function (event) {
  event.preventDefault();
  setupGeneralPopup("stats");
  openGeneralPopup();
});

document.querySelector('#contact').addEventListener('click', function (event) {
  event.preventDefault();
  setupGeneralPopup("contact");
  openGeneralPopup();
});