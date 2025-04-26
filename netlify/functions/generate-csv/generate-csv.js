const parser = require('lambda-multipart-parser');
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
    const captainEmail = result.email || '';
    const names = result.name || [];
    const sizes = result.size || [];
    const numbers = result.number || [];
    const anecdotes = result.anecdote || [];

    const sponsorLogoFile = result.files && result.files[0];
    let sponsorLogoFilename = '';
    let sponsorLogoAttachment = null;

    if (sponsorLogoFile && sponsorLogoFile.filename && sponsorLogoFile.content) {
      sponsorLogoFilename = sponsorLogoFile.filename;
      sponsorLogoAttachment = new Mailgun.Attachment({
        data: sponsorLogoFile.content, // Content should already be a Buffer
        filename: sponsorLogoFilename,
        contentType: sponsorLogoFile.contentType,
      });
    }

    let csvString = "Nom de l'équipe,Maillot,Nom,Taille,Numéro,Anecdote,Logo Sponsor,Email Capitaine\n";

    for (let i = 0; i < names.length; i++) {
      csvString += `${teamName},${jersey},"${names[i] || ''}","${sizes[i] || ''}",${numbers[i] || ''},"${anecdotes[i] || ''}","${sponsorLogoFilename}",${captainEmail}\n`;
    }

    const filename = `inscription_${teamName?.replace(/\s+/g, '_')}.csv`;
    const csvAttachment = new Mailgun.Attachment({ data: Buffer.from(csvString), filename: filename, contentType: 'text/csv' });

    const attachments = [csvAttachment];
    if (sponsorLogoAttachment) {
      attachments.push(sponsorLogoAttachment);
    }

    const data = {
      from: `Inscriptions Beach Rugby <postmaster@${process.env.MAILGUN_DOMAIN}>`,
      to: `rudy masse <rudy.masse@gmail.com>`, // Modifier ici pour captainEmail si souhaité
      subject: `Nouvelle inscription pour l'équipe ${teamName}`,
      text: `Ci-joint le fichier CSV des inscriptions de l'équipe ${teamName}.`,
      attachment: attachments,
    };

    await Mailgun.messages().send(data);

    return {
      statusCode: 303,
      headers: {
        "Location": "/thank-you"
      },
      body: JSON.stringify({ message: `Inscription enregistrée pour ${teamName}. Redirection vers la page de confirmation...` }),
    };

  } catch (error) {
    console.error("Error processing form or sending email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process form or send email' }),
    };
  }
};