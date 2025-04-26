const jerseyInput = document.getElementById('jerseyInput');
const addBtn = document.getElementById('addPlayer');
const playersContainer = document.getElementById('playersContainer');
const submitBtn = document.getElementById('submitBtn');
const emailInput = document.getElementById('email');
const playersDataInput = document.getElementById('playersData');
const dataDisplay = document.getElementById('dataDisplay');
const dataTable = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
const registrationForm = document.getElementById('registrationForm');
const carouselTrack = document.getElementById('jerseyCarouselTrack');
const slides = Array.from(carouselTrack.children);
const slideWidth = slides[0].getBoundingClientRect().width;
let currentIndex = 0;

dataDisplay.style.display = 'none';

function setSlidePosition(slide, index) {
  slide.style.left = slideWidth * index + 'px';
}

function updateCarousel(newIndex) {
  const newPosition = newIndex * -slideWidth;
  carouselTrack.style.transform = 'translateX(' + newPosition + 'px)';
  currentIndex = newIndex;
  updateSelectedJersey(slides[currentIndex].querySelector('img'));
}

function nextSlide() {
  if (currentIndex < slides.length - 1) {
    updateCarousel(currentIndex + 1);
  }
}

function prevSlide() {
  if (currentIndex > 0) {
    updateCarousel(currentIndex - 1);
  }
}

function updateSelectedJersey(el) {
  document.querySelectorAll('.carousel-track img').forEach(img => img.classList.remove('selected'));
  el.classList.add('selected');
  jerseyInput.value = el.alt;
  checkFormValidity();
}

window.selectJersey = function(el, altText) {
  document.querySelectorAll('.carousel-track img').forEach(img => img.classList.remove('selected'));
  el.classList.add('selected');
  jerseyInput.value = altText;
  checkFormValidity();
}

function checkFormValidity() {
  const selectedJersey = document.querySelector('.carousel-track img.selected');
  const teamNameInput = document.getElementById('teamName');
  const playerRows = playersContainer.querySelectorAll('.player table tbody tr');
  let allPlayersValid = true;
  playerRows.forEach(row => {
    const nameInput = row.querySelector('input[name="playerName"]');
    const numberInput = row.querySelector('input[name="playerNumber"]');
    if (nameInput && nameInput.value.trim() === '') allPlayersValid = false;
    if (numberInput && numberInput.value.trim() === '') allPlayersValid = false;
  });
  submitBtn.disabled = !(selectedJersey && teamNameInput.value.trim() !== '' && allPlayersValid && emailInput.checkValidity());
}

const addPlayerHandler = () => {
  const playerDiv = document.createElement('div');
  playerDiv.classList.add('player');
  playerDiv.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Nom / Surnom</th><th>Taille</th><th>Numéro (00–99)</th><th>Anecdote joueur</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><input type="text" name="playerName" required></td>
          <td>
            <select name="playerSize">
              <option>XS</option><option>S</option><option selected>M</option><option>L</option><option>XL</option><option>XXL</option>
            </select>
          </td>
          <td><input type="number" name="playerNumber" min="0" max="99" required></td>
          <td><textarea name="playerAnecdote" rows="2"></textarea></td>
        </tr>
      </tbody>
    </table>
  `;
  playersContainer.appendChild(playerDiv);
  attachPlayerInputListeners(playerDiv);
  checkFormValidity();
}

addBtn.addEventListener('click', addPlayerHandler);

function attachPlayerInputListeners(container) {
  const inputs = container.querySelectorAll('input[type="text"][name="playerName"], input[type="number"][name="playerNumber"]');
  inputs.forEach(input => {
    input.addEventListener('input', checkFormValidity);
  });
}

playersContainer.querySelectorAll('.player').forEach(attachPlayerInputListeners);
emailInput.addEventListener('input', checkFormValidity);

// Initialisation du carrousel
slides.forEach(setSlidePosition);

// Sélection du premier maillot au chargement et validation initiale
document.addEventListener('DOMContentLoaded', () => {
  const firstSlideImg = document.querySelector('.carousel-track .slide:first-child img');
  if (firstSlideImg) {
    firstSlideImg.classList.add('selected');
    jerseyInput.value = firstSlideImg.alt;
  }
  checkFormValidity();
});

registrationForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const playersData = [];
  const playerDivs = playersContainer.querySelectorAll('.player');
  playerDivs.forEach(playerDiv => {
    const nameInput = playerDiv.querySelector('input[name="playerName"]');
    const sizeSelect = playerDiv.querySelector('select[name="playerSize"]');
    const numberInput = playerDiv.querySelector('input[name="playerNumber"]');
    const anecdoteInput = playerDiv.querySelector('textarea[name="playerAnecdote"]');
    playersData.push({
      name: nameInput.value,
      size: sizeSelect.value,
      number: numberInput.value,
      anecdote: anecdoteInput.value
    });
  });
  playersDataInput.value = JSON.stringify(playersData);
  registrationForm.removeEventListener('submit', arguments.callee); // Pour éviter les doubles envois
  registrationForm.submit();
});

fetch('https://relaxed-zabaione-6a4060.netlify.app/.netlify/functions/read-csv')
  .then(response => response.json())
  .then(data => {
    dataDisplay.style.display = 'block';
    if (data && data.length > 0) {
      data.forEach(rowData => {
        const players = JSON.parse(rowData.playersData || '[]');
        players.forEach(player => {
          const dataRow = dataTable.insertRow();
          dataRow.insertCell().textContent = rowData.teamName || '';
          dataRow.insertCell().textContent = rowData.jersey || '';
          dataRow.insertCell().textContent = player.name || '';
          dataRow.insertCell().textContent = player.size || '';
          dataRow.insertCell().textContent = player.number || '';
          dataRow.insertCell().textContent = player.anecdote || '';
          dataRow.insertCell().textContent = rowData.sponsorLogo || '';
          dataRow.insertCell().textContent = rowData.email || '';
          dataRow.insertCell().textContent = rowData.ip || '';
          dataRow.insertCell().textContent = rowData.user_agent || '';
          dataRow.insertCell().textContent = rowData.referrer || '';
          dataRow.insertCell().textContent = rowData.created_at || '';
        });
      });
    } else {
      dataDisplay.innerHTML = '<p>Aucune inscription n\'a été trouvée pour le moment.</p>';
    }
  })
  .catch(error => {
    console.error("Erreur lors de la récupération des données:", error);
    dataDisplay.innerHTML = '<p>Erreur lors du chargement des inscriptions.</p>';
  });