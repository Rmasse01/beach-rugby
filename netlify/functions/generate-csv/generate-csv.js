const parser = require('lambda-multipart-parser');
const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const result = await parser.parse(event);
    console.log("Parsed form data:", result);

    const teamName = result.teamName;
    const jersey = result.jersey;
    const names = result.name || [];
    const sizes = result.size || [];
    const numbers = result.number || [];
    const anecdotes = result.anecdote || [];
    const sponsorLogoFile = result.sponsorLogo; // This will be an object with file info
    const email = result.email;

    let sponsorLogoFilename = '';
    if (sponsorLogoFile && sponsorLogoFile.filename) {
      sponsorLogoFilename = sponsorLogoFile.filename;
      const filepath = path.join(__dirname, sponsorLogoFilename); // Save in function directory
      await fs.writeFile(filepath, Buffer.from(sponsorLogoFile.content, 'base64'));
      console.log("Sponsor logo saved to:", filepath);
    }

    let csvString = "Nom de l'équipe,Maillot,Nom,Taille,Numéro,Anecdote,Logo Sponsor,Email Capitaine\n";
    const numPlayers = Math.max(names.length, sizes.length, numbers.length, anecdotes.length);

    for (let i = 0; i < numPlayers; i++) {
      const playerName = names[i] || '';
      const playerSize = sizes[i] || '';
      const playerNumber = numbers[i] || '';
      const playerAnecdote = anecdotes[i] || '';
      csvString += `${teamName},${jersey},"${playerName}","${playerSize}",${playerNumber},"${playerAnecdote}","${sponsorLogoFilename}",${email}\n`;
    }

    const filename = `inscription_${teamName?.replace(/\s+/g, '_')}.csv`;
    const filePath = path.join(__dirname, filename);

    await fs.writeFile(filePath, csvString, 'utf8');

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Inscription enregistrée pour ${teamName}` }),
    };

  } catch (error) {
    console.error("Error processing form:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process form data' }),
    };
  }
};