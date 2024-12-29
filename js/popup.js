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
            <p>Have you any questions/recommendations or did you find a bug? Please contact me @ReCuedle on Twitter.</p>
            <h2>Support</h2>
            <p>Enjoying ReCuedle?</p>
            <a id="kofi-button" href="https://ko-fi.com/enritix" target="_blank">
            <img src="/assets/images/kofi_symbol.png" alt="Ko-fi logo">Consider buying me a coffee</a>`);
    document.querySelector('#kofi-button').addEventListener('click', function () {
      cheersKofiButton();
    });
  }

  document.getElementById('close-general-popup').addEventListener('click', closeGeneralPopup);
}

function cheersKofiButton() {
  const kofiButton = document.querySelector("#kofi-button");
  kofiButton.innerHTML = `<img id="cheer1" src="/assets/images/kofi_symbol.png" alt="Ko-fi logo">
                            <img id="cheer2" src="/assets/images/kofi_symbol.png" alt="Ko-fi logo">
                            Cheers!`;
  let styleSheet = document.styleSheets[1];

  // Loop through existing rules and remove the specific rule for the pseudo-element
  for (let i = 0; i < styleSheet.cssRules.length; i++) {
    if (styleSheet.cssRules[i].selectorText === '.popup-content #kofi-button::after') {
      styleSheet.deleteRule(i); // Remove the existing rule
      break;
    }
  }

  // Add the modified rule
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

document.querySelector('#contact').addEventListener('click', function (event) {
  event.preventDefault();
  setupGeneralPopup("contact");
  openGeneralPopup();
});