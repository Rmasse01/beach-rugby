// Sélectionner les éléments du DOM
const carouselImages = document.querySelectorAll('.carousel-track img');
const jerseyInput = document.getElementById('jerseyInput');
const errorMessage = document.getElementById('error-message');
const submitBtn = document.getElementById('submitBtn');
const teamNameInput = document.getElementById('teamName');
const emailInput = document.getElementById('email');
const playersList = document.getElementById('playersList');

// Ajouter l'événement de sélection sur chaque image du carrousel
carouselImages.forEach(img => {
  img.addEventListener('click', () => {
    // Supprimer la sélection sur toutes les images
    carouselImages.forEach(image => image.classList.remove('selected'));
    // Ajouter la classe 'selected' à l'image cliquée
    img.classList.add('selected');
    // Mettre à jour le champ caché avec le maillot sélectionné
    jerseyInput.value = img.alt;
    // Vérifier la validité du formulaire
    checkFormValidity();
  });
});

// Vérification de la validité du formulaire
function checkFormValidity() {
  // Vérifier si un maillot est sélectionné
  const selectedJersey = document.querySelector('.carousel-track img.selected');
  const allInputsValid = teamNameInput.value.trim() !== '' && emailInput.checkValidity();

  // Afficher ou masquer le message d'erreur en fonction de la sélection du maillot
  if (!selectedJersey) {
    errorMessage.style.display = 'block'; // Afficher l'erreur si aucun maillot n'est sélectionné
  } else {
    errorMessage.style.display = 'none'; // Masquer l'erreur si un maillot est sélectionné
  }

  // Activer ou désactiver le bouton de soumission
  submitBtn.disabled = !(selectedJersey && allInputsValid);
}

// Fonction pour ajouter un joueur
document.getElementById('addPlayer').addEventListener('click', () => {
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td><input type="text" name="name[]" required></td>
    <td>
      <select name="size[]">
        <option>XS</option><option>S</option><option selected>M</option><option>L</option><option>XL</option><option>XXL</option>
      </select>
    </td>
    <td><input type="number" name="number[]" min="0" max="99" required></td>
    <td><textarea name="anecdote[]" rows="2"></textarea></td>
  `;
  playersList.appendChild(newRow);
});

// Vérifier la soumission du formulaire
document.getElementById('registrationForm').addEventListener('submit', function(event) {
  event.preventDefault();

  // Si un maillot est sélectionné, on soumet le formulaire
  const selectedJersey = document.querySelector('.carousel-track img.selected');
  if (selectedJersey) {
    console.log('Formulaire validé !', {
      teamName: teamNameInput.value,
      jersey: jerseyInput.value,
      players: [...playersList.querySelectorAll('tr')].map(row => ({
        name: row.querySelector('input[name="name[]"]').value,
        size: row.querySelector('select[name="size[]"]').value,
        number: row.querySelector('input[name="number[]"]').value,
        anecdote: row.querySelector('textarea[name="anecdote[]"]').value,
      })),
      email: emailInput.value
    });
    // On peut ajouter ici l'envoi des données via AJAX ou avec un service comme Mailgun
  }
});