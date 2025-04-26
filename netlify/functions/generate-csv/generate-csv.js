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
    const names = result['name[]'];
    const sizes = result['size[]'];
    const numbers = result['number[]'];
    const anecdotes = result['anecdote[]'];

    const ensureArray = (value) => {
      return Array.isArray(value) ? value : (typeof value === 'string' ? value.split(',') : (value ? [value] : []));
    };

    console.log("Names array:", names);
    console.log("Sizes array:", sizes);
    console.log("Numbers array:", numbers);
    console.log("Anecdotes array:", anecdotes);

    const allNames = ensureArray(names).map(name => `"${name.trim()}"`).join(';');
    const allSizes = ensureArray(sizes).map(size => size.trim()).join(';');
    const allNumbers = ensureArray(numbers).map(number => number.trim()).join(';');
    const allAnecdotes = ensureArray(anecdotes).map(anecdote => `"${anecdote.trim()}"`).join(';');
    const captainEmail = result.email || '';

    const sponsorLogoFile = result.files[0]; // Le fichier est dans un tableau
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

    let csvString = "Nom de l'équipe,Maillot,Noms,Tailles,Numéros,Anecdotes,Logo Sponsor,Email Capitaine\n";
    csvString += `${teamName},${jersey},${allNames},${allSizes},${allNumbers},${allAnecdotes},"${sponsorLogoFilename}",${captainEmail}\n`;

    const filename = `inscription_${teamName?.replace(/\s+/g, '_')}.csv`;
    const csvAttachment = new Mailgun.Attachment({ data: Buffer.from(csvString), filename: filename, contentType: 'text/csv' });

    const attachments = [csvAttachment];
    if (sponsorLogoAttachment) {
      attachments.push(sponsorLogoAttachment);
    }

    const data = {
      from: `Inscriptions Beach Rugby <postmaster@${process.env.MAILGUN_DOMAIN}>`, // Adresse d'envoi
      to: `rudy masse <rudy.masse@gmail.com>`, // Ton adresse de réception
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