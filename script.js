document.addEventListener("DOMContentLoaded", function() {
  // Récupérer les éléments
  const jerseyCarousel = document.getElementById("jerseyCarouselTrack");
  const jerseyInput = document.getElementById("jerseyInput");
  const submitBtn = document.getElementById("submitBtn");
  const jerseyError = document.getElementById("jerseyError");
  
  // Fonction pour désactiver le bouton de soumission
  function toggleSubmitButton() {
    if (jerseyInput.value) {
      submitBtn.disabled = false;
      jerseyError.style.display = "none"; // Masquer l'erreur
    } else {
      submitBtn.disabled = true;
      jerseyError.style.display = "block"; // Afficher l'erreur
    }
  }

  // Fonction de sélection du maillot
  jerseyCarousel.addEventListener("click", function(event) {
    if (event.target.tagName === "IMG") {
      // Définir l'ID du maillot sélectionné
      jerseyInput.value = event.target.alt; // Utiliser le alt comme identifiant du maillot
      toggleSubmitButton(); // Activer le bouton de soumission
    }
  });

  // Validation avant soumission
  document.getElementById("registrationForm").addEventListener("submit", function(event) {
    if (!jerseyInput.value) {
      jerseyError.style.display = "block"; // Afficher l'erreur
      event.preventDefault(); // Empêcher l'envoi du formulaire si le maillot n'est pas sélectionné
    }
  });

  // Initialiser le bouton de soumission
  toggleSubmitButton();
});