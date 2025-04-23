const querystring = require('querystring');
const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const formData = querystring.parse(event.body);
    console.log("formData:", formData); // Ajout de la ligne de log

    const teamName = formData.teamName;
    const jersey = formData.jersey;
    const names = formData['name[]'] || [];
    const sizes = formData['size[]'] || [];
    const numbers = formData['number[]'] || [];
    const anecdotes = formData['anecdote[]'] || [];
    const sponsorLogo = formData.sponsorLogo || '';
    const email = formData.email;

    let csvString = "Nom de l'équipe,Maillot,Nom,Taille,Numéro,Anecdote,Logo Sponsor,Email Capitaine\n";

    const numPlayers = Math.max(names.length, sizes.length, numbers.length, anecdotes.length);

    for (let i = 0; i < numPlayers; i++) {
      const playerName = names[i] || '';
      const playerSize = sizes[i] || '';
      const playerNumber = numbers[i] || '';
      const playerAnecdote = anecdotes[i] || '';

      csvString += `${teamName},${jersey},"${playerName}","${playerSize}",${playerNumber},"${playerAnecdote}","${sponsorLogo}",${email}\n`;
    }

    const filename = `inscription_${teamName?.replace(/\s+/g, '_')}.csv`;
    const filePath = path.join(__dirname, 'data', filename);

    await fs.writeFile(filePath, csvString, 'utf8');

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Inscription enregistrée pour ${teamName}` }),
    };

  } catch (error) {
    console.error("Error processing form submission:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process submission' }),
    };
  }
};