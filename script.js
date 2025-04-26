const jerseyInput = document.getElementById('jerseyInput');
const addBtn = document.getElementById('addPlayer');
const playersList = document.getElementById('playersList');
const submitBtn = document.getElementById('submitBtn');
const emailInput = document.getElementById('email');
const dataTable = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
const dataDisplay = document.getElementById('dataDisplay');
const registrationForm = document.getElementById('registrationForm');
const carouselTrack = document.getElementById('jerseyCarouselTrack');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
let slides;
let slideWidth;
let currentIndex = 0;
let jerseySelected = false; // <- Pour savoir si un maillot est sélectionné

// Masquer initialement la section d'affichage des données
dataDisplay.style.display = 'none';

// Créer une div d'erreur sous le carousel (au chargement)
const jerseyError = document.createElement('div');
jerseyError.style.color = 'red';
jerseyError.style.marginTop = '10px';
jerseyError.style.display = 'none';
jerseyError.textContent = 'Veuillez sélectionner un maillot.';
carouselTrack.parentNode.appendChild(jerseyError);

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
  if (currentIndex < (slides ? slides.length - 1 : 0)) {
    updateCarousel(currentIndex + 1);
  }
}

function prevSlide() {
  if (currentIndex > 0) {
    updateCarousel(currentIndex - 1);
  }
}

function updateSelectedJersey(el) {
  document.querySelectorAll('.carousel-track img').forEach(img => {
    img.classList.remove('selected');
  });
  el.classList.add('selected');
  jerseyInput.value = el.alt;
  jerseySelected = true; // Un maillot a été sélectionné
  jerseyError.style.display = 'none'; // Cacher l'erreur si correction
  checkFormValidity();
}

// Initialisation du carrousel
document.addEventListener('DOMContentLoaded', () => {
  slides = Array.from(carouselTrack.children);
  if (slides.length > 0) {
    slideWidth = slides[0].getBoundingClientRect().width;
    slides.forEach(setSlidePosition);
    carouselTrack.style.transform = 'translateX(0)';
    const firstSlideImg = document.querySelector('.carousel-track .slide:first-child img');
    if (firstSlideImg) {
      firstSlideImg.classList.add('selected');
      jerseyInput.value = firstSlideImg.alt;
      jerseySelected = true; // Première image sélectionnée par défaut
    }
  }
  checkFormValidity();
});

window.addEventListener('resize', () => {
  if (slides && slides.length > 0) {
    slideWidth = slides[0].getBoundingClientRect().width;
    slides.forEach(setSlidePosition);
    updateCarousel(currentIndex);
  }
});

// Navigation boutons
if (prevBtn) prevBtn.addEventListener('click', prevSlide);
if (nextBtn) nextBtn.addEventListener('click', nextSlide);

// Sélection par clic
if (carouselTrack) {
  carouselTrack.addEventListener('click', (event) => {
    const clickedImg = event.target.tagName === 'IMG' ? event.target : null;
    if (clickedImg) {
      updateSelectedJersey(clickedImg);
    }
  });
}

// Empêcher l'envoi du formulaire si pas de maillot sélectionné
if (registrationForm) {
  registrationForm.addEventListener('submit', (e) => {
    if (!jerseySelected) {
      e.preventDefault();
      jerseyError.style.display = 'block'; // Afficher erreur sous carousel
      carouselTrack.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Vérification Mailgun : simuler l'envoi de l'email et log
      const formData = new FormData(registrationForm);
      const dataToSend = Object.fromEntries(formData.entries());
      console.log('Données du formulaire:', dataToSend);
      
      // Simuler l'envoi avec Mailgun (en backend, tu devras appeler Mailgun ici)
      fetch('/mailgun-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'no-reply@tonsite.com',
          to: dataToSend.email,  // email du capitaine
          subject: 'Confirmation d\'inscription - Tournoi Beach Rugby',
          text: `Merci de votre inscription ! Votre équipe est : ${dataToSend.teamName}`
        })
      })
      .then(response => response.json())
      .then(responseData => {
        console.log('Réponse Mailgun:', responseData);
      })
      .catch(error => {
        console.error('Erreur envoi Mailgun:', error);
      });
    }
  });
}

