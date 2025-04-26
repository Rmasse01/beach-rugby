// Sélection des éléments du DOM
const jerseyInput = document.getElementById('jerseyInput');
const addBtn      = document.getElementById('addPlayer');
const playersList = document.getElementById('playersList');
const submitBtn   = document.getElementById('submitBtn');
const emailInput  = document.getElementById('email');
const dataTable   = document.getElementById('dataTable').getElementsByTagName('tbody')[0];
const dataDisplay = document.getElementById('dataDisplay');
const registrationForm = document.getElementById('registrationForm');

// Masquer initialement la section d'affichage des données
dataDisplay.style.display = 'none';

// Fonction pour gérer la sélection du maillot
window.selectJersey = function(el) { // Définition dans la portée globale
  document.querySelectorAll('.simple-carousel img')
      .forEach(i => i.classList.remove('selected'));
  el.classList.add('selected');
  jerseyInput.value = el.alt;
  checkFormValidity();
};

// Fonction pour la validation du formulaire côté client
function checkFormValidity() {
  const selectedJersey = document.querySelector('.simple-carousel img.selected');
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

addBtn.addEventListener('click', addPlayerHandler);

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
emailInput.addEventListener('input', checkFormValidity);

// Sélection du premier maillot au chargement et validation initiale
document.addEventListener('DOMContentLoaded', () => {
  const firstJersey = document.querySelector('.simple-carousel img:first-child');
  if (firstJersey) {
    firstJersey.classList.add('selected');
    jerseyInput.value = firstJersey.alt;
  }
  checkFormValidity();
});

// Script pour récupérer et afficher les données (avec gestion d'erreur améliorée)
fetch('https://relaxed-zabaione-6a4060.netlify.app/.netlify/functions/read-csv')
  .then(response => response.json())
  .then(data => {
    dataDisplay.style.display = 'block'; // Afficher la section des données
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