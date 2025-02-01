import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-analytics.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

//IIFE
(() => {

  window.addEventListener('DOMContentLoaded', gameLoop);

  function gameLoop() {
    let debounceTimeout;
    const btn = document.getElementById('cue-btn');
    let svgIcon = document.querySelector(".search-box svg");
    let searchBox = document.querySelector(".search-box input");
    const guessBoxes = document.querySelectorAll(".guess-box");
    let currentGuess = 0;
    let cueCounter = 0;

    let holdTimer = null;
    let elapsedTime = 0;
    let displayTime = document.querySelector(".timer p");

    const firebaseConfig = {
      apiKey: "AIzaSyAdgvlWm6mChNMoRDfau2k32miZloeB2XQ",
      authDomain: "recuedle.firebaseapp.com",
      databaseURL: "https://recuedle-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "recuedle",
      storageBucket: "recuedle.firebasestorage.app",
      messagingSenderId: "385862426129",
      appId: "1:385862426129:web:3922172756a04d48515bb0",
      measurementId: "G-2P95Q8TKGN"
    };

    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);

    const database = getDatabase(app);

    const dbRef = ref(database, `/dailySong`);

    init();

    document.getElementById("tryAnotherDecade").addEventListener("click", function () {
      window.location.href = '../../';
    });

    document.getElementById("tryAnotherDecade").addEventListener("click", function () {
      window.location.href = '../../'
    });

    document.getElementById("shareResults").addEventListener("click", function () {
      const category = getCategoryFromFilename();
      const resultsText = shareResults(category);

      if (window.innerWidth <= 768) {
        if (navigator.share) {
          navigator.share({
            title: 'ReCuedle Results',
            text: resultsText
          }).then(() => {
            console.log('Results shared successfully');
          }).catch((error) => {
            console.error('Error sharing results:', error);
          });
        } else {
          console.warn('Web Share API is not supported in this browser.');
          navigator.clipboard.writeText(resultsText).then(() => {
            console.log('Results copied to clipboard');
            showCopyPopup();
          }).catch((error) => {
            console.error('Error copying results to clipboard:', error);
          });
        }
      } else {
        navigator.clipboard.writeText(resultsText).then(() => {
          console.log('Results copied to clipboard');
          showCopyPopup();
        }).catch((error) => {
          console.error('Error copying results to clipboard:', error);
        });
      }
    });

    document.getElementById('homeButton').addEventListener('click', function () {
      window.location.href = '../../';
    });

    // function init() {
    //   if (!iframeElement) {
    //     console.error('Iframe element not found!');
    //     return;
    //   }

    //   const widget = SC.Widget(iframeElement);

    //   widget.bind(SC.Widget.Events.READY, function () {
    //     widget.getCurrentSound(function (track) {
    //       if (track) {
    //         const songInfoElement = document.querySelector('.song-info');
    //         if (songInfoElement) {
    //           songInfoElement.textContent = `${track.title} - ${track.user.username}`;
    //           // console.log(`${track.title} & ${track.user.username}`);
    //         }
    //       }
    //     });
    //   });
    // }

    function init() {
      const today = new Date().toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });

      const savedDate = localStorage.getItem('savedDate');

      if (savedDate !== today) {
        localStorage.removeItem('seventies-currentGuess');
        localStorage.removeItem('seventies-skippedGuesses');
        localStorage.removeItem('seventies-answeredGuesses');
        localStorage.removeItem('eighties-currentGuess');
        localStorage.removeItem('eighties-skippedGuesses');
        localStorage.removeItem('eighties-answeredGuesses');
        localStorage.removeItem('nineties-currentGuess');
        localStorage.removeItem('nineties-skippedGuesses');
        localStorage.removeItem('nineties-answeredGuesses');
        localStorage.removeItem('zeroes-currentGuess');
        localStorage.removeItem('zeroes-skippedGuesses');
        localStorage.removeItem('zeroes-answeredGuesses');
        localStorage.removeItem('2010s-currentGuess');
        localStorage.removeItem('2010s-skippedGuesses');
        localStorage.removeItem('2010s-answeredGuesses');
        localStorage.removeItem('2020s-currentGuess');
        localStorage.removeItem('2020s-skippedGuesses');
        localStorage.removeItem('2020s-answeredGuesses');
        localStorage.setItem('savedDate', today);
      }

      scheduleMidnightReload();

      loadState();
      loadStats();

      // if (!document.cookie.includes(`cookies_accepted=true`)) {
      //   openWarning();
      // } else {
      loadSoundCloudEmbed();
      // }

      async function loadSoundCloudEmbed() {
        const category = getCategoryFromFilename();
        let currentDate = new Date(today.split('-').reverse().join('-'));

        try {
          while (true) {
            const formattedDate = currentDate.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const snapshot = await get(ref(database, `/dailySong/${formattedDate}/${category}`));

            if (snapshot.exists()) {
              const song = snapshot.val();

              const iframe = document.querySelector("iframe");
              iframe.width = "100%";
              iframe.height = "166";
              iframe.scrolling = "no";
              iframe.frameborder = "no";
              iframe.allow = "autoplay";
              iframe.src = `https://w.soundcloud.com/player/?url=${decodeURIComponent(song.soundcloudUrl)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&hide_title=true&hide_artwork=false&visual=false&buying=false&liking=false&sharing=false&download=false`;

              const songInfoElement = document.querySelector('.song-info');
              if (songInfoElement) {
                songInfoElement.textContent = `${song.title} - ${song.artist}`;
              }
              return;
            }

            console.error(`No song data found for ${formattedDate}, checking previous day...`);
            currentDate.setDate(currentDate.getDate() - 1);
          }
        } catch (error) {
          console.error('Error fetching song data:', error);
        }
      }
    }

    const iframeElement = document.querySelector("iframe");

    function playSong() {
      const widget = SC.Widget(iframeElement);

      widget.setVolume(50);

      widget.play();

      widget.getDuration(function (duration) {
        const maxDurationInSeconds = Math.floor(duration / 1000);
        clearHoldTimer();

        holdTimer = setInterval(() => {
          if (elapsedTime < maxDurationInSeconds) {
            elapsedTime++;
            updateTimerDisplay();
          } else {
            clearHoldTimer();
          }
        }, 1000);
      });
    }

    function openPopup() {
      const popup = document.getElementById('popup');
      popup.style.display = 'flex';
    }

    function closePopup() {
      const popup = document.getElementById('popup');
      popup.style.display = 'none';
    }

    document.getElementById('close-popup').addEventListener('click', closePopup);

    document.getElementById('popup').addEventListener('click', function (event) {
      if (event.target === document.getElementById('popup')) {
        closePopup();
      }
    });

    function openWarning() {
      const popup = document.getElementById('warning-popup');
      popup.style.display = 'flex';
    }

    function showCopyPopup() {
      const popup = document.getElementById('copy-popup');

      popup.style.display = 'block';
      setTimeout(() => {
        popup.style.opacity = 1;
        popup.style.transform = 'translateY(0)';
      }, 10);

      setTimeout(() => {
        popup.style.opacity = 0;
        popup.style.transform = 'translateY(10px)';
      }, 3000);
    }

    function scheduleMidnightReload() {
      const now = new Date();

      const nextMidnight = new Date(now);
      nextMidnight.setHours(0, 0, 0, 0);
      nextMidnight.setDate(nextMidnight.getDate() + 1);

      const timeUntilMidnight = nextMidnight - now;

      console.log(`Page will reload in ${timeUntilMidnight / 1000} seconds`);

      setTimeout(() => {
        window.location.reload();
      }, timeUntilMidnight);
    }

    function onCorrectGuess() {
      saveState();
      const closePopup = document.getElementById("close-popup");
      closePopup.insertAdjacentHTML('afterend', `<h2>Amazing🎉</h2>
            <p>You have done it again, constantly raising the bar for us all - and doing it flawlessly.</p>`);

      for (let i = 0; i < guessBoxes.length; i++) {
        guessBoxes[i].classList.remove("search-box");
        guessBoxes[i].classList.add("guess-box");
      }

      // guessBoxes[currentGuess].classList.remove("search-box");
      // guessBoxes[currentGuess].classList.add("guess-box");
      btn.disabled = true;
      btn.classList.add("disabled-btn");
      openPopup();
      saveStats();
    }

    function onLastWrongGuess() {
      const closePopup = document.getElementById("close-popup");
      closePopup.insertAdjacentHTML('afterend', `<h2>Failed❌</h2>
            <p>Better luck next time! The song was:</p>`);
      saveState();
      openPopup();
      saveStats();
    }

    function updateTimerDisplay() {
      const minutes = Math.floor(elapsedTime / 60);
      const seconds = elapsedTime % 60;
      displayTime.textContent = `Time: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    function resetTimer() {
      elapsedTime = 0;
      updateTimerDisplay();
    }

    function clearHoldTimer() {
      if (holdTimer) {
        clearInterval(holdTimer);
        holdTimer = null;
      }
    }

    function resetButton() {
      btn.classList.remove("disabled-btn");
      btn.disabled = false;
      resetTimer();
    }

    function loadState() {
      const category = getCategoryFromFilename();
      const savedCurrentGuess = localStorage.getItem(`${category}-currentGuess`);
      const skippedGuesses = JSON.parse(localStorage.getItem(`${category}-skippedGuesses`)) || [];
      const answeredGuesses = JSON.parse(localStorage.getItem(`${category}-answeredGuesses`)) || [];
      let foundCorrectAnswer = false;

      if (savedCurrentGuess) {
        currentGuess = parseInt(savedCurrentGuess, 10);

        for (let i = 0; i < currentGuess + 1; i++) {
          if (skippedGuesses.some(item => item.index === i)) {
            guessBoxes[i].innerHTML = "SKIP ❌";
            guessBoxes[i].classList.remove("search-box");
            guessBoxes[i].classList.add("guess-box");
          } else {
            const answered = answeredGuesses.find(item => item.id === `answered-${i}`);
            if (answered) {
              guessBoxes[i].innerHTML = `${answered.guess} ${answered.correct ? '✅' : '❌'}`;
              guessBoxes[i].classList.add(answered.correct ? 'correct' : 'incorrect');
              guessBoxes[i].classList.remove("search-box");
              guessBoxes[i].classList.add("guess-box");

              if (answered.correct) {
                foundCorrectAnswer = true;
              }
            } else {
              if (!(foundCorrectAnswer || currentGuess === 6)) {
                guessBoxes[currentGuess].innerHTML = `
                <input type="text" id="search-box" autocomplete="off" placeholder="Search for the song...">
                <svg fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 7v10l7-5zm9 10V7h-2v10z"></path>
                </svg>
                <div id="suggestions" class="suggestions-dropdown"></div>`;

                guessBoxes[i].classList.remove("guess-box");
                guessBoxes[i].classList.add("search-box");


                const newSearchBox = document.getElementById('search-box');
                if (newSearchBox) {
                  newSearchBox.addEventListener('input', function () {
                    const suggestionsDiv = document.getElementById('suggestions');
                    clearTimeout(debounceTimeout);
                    debounceTimeout = setTimeout(() => {
                      const query = this.value.trim();
                      if (query.length > 0) {
                        fetchCSV(getCategoryFromFilename()).then(songs => {
                          const results = searchSongs(query, songs);
                          displaySuggestions(results);
                          suggestionsDiv.style.display = 'block';
                        });
                      } else {
                        suggestionsDiv.innerHTML = '';
                        suggestionsDiv.style.display = 'none';
                      }
                    }, 300);
                  });
                } else {
                  console.error("Search box element not found!");
                }

                svgIcon = document.querySelector(".search-box svg");
                svgIcon.removeEventListener("click", () => {
                  skipGuess();
                });
                svgIcon.addEventListener("click", () => {
                  skipGuess();
                });
                resetButton();
              }
            }
          }
        }
      }
      if (foundCorrectAnswer) {
        onCorrectGuess();
      } else if (currentGuess === 6) {
        onLastWrongGuess();
      }
    }

    function saveState() {
      const category = getCategoryFromFilename();
      localStorage.setItem(`${category}-currentGuess`, currentGuess);

      const skippedGuesses = [];
      const answeredGuesses = [];

      for (let i = 0; i < currentGuess; i++) {
        if (guessBoxes[i].innerHTML.includes("SKIP")) {
          skippedGuesses.push({ id: `skip-${i}`, index: i }); // Track skipped guesses
        } else {
          const span = guessBoxes[i].querySelector('span');
          const guessContent = span ? span.textContent.trim() : guessBoxes[i].textContent.trim();
          const isCorrect = guessContent.includes('✅');
          answeredGuesses.push({
            id: `answered-${i}`,
            guess: guessContent.replace('✅', '').replace('❌', '').trim(),
            correct: isCorrect
          });
        }
      }

      localStorage.setItem(`${category}-skippedGuesses`, JSON.stringify(skippedGuesses));
      localStorage.setItem(`${category}-answeredGuesses`, JSON.stringify(answeredGuesses));
    }

    function loadStats() {
      const gamesPlayed = JSON.parse(localStorage.getItem('gamesPlayed')) || 0;
      const gamesWon = JSON.parse(localStorage.getItem('gamesWon')) || 0;
      const maxStreak = JSON.parse(localStorage.getItem('maxStreak')) || 0;
      const currentStreak = JSON.parse(localStorage.getItem('currentStreak')) || maxStreak;
      const winPercentage = gamesPlayed === 0 ? 0 : ((gamesWon / gamesPlayed) * 100).toFixed(2);

      const guessesPerDay = JSON.parse(localStorage.getItem('guessesPerDay')) || {};

      const guessCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, X: 0 };
      Object.values(guessesPerDay).forEach(category => {
        Object.values(category).forEach(guess => {
          guessCounts[guess]++;
        });
      });

      console.log(`Games Played: ${gamesPlayed}`);
      console.log(`Games Won: ${gamesWon}`);
      console.log(`Win Percentage: ${winPercentage}%`);
      console.log(`Current Streak: ${currentStreak}`);
      console.log(`Max Streak: ${maxStreak}`);
      console.log(`Guess Distribution:`);
      console.log(`1 Guess: ${guessCounts[1]}`);
      console.log(`2 Guesses: ${guessCounts[2]}`);
      console.log(`3 Guesses: ${guessCounts[3]}`);
      console.log(`4 Guesses: ${guessCounts[4]}`);
      console.log(`5 Guesses: ${guessCounts[5]}`);
      console.log(`6 Guesses: ${guessCounts[6]}`);
      console.log(`Failed (X): ${guessCounts.X}`);
    }

    function saveStats() {
      const category = getCategoryFromFilename();
      const today = new Date().toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });

      const guessesPerDay = JSON.parse(localStorage.getItem('guessesPerDay')) || {};

      // Check if the game has already been completed for today
      if (guessesPerDay[category] && guessesPerDay[category][today]) {
        return;
      }

      localStorage.setItem(`${category}-currentGuess`, currentGuess);

      const skippedGuesses = [];
      const answeredGuesses = [];
      let foundCorrectAnswer = false;

      for (let i = 0; i < currentGuess; i++) {
        if (guessBoxes[i].innerHTML.includes("SKIP")) {
          skippedGuesses.push({ id: `skip-${i}`, index: i }); // Track skipped guesses
        } else {
          const span = guessBoxes[i].querySelector('span');
          const guessContent = span ? span.textContent.trim() : guessBoxes[i].textContent.trim();
          const isCorrect = guessContent.includes('✅');
          answeredGuesses.push({
            id: `answered-${i}`,
            guess: guessContent.replace('✅', '').replace('❌', '').trim(),
            correct: isCorrect
          });
          if (isCorrect) {
            foundCorrectAnswer = true;
          }
        }
      }

      localStorage.setItem(`${category}-skippedGuesses`, JSON.stringify(skippedGuesses));
      localStorage.setItem(`${category}-answeredGuesses`, JSON.stringify(answeredGuesses));

      // Save the number of guesses it took per category per day
      if (!guessesPerDay[category]) {
        guessesPerDay[category] = {};
      }

      guessesPerDay[category][today] = foundCorrectAnswer ? (currentGuess <= 6 ? currentGuess : 'X') : 'X';
      localStorage.setItem('guessesPerDay', JSON.stringify(guessesPerDay));

      let gamesPlayed = JSON.parse(localStorage.getItem('gamesPlayed')) || 0;
      let gamesWon = JSON.parse(localStorage.getItem('gamesWon')) || 0;
      let currentStreak = JSON.parse(localStorage.getItem('currentStreak')) || 0;
      let maxStreak = JSON.parse(localStorage.getItem('maxStreak')) || 0;
      const lastPlayedDate = localStorage.getItem('lastPlayedDate');

      gamesPlayed++;
      if (foundCorrectAnswer) {
        gamesWon++;
        if (lastPlayedDate) {
          const lastDate = new Date(lastPlayedDate);
          const currentDate = new Date(today);
          const timeDiff = currentDate.getTime() - lastDate.getTime();
          const dayDiff = timeDiff / (1000 * 3600 * 24);

          if (dayDiff === 1) {
            currentStreak++;
          } else {
            currentStreak = 1;
          }
        } else {
          currentStreak = 1;
        }

        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
      }

      const winPercentage = gamesPlayed === 0 ? 0 : ((gamesWon / gamesPlayed) * 100).toFixed(2);

      localStorage.setItem('gamesPlayed', JSON.stringify(gamesPlayed));
      localStorage.setItem('gamesWon', JSON.stringify(gamesWon));
      localStorage.setItem('winPercentage', JSON.stringify(winPercentage));
      localStorage.setItem('currentStreak', JSON.stringify(currentStreak));
      localStorage.setItem('maxStreak', JSON.stringify(maxStreak));
      localStorage.setItem('lastPlayedDate', today);
      console.log(currentStreak);
    }

    if (currentGuess === 0) {
      guessBoxes[0].innerHTML = `
  <input type="text" id="search-box" autocomplete="off" placeholder="Search for the song...">
  <svg fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 7v10l7-5zm9 10V7h-2v10z"></path>
  </svg>
  <div id="suggestions" class="suggestions-dropdown"></div>`;
      guessBoxes[0].classList.remove("guess-box");
      guessBoxes[0].classList.add("search-box");
      svgIcon = document.querySelector(".search-box svg");
      svgIcon.removeEventListener("click", () => {
        skipGuess();
      });
      svgIcon.addEventListener("click", () => {
        skipGuess();
      });
    }

    function skipGuess() {
      const iframeElement = document.querySelector("iframe");
      const widget = SC.Widget(iframeElement);

      widget.pause();
      widget.seekTo(0);

      cueCounter = 0;
      btn.innerText = "CUE";

      clearHoldTimer();

      widget.pause();
      widget.seekTo(0);

      if (holdTimer) {
        clearInterval(holdTimer);
        holdTimer = null;
      }

      if (currentGuess < guessBoxes.length) {
        if (currentGuess === 0) {
          const firstSearchBox = document.querySelector(".search-box");
          firstSearchBox.innerHTML = "SKIP ❌";
          firstSearchBox.classList.add("guess-box");
          firstSearchBox.classList.remove("search-box");
        } else if (currentGuess === 5) {
          const lastSearchBox = document.querySelector(".search-box");
          lastSearchBox.innerHTML = "SKIP ❌";
          lastSearchBox.classList.add("guess-box");
          lastSearchBox.classList.remove("search-box");
        } else {
          guessBoxes[currentGuess].innerHTML = "SKIP ❌";
          guessBoxes[currentGuess].classList.remove("search-box");
          guessBoxes[currentGuess].classList.add("guess-box");
        }

        currentGuess++;
        saveState();

        if (currentGuess < guessBoxes.length) {
          const nextGuessBox = guessBoxes[currentGuess];
          nextGuessBox.innerHTML = `
  <input type="text" id="search-box" autocomplete="off" placeholder="Search for the song...">
  <svg fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 7v10l7-5zm9 10V7h-2v10z"></path>
  </svg>
  <div id="suggestions" class="suggestions-dropdown"></div>`;
          nextGuessBox.classList.remove("guess-box");
          nextGuessBox.classList.add("search-box");

          const newSearchBox = document.getElementById('search-box');
          newSearchBox.addEventListener('input', function () {
            const suggestionsDiv = document.getElementById('suggestions');
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
              const query = this.value.trim();

              if (query.length > 0) {
                fetchCSV(getCategoryFromFilename()).then(songs => {
                  const results = searchSongs(query, songs);
                  displaySuggestions(results);
                  suggestionsDiv.style.display = 'block';
                });
              } else {
                suggestionsDiv.innerHTML = '';
                suggestionsDiv.style.display = 'none';
              }
            }, 300);
          });

          svgIcon = document.querySelector(".search-box svg");
          svgIcon.removeEventListener("click", () => {
            skipGuess();
          });
          svgIcon.addEventListener("click", () => {
            skipGuess();
          });
          resetButton();
        }

        if (currentGuess === guessBoxes.length) {
          btn.disabled = true;
          btn.classList.add("disabled-btn");
          onLastWrongGuess();
        }
      }
    }

    function getCategoryFromFilename() {
      const path = window.location.pathname;
      const category = path.split('/').slice(-2, -1)[0];
      return category;
    }

    function getCSVFilePath(category) {
      switch (category) {
        case 'seventies':
          return '../../data/songs/seventies_songs.csv';
        case 'eighties':
          return '../../data/songs/eighties_songs.csv';
        case 'nineties':
          return '../../data/songs/nineties_songs.csv';
        case 'zeroes':
          return '../../data/songs/zeroes_songs.csv';
        case '2010s':
          return '../../data/songs/2010s_songs.csv';
        case '2020s':
          return '../../data/songs/2020s_songs.csv';
        default:
          return null;
      }
    }

    async function fetchCSV(category) {
      const csvFilePath = getCSVFilePath(category);

      return fetch(csvFilePath)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to load CSV file');
          }
          return response.text();
        })
        .then(csvData => parseCSV(csvData))
        .catch(error => {
          console.error('Error fetching CSV:', error);
        });
    }

    function parseCSV(csvData) {
      const rows = csvData.trim().split('\n');

      const songs = rows.slice(1).map(row => {
        const [title, artist] = row.split(';');
        if (!title || !artist) {
          console.warn(`Skipping invalid row: ${row}`);
          return null;  // Skip invalid rows
        }
        return { title, artist };
      }).filter(song => song !== null);  // Remove null entries from the array

      return songs;
    }

    async function fetchSongs(category) {
      const today = new Date().toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });

      let currentDate = new Date(today.split('-').reverse().join('-'));

      try {
        while (true) {
          const formattedDate = currentDate.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
          const snapshot = await get(ref(database, `/dailySong/${formattedDate}/${category}`));

          if (snapshot.exists()) {
            const song = snapshot.val();
            return [song];
          }

          console.error(`No songs found for ${category} on ${formattedDate}, checking previous day...`);
          currentDate.setDate(currentDate.getDate() - 1);
        }
      } catch (error) {
        console.error('Error fetching songs from Firebase:', error);
        return [];
      }
    }


    function searchSongs(query, songs) {
      return songs.filter(song =>
        song.title.toLowerCase().includes(query.toLowerCase()) ||
        song.artist.toLowerCase().includes(query.toLowerCase())
      );
    }

    document.getElementById('search-box').addEventListener('input', function () {
      const suggestionsDiv = document.getElementById('suggestions');

      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        const query = this.value.trim();

        if (query.length > 0) {
          fetchCSV(getCategoryFromFilename()).then(songs => {
            const results = searchSongs(query, songs);
            displaySuggestions(results);
            suggestionsDiv.style.display = 'block';
          });
        } else {
          suggestionsDiv.innerHTML = '';
          suggestionsDiv.style.display = 'none';
        }
      }, 300);
    });

    function displaySuggestions(results) {
      const suggestionsDiv = document.getElementById('suggestions');
      suggestionsDiv.innerHTML = '';

      if (results.length > 0) {
        results.forEach(result => {
          const suggestionItem = document.createElement('div');
          suggestionItem.classList.add('suggestion-item');
          suggestionItem.textContent = `${result.title} - ${result.artist}`;

          suggestionItem.addEventListener('click', function () {
            const searchBox = document.getElementById('search-box');
            searchBox.value = `${result.title} - ${result.artist}`;
            suggestionsDiv.style.display = 'none';

            checkGuess(result);
          });

          suggestionsDiv.appendChild(suggestionItem);
        });
      } else {
        suggestionsDiv.innerHTML = '<div class="no-results">No results found</div>';
      }
    }

    // function getCurrentSong() {
    //   return new Promise((resolve, reject) => {
    //     const widget = SC.Widget(iframeElement);

    //     widget.getCurrentSound(function (track) {
    //       if (track) {
    //         resolve(track.title + " - " + track.user.username);
    //       } else {
    //         reject('No track found');
    //       }
    //     });
    //   });
    // }

    async function checkGuess(selectedSong) {
      try {
        const category = getCategoryFromFilename();
        const songs = await fetchSongs(category);
        const currentSong = songs[0];

        const completeSelectedSong = `${selectedSong.title} - ${selectedSong.artist.trim()}`;
        const actualSong = `${currentSong.title} - ${currentSong.artist}`;

        if (completeSelectedSong.toLowerCase() === actualSong.toLowerCase()) {
          handleGuess(completeSelectedSong, actualSong);
          onCorrectGuess();
        } else {
          handleGuess(completeSelectedSong, actualSong);
        }
      } catch (error) {
        console.error('Error fetching current song:', error);
      }
    }

    function handleGuess(userGuess, song) {
      const isCorrect = userGuess.toLowerCase() === song.toLowerCase();

      if (currentGuess < guessBoxes.length) {

        guessBoxes[currentGuess].innerHTML = `
      <span>${userGuess} ${isCorrect ? '✅' : '❌'}</span>
    `;
        guessBoxes[currentGuess].classList.add('guess-box');
        guessBoxes[currentGuess].classList.remove('search-box');
        guessBoxes[currentGuess].classList.add(isCorrect ? 'correct' : 'incorrect');

        if (!isCorrect) {
          currentGuess++;
          saveState();

          if (currentGuess < guessBoxes.length) {
            const nextGuessBox = guessBoxes[currentGuess];
            nextGuessBox.innerHTML = `
  <input type="text" id="search-box" autocomplete="off" placeholder="Search for the song...">
  <svg fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 7v10l7-5zm9 10V7h-2v10z"></path>
  </svg>
  <div id="suggestions" class="suggestions-dropdown"></div>`;
            nextGuessBox.classList.remove("guess-box");
            nextGuessBox.classList.add("search-box");

            const newSearchBox = document.getElementById('search-box');
            newSearchBox.addEventListener('input', function () {
              const suggestionsDiv = document.getElementById('suggestions');
              clearTimeout(debounceTimeout);
              debounceTimeout = setTimeout(() => {
                const query = this.value.trim();

                if (query.length > 0) {
                  fetchCSV(getCategoryFromFilename()).then(songs => {
                    const results = searchSongs(query, songs);
                    displaySuggestions(results);
                    suggestionsDiv.style.display = 'block';
                  });
                } else {
                  suggestionsDiv.innerHTML = '';
                  suggestionsDiv.style.display = 'none';
                }
              }, 300);
            });

            svgIcon = document.querySelector(".search-box svg");
            svgIcon.removeEventListener("click", () => {
              skipGuess();
            });
            svgIcon.addEventListener("click", () => {
              skipGuess();
            });
            resetButton();
          }
        }
        else {
          currentGuess++;
          saveState();
        }

        if (currentGuess === guessBoxes.length && !isCorrect) {
          btn.disabled = true;
          btn.classList.add('disabled-btn');
          onLastWrongGuess();
        }
      }

    }

    function shareResults(category) {
      const savedCurrentGuess = localStorage.getItem(`${category}-currentGuess`);
      const skippedGuesses = JSON.parse(localStorage.getItem(`${category}-skippedGuesses`)) || [];
      const answeredGuesses = JSON.parse(localStorage.getItem(`${category}-answeredGuesses`)) || [];
      const date = new Date().toLocaleDateString();
      const categoryElement = document.querySelector(".timer h2").innerHTML;
      let results = [];
      let foundCorrectAnswer = false;

      // Check if the browser is in dark mode
      const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const skipEmoji = isDarkMode ? '⬜' : '⬛';

      if (savedCurrentGuess) {
        const currentGuess = parseInt(savedCurrentGuess, 10);

        for (let i = 0; i < currentGuess; i++) {
          if (skippedGuesses.some(item => item.index === i)) {
            results.push(skipEmoji);
          } else {
            const answered = answeredGuesses.find(item => item.id === `answered-${i}`);
            if (answered) {
              results.push(answered.correct ? '✅' : '❌');
              if (answered.correct) {
                foundCorrectAnswer = true;
              }
            } else {
              results.push(skipEmoji);
            }
          }
        }
      }

      while (results.length < 6) {
        results.push(skipEmoji);
      }

      const resultsString = results.join('');
      const finalEmoji = foundCorrectAnswer ? '🎉' : '😞';
      return `ReCuedle - ${categoryElement} - ${date}\n\n${finalEmoji} ${resultsString}\n\n#ReCuedle @ReCuedle https://recuedle.com`;
    }

    document.addEventListener('click', function (event) {
      const searchBox = document.getElementById('search-box');
      const suggestionsDiv = document.getElementById('suggestions');

      if (!searchBox.contains(event.target) && !suggestionsDiv.contains(event.target)) {
        suggestionsDiv.style.display = 'none';
      }
    });

    // btn.addEventListener("mousedown", () => {
    //   btn.classList.add("active");
    //   playSong();
    // });

    // btn.addEventListener("mouseup", () => {
    //   btn.classList.remove("active");
    //   btn.classList.add("disabled-btn");
    //   btn.disabled = true;

    //   const iframeElement = document.querySelector("iframe");
    //   const widget = SC.Widget(iframeElement);

    //   widget.pause();
    //   widget.seekTo(0);

    //   if (holdTimer) {
    //     clearInterval(holdTimer);
    //     holdTimer = null;
    //   }
    // });

    btn.addEventListener("click", () => {
      cueCounter++;
      if (cueCounter === 1) {
        btn.classList.add("active");
        btn.innerText = "PAUSE";
        playSong();
      } else {
        cueCounter = 0;
        btn.classList.remove("active");
        btn.classList.add("disabled-btn");
        btn.disabled = true;
        btn.innerText = "CUE";

        const iframeElement = document.querySelector("iframe");
        const widget = SC.Widget(iframeElement);

        widget.pause();
        widget.seekTo(0);

        clearHoldTimer();
      }
    });

    // btn.addEventListener("touchstart", () => {
    //   btn.classList.add("active");
    //   playSong();
    // });

    // btn.addEventListener("touchend", () => {
    //   btn.classList.remove("active");
    //   btn.classList.add("disabled-btn");
    //   btn.disabled = true;

    //   const iframeElement = document.querySelector("iframe");
    //   const widget = SC.Widget(iframeElement);

    //   widget.pause();
    //   widget.seekTo(0);

    //   if (holdTimer) {
    //     clearInterval(holdTimer);
    //     holdTimer = null;
    //   }
    // });

    // document.getElementById('main-title').addEventListener('click', function () {
    //   localStorage.clear();

    //   location.reload();
    // });

    document.getElementById("tryAnotherDecade").addEventListener("click", function () {
      window.location.href = '../../'
    });

    document.getElementById("shareResults").addEventListener("click", function () {
      const category = getCategoryFromFilename();
      const resultsText = shareResults(category);

      if (window.innerWidth <= 768) {
        if (navigator.share) {
          navigator.share({
            title: 'ReCuedle Results',
            text: resultsText
          }).then(() => {
            console.log('Results shared successfully');
          }).catch((error) => {
            console.error('Error sharing results:', error);
          });
        } else {
          console.warn('Web Share API is not supported in this browser.');
          navigator.clipboard.writeText(resultsText).then(() => {
            console.log('Results copied to clipboard');
            showCopyPopup();
          }).catch((error) => {
            console.error('Error copying results to clipboard:', error);
          });
        }
      } else {
        navigator.clipboard.writeText(resultsText).then(() => {
          console.log('Results copied to clipboard');
          showCopyPopup();
        }).catch((error) => {
          console.error('Error copying results to clipboard:', error);
        });
      }
    });

    document.getElementById('homeButton').addEventListener('click', function () {
      window.location.href = '../../';
    });

  }
})();
