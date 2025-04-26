const parser = require('lambda-multipart-parser');
const formData = require('form-data');
const Mailgun = require('mailgun-js')({ apiKey: process.env.MAILGUN_API_KEY, domain: process.env.MAILGUN_DOMAIN });

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const result = await parser.parse(event);
    console.log("Parsed form data:", result);

    const teamName = result.teamName;
    const jersey = result.jersey;
    const playersDataJSON = result.playersData;
    const captainEmail = result.email || '';

    let players = [];
    if (playersDataJSON) {
      try {
        players = JSON.parse(playersDataJSON);
      } catch (error) {
        console.error("Error parsing playersData JSON:", error);
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid players data' }) };
      }
    }

    const sponsorLogoFile = result.files[0];
    let sponsorLogoFilename = '';
    let sponsorLogoAttachment = null;

    if (sponsorLogoFile && sponsorLogoFile.filename && sponsorLogoFile.content) {
      sponsorLogoFilename = sponsorLogoFile.filename;
      sponsorLogoAttachment = new Mailgun.Attachment({
        data: Buffer.from(sponsorLogoFile.content, 'base64'),
        filename: sponsorLogoFilename,
        contentType: sponsorLogoFile.contentType,
      });
    }

    let csvString = "Nom de l'équipe,Maillot,Nom,Taille,Numéro,Anecdote,Logo Sponsor,Email Capitaine\n";

    players.forEach(player => {
      csvString += `${teamName},${jersey},"${player.name || ''}","${player.size || ''}",${player.number || ''},"${player.anecdote || ''}","${sponsorLogoFilename}",${captainEmail}\n`;
    });

    const filename = `inscription_${teamName?.replace(/\s+/g, '_')}.csv`;
    const csvAttachment = new Mailgun.Attachment({ data: Buffer.from(csvString), filename: filename, contentType: 'text/csv' });

    const attachments = [csvAttachment];
    if (sponsorLogoAttachment) {
      attachments.push(sponsorLogoAttachment);
    }

    const data = {
      from: `Inscriptions Beach Rugby <postmaster@${process.env.MAILGUN_DOMAIN}>`,
      to: `rudy masse <rudy.masse@gmail.com>`,
      subject: `Nouvelle inscription pour l'équipe ${teamName}`,
      text: `Ci-joint le fichier CSV des inscriptions de l'équipe ${teamName}.`,
      attachment: attachments,
    };

    await Mailgun.messages().send(data);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Inscription enregistrée pour ${teamName}. Un email avec les données a été envoyé.` }),
    };

  } catch (error) {
    console.error("Error processing form or sending email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process form or send email' }),
    };
  }
};