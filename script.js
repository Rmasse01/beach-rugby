document.addEventListener('DOMContentLoaded', function() {
  const jerseyImages = document.querySelectorAll('.carousel-track img');
  const jerseyInput = document.getElementById('jerseyInput');
  const submitBtn = document.getElementById('submitBtn');
  const errorMessage = document.getElementById('jerseyError');
  
  // Fonction pour sélectionner le maillot
  jerseyImages.forEach(img => {
    img.addEventListener('click', function() {
      jerseyImages.forEach(i => i.classList.remove('selected')); // Retirer la sélection
      img.classList.add('selected'); // Ajouter la sélection
      jerseyInput.value = img.alt; // Définir le maillot sélectionné dans le champ caché
      errorMessage.style.display = 'none'; // Cacher le message d'erreur
      submitBtn.disabled = false; // Activer le bouton de soumission
    });
  });

  // Validation lors de la soumission
  document.getElementById('registrationForm').addEventListener('submit', function(event) {
    if (!jerseyInput.value) {
      event.preventDefault();
      errorMessage.style.display = 'block'; // Afficher le message d'erreur si pas de maillot sélectionné
      submitBtn.disabled = true; // Désactiver le bouton de soumission
    }
  });
  
  // Ajouter un joueur
  document.getElementById('addPlayer').addEventListener('click', function() {
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
    document.getElementById('playersList').appendChild(newRow);
  });
});