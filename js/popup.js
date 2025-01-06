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
    // const gamesPlayed = JSON.parse(localStorage.getItem('gamesPlayed')) || 0;
    // const gamesWon = JSON.parse(localStorage.getItem('gamesWon')) || 0;
    // const winPercentage = JSON.parse(localStorage.getItem('winPercentage')) || 0;
    // const currentStreak = JSON.parse(localStorage.getItem('currentStreak')) || 0;
    // const maxStreak = JSON.parse(localStorage.getItem('maxStreak')) || 0;

    // generalPopupContent.insertAdjacentHTML('beforeend',
    //   `<span id="close-general-popup" class="close-btn">&times;</span>
    //         <h2>Statistics</h2>
    //         <p>Games Played: ${gamesPlayed}</p>
    //         <p>Games Won: ${gamesWon}</p>
    //         <p>Win Percentage: ${winPercentage}%</p>
    //         <p>Current Streak: ${currentStreak}</p>
    //         <p>Max Streak: ${maxStreak}</p>
    //         <canvas id="winChart" width="500" height="500"></canvas>`);
    // createBarChart(gamesPlayed, gamesWon);

    generalPopupContent.insertAdjacentHTML('beforeend',
      `<span id="close-general-popup" class="close-btn">&times;</span>
            <h2>Under construction🚧</h2>
            <p>Statistics are currently under construction. Please check back later.</p>`);
  }

  document.getElementById('close-general-popup').addEventListener('click', closeGeneralPopup);
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

function createBarChart(gamesPlayed, gamesWon) {
  const ctx = document.getElementById('winChart').getContext('2d');
  new Chart(ctx, {
      type: 'bar',
      data: {
          labels: ['Games Played', 'Games Won'],
          datasets: [{
              label: 'Win Distribution',
              data: [gamesPlayed, gamesWon],
              backgroundColor: ['#4e73df', '#1cc88a'],
              borderColor: ['#4e73df', '#1cc88a'],
              borderWidth: 1
          }]
      },
      options: {
          responsive: true,
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  });
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