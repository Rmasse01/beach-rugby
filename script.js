const jerseyInput = document.getElementById('jerseyInput');
const addBtn = document.getElementById('addPlayer');
const playersList = document.getElementById('playersList');
const submitBtn = document.getElementById('submitBtn');
const emailInput = document.getElementById('email');
const dataTable = document.getElementById('dataTable') ? document.getElementById('dataTable').getElementsByTagName('tbody')[0] : null;
const dataDisplay = document.getElementById('dataDisplay');
const registrationForm = document.getElementById('registrationForm');
const carouselTrack = document.getElementById('jerseyCarouselTrack');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
let slides;
let slideWidth;
let currentIndex = 0;

// Masquer le message d'erreur au début
document.getElementById('errorMessage').style.display = 'none';

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
  // Retirer la classe 'selected' de toutes les images du carousel
  document.querySelectorAll('#jerseyCarousel .slide img').forEach(img => {
    img.classList.remove('selected');
  });

  // Ajouter la classe 'selected' à l'image cliquée
  el.classList.add('selected');
  jerseyInput.value = el.alt; // Mettre à jour le champ de formulaire avec l'ALT du maillot
  checkFormValidity();
}

document.addEventListener('DOMContentLoaded', () => {
  slides = Array.from(carouselTrack.children);
  if (slides.length > 0) {
    slideWidth = slides[0].getBoundingClientRect().width;
    slides.forEach(setSlidePosition);
    carouselTrack.style.transform = 'translateX(0)';
    const firstSlideImg = document.querySelector('#jerseyCarousel .slide:first-child img');
    if (firstSlideImg) {
      firstSlideImg.classList.add('selected');
      jerseyInput.value = firstSlideImg.alt;
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

if (prevBtn) {
  prevBtn.addEventListener('click', prevSlide);
}

if (nextBtn) {
  nextBtn.addEventListener('click', nextSlide);
}

if (carouselTrack) {
  carouselTrack.addEventListener('click', (event) => {
    const clickedImg = event.target.closest('img');
    if (clickedImg) {
      updateSelectedJersey(clickedImg);
    }
  });
}

// Validation du formulaire
function checkFormValidity() {
  const selectedJersey = document.querySelector('#jerseyCarousel .slide img.selected');
  const teamNameInput = document.getElementById('teamName');
  const rows = playersList.querySelectorAll('tr');
  let allPlayersValid = true;

  rows.forEach(row => {
    const nameInput = row.querySelector('input[name="name[]"]');
    const numberInput = row.querySelector('input[name="number[]"]');
    if (nameInput && nameInput.value.trim() === '') allPlayersValid = false;
    if (numberInput && numberInput.value.trim() === '') allPlayersValid = false;
  });

  if (!selectedJersey) {
    document.getElementById('errorMessage').style.display = 'block';
  } else {
    document.getElementById('errorMessage').style.display = 'none';
  }

  submitBtn.disabled = !(selectedJersey && teamNameInput.value.trim() !== '' && allPlayersValid && emailInput.checkValidity());
}

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
  checkFormValidity();
};

if (addBtn) {
  addBtn.addEventListener('click', addPlayerHandler);
}

if (emailInput) {
  emailInput.addEventListener('input', checkFormValidity);
}

// Si tout est validé, envoyer le formulaire par Mailgun ici
// Ajouter une fonction d'envoi avec validation si besoin