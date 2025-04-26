document.addEventListener('DOMContentLoaded', function() {
  let jerseySelected = false;
  const jerseyInput = document.getElementById('jerseyInput');
  const submitBtn = document.getElementById('submitBtn');
  const carouselImages = document.querySelectorAll('.carousel-track .slide img');

  // Fonction pour gérer la sélection du maillot
  carouselImages.forEach((img) => {
    img.addEventListener('click', function() {
      jerseySelected = true;
      jerseyInput.value = img.src; // Enregistrer la source de l'image dans l'input hidden
      submitBtn.disabled = false; // Activer le bouton de soumission
    });
  });

  // Vérifier que le maillot est sélectionné lors de la soumission du formulaire
  document.getElementById('registrationForm').addEventListener('submit', function(event) {
    if (!jerseySelected) {
      event.preventDefault();
      alert('Veuillez sélectionner un maillot avant de soumettre.');
    }
  });

  // Affichage de l'erreur si nécessaire
  const errorElement = document.createElement('div');
  errorElement.id = 'error-message';
  errorElement.style.color = 'red';
  errorElement.style.marginTop = '10px';
  document.querySelector('.carousel-wrapper').appendChild(errorElement);

  document.getElementById('registrationForm').addEventListener('submit', function() {
    if (!jerseySelected) {
      errorElement.textContent = 'Veuillez sélectionner un maillot.';
      submitBtn.disabled = true;
    }
  });
});