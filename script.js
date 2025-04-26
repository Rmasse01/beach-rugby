const jerseyInput = document.getElementById('jerseyInput');
const addBtn = document.getElementById('addPlayer');
const playersList = document.getElementById('playersList');
const submitBtn = document.getElementById('submitBtn');
const emailInput = document.getElementById('email');
const dataDisplay = document.getElementById('dataDisplay');
const registrationForm = document.getElementById('registrationForm');
const carouselTrack = document.getElementById('jerseyCarouselTrack');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
let slides;
let slideWidth;
let currentIndex = 0;
let isJerseySelected = false; // Variable pour suivre l'état de la sélection du maillot

// Masquer initialement la section d'affichage des données
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
  isJerseySelected = true; // Le maillot a été sélectionné
  checkFormValidity();
}

// Affichage de message d'erreur si le maillot n'est pas sélectionné
function displayJerseyError() {
  const errorMsg = document.getElementById('jerseyError');
  if (!isJerseySelected) {
    errorMsg.style.display = 'block';
  } else {
    errorMsg.style.display = 'none';
  }
}

// Initialisation du carrousel après le chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  slides = Array.from(carouselTrack.children);
  if (slides.length > 0) {
    slideWidth = slides[0].getBoundingClientRect().width; // Calculer après le chargement
    slides.forEach(setSlidePosition);
    carouselTrack.style.transform = 'translateX(0)'; // Initialiser à la première slide
    const firstSlideImg = document.querySelector('.carousel-track .slide:first-child img');
    if (firstSlideImg) {
      firstSlideImg.classList.add('selected');
      jerseyInput.value = firstSlideImg.alt;
    }
  }
  checkFormValidity();
  displayJerseyError(); // Vérifier si le maillot est sélectionné
});

// Recalculer slideWidth en cas de redimensionnement de la fenêtre
window.addEventListener('resize', () => {
  if (slides && slides.length > 0) {
    slideWidth = slides[0].getBoundingClientRect().width;
    slides.forEach(setSlidePosition);
    updateCarousel(currentIndex); // Maintenir la slide courante
  }
});

if (prevBtn) {
  prevBtn.addEventListener('click', prevSlide);
}

if (nextBtn) {
  nextBtn.addEventListener('click', nextSlide);
}

// Modification de l'écouteur de clic pour la sélection
if (carouselTrack) {
  carouselTrack.addEventListener('click', (event) => {
    const clickedImg = event.target.closest('img');
    if (clickedImg) {
      updateSelectedJersey(clickedImg);
    }
  });
}

// Fonction pour la validation du formulaire côté client
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
  displayJerseyError(); // Vérifier si le maillot est sélectionné avant de soumettre
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

// Attacher les listeners d'input aux champs de joueur pour la validation côté client
function attachPlayerInputListeners(row) {
  const inputs = row.querySelectorAll('input[type="text"][name="name[]"], input[type="number"][name="number[]"]');
  inputs.forEach(input => {
    input.addEventListener('input', checkFormValidity);
  });
}

// Attacher les listeners d'input aux joueurs existants au chargement pour la validation côté client
playersList.querySelectorAll('tr').forEach(attachPlayerInputListeners);

// Validation de l'email côté client
if (emailInput) {
  emailInput.addEventListener('input', checkFormValidity);
}