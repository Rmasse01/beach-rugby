const formidable = require('formidable');
const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const form = new formidable.IncomingForm();

    return new Promise((resolve, reject) => {
      form.parse(event, async (err, fields, files) => {
        if (err) {
          console.error("Error parsing form:", err);
          return resolve({
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to parse form data' }),
          });
        }

        console.log("fields:", fields); // Les champs du formulaire
        console.log("files:", files);   // Les fichiers uploadés (sponsorLogo)

        const teamName = fields.teamName;
        const jersey = fields.jersey;
        const names = fields['name[]'] || [];
        const sizes = fields['size[]'] || [];
        const numbers = fields['number[]'] || [];
        const anecdotes = fields['anecdote[]'] || [];
        const sponsorLogo = files.sponsorLogo?.originalFilename || ''; // Nom du fichier

        const email = fields.email;

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

        resolve({
          statusCode: 200,
          body: JSON.stringify({ message: `Inscription enregistrée pour ${teamName}` }),
        });
      });
    });

  } catch (error) {
    console.error("Error processing form submission:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process submission' }),
    };
  }
};