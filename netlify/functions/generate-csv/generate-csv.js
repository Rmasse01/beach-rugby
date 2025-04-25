const parser = require('lambda-multipart-parser');
const sgMail = require('@sendgrid/mail');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Utiliser une variable d'environnement pour la clé API

  try {
    const result = await parser.parse(event);
    console.log("Parsed form data:", result);

    const teamName = result.teamName;
    const jersey = result.jersey;
    const names = result.name || [];
    const sizes = result.size || [];
    const numbers = result.number || [];
    const anecdotes = result.anecdote || [];
    const sponsorLogoFile = result.sponsorLogo;
    const email = result.email;

    let sponsorLogoFilename = '';
    if (sponsorLogoFile && sponsorLogoFile.filename) {
      sponsorLogoFilename = sponsorLogoFile.filename;
    }

    let csvString = "Nom de l'équipe,Maillot,Nom,Taille,Numéro,Anecdote,Logo Sponsor,Email Capitaine\n";
    const numPlayers = Math.max(names.length, sizes.length, numbers.length, anecdotes.length);

    for (let i = 0; i < numPlayers; i++) {
      const playerName = names[i] || '';
      const playerSize = sizes[i] || '';
      const playerNumber = numbers[i] || '';
      const playerAnecdote = anecdotes[i] || '';
      csvString += `<span class="math-inline">\{teamName\},</span>{jersey},"<span class="math-inline">\{playerName\}","</span>{playerSize}",<span class="math-inline">\{playerNumber\},"</span>{playerAnecdote}","<span class="math-inline">\{sponsorLogoFilename\}",</span>{email}\n`;
    }

    const filename = `inscription_${teamName?.replace(/\s+/g, '_')}.csv`;
    const base64CSV = Buffer.from(csvString).toString('base64');

    const msg = {
      to: 'rudy.masse@gmail.com', // Ton adresse email
      from: email, // L'email du capitaine comme expéditeur (peut nécessiter une configuration spécifique chez SendGrid)
      subject: `Nouvelle inscription pour l'équipe ${teamName}`,
      text: `Ci-joint le fichier CSV des inscriptions de l'équipe ${teamName}.`,
      attachments: [
        {
          content: base64CSV,
          filename: filename,
          type: 'text/csv',
          disposition: 'attachment',
        },
      ],
    };

    await sgMail.send(msg);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Inscription