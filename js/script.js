//IIFE
(() => {

  //window.addEventListener('load', loadState);
  window.addEventListener('load', init);

  const iframeElement = document.querySelector("iframe");
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

  function init() {
    if (!iframeElement) {
      console.error('Iframe element not found!');
      return;
    }

    const widget = SC.Widget(iframeElement);

    widget.bind(SC.Widget.Events.READY, function () {
      widget.getCurrentSound(function (track) {
        if (track) {
          const songInfoElement = document.querySelector('.song-info');
          if (songInfoElement) {
            songInfoElement.textContent = `${track.title} - ${track.user.username}`;
            // console.log(`${track.title} & ${track.user.username}`);
          }
        }
      });
    });
  }

  function playSong() {
    const widget = SC.Widget(iframeElement);

    widget.setVolume(50);

    widget.play();

    widget.getDuration(function (duration) {
      const maxDurationInSeconds = Math.floor(duration / 1000);

      holdTimer = setInterval(() => {
        if (elapsedTime < maxDurationInSeconds) {
          elapsedTime++;
          updateTimerDisplay();
        } else {
          clearInterval(holdTimer);
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

  function onCorrectGuess() {
    const closePopup = document.getElementById("close-popup");
    closePopup.insertAdjacentHTML('afterend', `<h2>Amazing🎉</h2>
            <p>You have done it again, constantly raising the bar for us all - and doing it flawlessly.</p>`);

    for (let i = 0; i < guessBoxes.length; i++) {
      guessBoxes[i].classList.remove("search-box");
      guessBoxes[i].classList.add("guess-box");
    }

    guessBoxes[currentGuess].classList.remove("search-box");
    guessBoxes[currentGuess].classList.add("guess-box");
    btn.disabled = true;
    btn.classList.add("disabled-btn");
    saveState();
    openPopup();
  }

  function onLastWrongGuess() {
    const closePopup = document.getElementById("close-popup");
    closePopup.insertAdjacentHTML('afterend', `<h2>Failed❌</h2>
            <p>Better luck next time! The song was:</p>`);
    saveState();
    openPopup();
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

  function resetButton() {
    btn.classList.remove("disabled-btn");
    btn.disabled = false;
    resetTimer();
  }

  // function loadState() {
  //   const savedCurrentGuess = localStorage.getItem('currentGuess');
  //   const skippedGuesses = JSON.parse(localStorage.getItem('skippedGuesses')) || [];
  //   const answeredGuesses = JSON.parse(localStorage.getItem('answeredGuesses')) || [];

  //   if (savedCurrentGuess) {
  //     currentGuess = parseInt(savedCurrentGuess, 10);

  //     for (let i = 0; i < currentGuess; i++) {
  //       if (skippedGuesses.some(item => item.index === i)) {
  //         guessBoxes[i].innerHTML = "SKIP ❌";
  //         guessBoxes[i].classList.remove("search-box");
  //         guessBoxes[i].classList.add("guess-box");
  //       } else {
  //         const answered = answeredGuesses.find(item => item.id === `answered-${i}`);
  //         if (answered) {
  //           guessBoxes[i].innerHTML = `${answered.guess} ${answered.correct ? '✅' : '❌'}`;
  //           guessBoxes[i].classList.add(answered.correct ? 'correct' : 'incorrect');
  //           guessBoxes[i].classList.remove("search-box");
  //           guessBoxes[i].classList.add("guess-box");
  //         } else {
  //           guessBoxes[i].innerHTML = `
  //             <input type="text" class="search-input" autocomplete="off" placeholder="Search for the song...">
  //             <svg fill="#000000" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  //               <path d="M7 7v10l7-5zm9 10V7h-2v10z"></path>
  //             </svg>
  //             <div id="suggestions" class="suggestions-dropdown"></div>`;

  //           guessBoxes[i].classList.remove("guess-box");
  //           guessBoxes[i].classList.add("search-box");

  //           const svgIcon = guessBoxes[i].querySelector("svg");
  //           svgIcon.removeEventListener("click", skipGuess);
  //           svgIcon.addEventListener("click", () => {
  //             skipGuess();
  //           });
  //         }
  //       }
  //     }
  //   }
  // }

  function saveState() {
    localStorage.setItem('currentGuess', currentGuess);

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

    localStorage.setItem('skippedGuesses', JSON.stringify(skippedGuesses));
    localStorage.setItem('answeredGuesses', JSON.stringify(answeredGuesses));
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
    const filename = path.split('/').pop();
    const category = filename.split('.')[0];
    return category;
  }

  function getCSVFilePath(category) {
    switch (category) {
      case 'seventies':
        return '../data/songs/seventies_songs.csv';
      case 'eighties':
        return '../data/songs/eighties_songs.csv';
      case 'nineties':
        return '../data/songs/nineties_songs.csv';
      case 'zeroes':
        return '../data/songs/zeroes_songs.csv';
      case '2010s':
        return '../data/songs/2010s_songs.csv';
      case '2020s':
        return '../data/songs/2020s_songs.csv';
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

  function getCurrentSong() {
    return new Promise((resolve, reject) => {
      const widget = SC.Widget(iframeElement);

      widget.getCurrentSound(function (track) {
        if (track) {
          resolve(track.title + " - " + track.user.username);
        } else {
          reject('No track found');
        }
      });
    });
  }

  async function checkGuess(selectedSong) {
    try {
      const currentSong = await getCurrentSong();
      const completeSelectedSong = (selectedSong.title + " - " + selectedSong.artist.trim());

      if (completeSelectedSong.toLowerCase() === currentSong.toLowerCase()) {
        handleGuess(completeSelectedSong, currentSong);
        onCorrectGuess();
      } else {
        handleGuess(completeSelectedSong, currentSong);
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

      if (currentGuess === guessBoxes.length) {
        btn.disabled = true;
        btn.classList.add('disabled-btn');
        onLastWrongGuess();
      }
    }

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

      if (holdTimer) {
        clearInterval(holdTimer);
        holdTimer = null;
      }
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

  document.getElementById('main-title').addEventListener('click', function () {
    localStorage.clear();

    location.reload();
  });

  document.getElementById("tryAnotherDecade").addEventListener("click", function () {
    window.location.href = '../index.html'
  });

  document.getElementById("shareResults").addEventListener("click", function () {
    const category = document.querySelector(".timer h2").innerHTML;
    if (currentGuess < guessBoxes.length) {
      navigator.clipboard.writeText(`Guessed today's Cuedle ${category} in ${currentGuess + 1} guess${currentGuess === 0 ? "" : "es"}✅`);
    } else {
      navigator.clipboard.writeText(`Failed to guess today's Cuedle ${category}❌`);
    }
  });


})();