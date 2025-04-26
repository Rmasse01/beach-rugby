// Sélection des éléments DOM
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
const errorMessage = document.createElement('div');
errorMessage.classList.add('error-message');
document.querySelector('.carousel-wrapper').appendChild(errorMessage);

// Masquer initialement la section d'affichage des données
dataDisplay.style.display = 'none';

// Fonction de mise à jour de la position du carrousel
function setSlidePosition(slide, index) {
  slide.style.left = slideWidth * index + 'px';
}

// Mise à jour du carrousel
function updateCarousel(newIndex) {
  const newPosition = newIndex * -slideWidth;
  carouselTrack.style.transform = 'translateX(' + newPosition + 'px)';
  currentIndex = newIndex;
  updateSelectedJersey(slides[currentIndex].querySelector('img'));
}

// Fonction pour passer à la slide suivante
function nextSlide() {
  if (currentIndex < (slides ? slides.length - 1 : 0)) {
    updateCarousel(currentIndex + 1);
  }
}

// Fonction pour revenir à la slide précédente
function prevSlide() {
  if (currentIndex > 0) {
    updateCarousel(currentIndex - 1);
  }
}

// Mise à jour de l'image du maillot sélectionné
function updateSelectedJersey(el) {
  document.querySelectorAll('.carousel-track img').forEach(img => {
    img.classList.remove('selected');
  });
  el.classList.add('selected');
  jerseyInput.value = el.alt;
  errorMessage.textContent = ''; // Effacer le message d'erreur
  checkFormValidity();
}

// Initialisation du carrousel après le chargement du DOM
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
    }
  }
  checkFormValidity();
});

// Réajuster les slides en cas de redimensionnement
window.addEventListener('resize', () => {
  if (slides && slides.length > 0) {
    slideWidth = slides[0].getBoundingClientRect().width;
    slides.forEach(setSlidePosition);
    updateCarousel(currentIndex);
  }
});

if (prevBtn) {
  prevBtn.addEventListener('click', prevSlide);
}

if (nextBtn) {
  nextBtn.addEventListener('click', nextSlide);
}

// Sélection des maillots
carouselTrack.addEventListener('click', (event) => {
  const clickedImg = event.target.closest('img');
  if (clickedImg) {
    updateSelectedJersey(clickedImg);
  }
});

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

  // Affichage du message d'erreur si aucun maillot sélectionné
  if (!selectedJersey) {
    errorMessage.textContent = "Veuillez sélectionner un maillot.";
  }
}

// Ajouter un joueur
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
 