// Validation du formulaire
function checkFormValidity() {
  const selectedJersey = document.querySelector('.carousel-track img.selected');
  const teamNameInput = document.getElementById('teamName');
  const rows = playersList.querySelectorAll('tr');
  let allPlayersValid = true;
  rows.forEach(row => {
    const nameInput = row.querySelector('input[name="name[]"]');
    const numberInput = row.querySelector('input[name="number[]"]');
    if (nameInput && nameInput.value.trim() === '') allPlayersValid = false;
    if (numberInput && numberInput.value.trim() === '') allPlayersValid = false;
  });
  submitBtn.disabled = !(selectedJersey && teamNameInput.value.trim() !== '' && allPlayersValid && emailInput.checkValidity());
}

// Ajout dynamique de joueurs
const addPlayerHandler = () => {
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td><input type="text" name="name[]" required></td>
    <td>
      <select name="size[]">
        <option>XS</option><option>S</option><option selected>M</option><option>L</option><option>XL</option><option>XXL</option>
      </select>
    </td>
    <td><input type="number" name="number[]" min="0" max="99" required></td>
    <td><textarea name="anecdote[]" rows="2"></textarea></td>`;
  playersList.appendChild(tr);
  attachPlayerInputListeners(tr);
  checkFormValidity();
};

if (addBtn) {
  addBtn.addEventListener('click', addPlayerHandler);
}

function attachPlayerInputListeners(row) {
  const inputs = row.querySelectorAll('input[type="text"][name="name[]"], input[type="number"][name="number[]"]');
  inputs.forEach(input => {
    input.addEventListener('input', checkFormValidity);
  });
}

playersList.querySelectorAll('tr').forEach(attachPlayerInputListeners);

// Validation de l'email
if (emailInput) {
  emailInput.addEventListener('input', checkFormValidity);
}

// Récupération des inscriptions existantes
fetch('https://relaxed-zabaione-6a4060.netlify.app/.netlify/functions/read-csv')
  .then(response => response.json())
  .then(data => {
    dataDisplay.style.display = 'block';
    if (data && data.length > 0) {
      data.forEach(rowData => {
        const names = rowData.name || [];
        const sizes = rowData.size || [];
        const numbers = rowData.number || [];
        const anecdotes = rowData.anecdote || [];
        const maxRows = Math.max(1, names.length);
        for (let i = 0; i < Math.min(maxRows, 10); i++) {
          const dataRow = dataTable.insertRow();
          dataRow.insertCell().textContent = rowData.teamName || '';
          dataRow.insertCell().textContent = rowData.jersey || '';
          dataRow.insertCell().textContent = names[i] || '';
          dataRow.insertCell().textContent = sizes[i] || '';
          dataRow.insertCell().textContent = numbers[i] || '';
          dataRow.insertCell().textContent = anecdotes[i] || '';
          dataRow.insertCell().textContent = rowData.sponsorLogo || '';
          dataRow.insertCell().textContent = rowData.email || '';
          dataRow.insertCell().textContent = rowData.ip || '';
          dataRow.insertCell().textContent = rowData.user_agent || '';
          dataRow.insertCell().textContent = rowData.referrer || '';
          dataRow.insertCell().textContent = rowData.created_at || '';
        }
      });
    } else {
      dataDisplay.innerHTML = '<p>Aucune inscription n\'a été trouvée pour le moment.</p>';
    }
  })
  .catch(error => {
    console.error("Erreur lors de la récupération des données:", error);
    dataDisplay.innerHTML = '<p>Erreur lors du chargement des inscriptions.</p>';
  });