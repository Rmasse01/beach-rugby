const Busboy = require('busboy');
const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  return new Promise((resolve, reject) => {
    const busboy = new Busboy({ headers: event.headers });
    const fields = {};
    const files = {};
    const fileWrites = [];

    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      const filepath = path.join(__dirname, 'data', filename);
      const writeStream = fs.createWriteStream(filepath);
      file.pipe(writeStream);
      fileWrites.push(new Promise((res, rej) => {
        writeStream.on('finish', () => res(filepath));
        writeStream.on('error', rej);
      }));
      files[fieldname] = { originalFilename: filename, path: filepath, mimetype };
    });

    busboy.on('field', (fieldname, val) => {
      if (fields[fieldname] && Array.isArray(fields[fieldname])) {
        fields[fieldname].push(val);
      } else if (fields[fieldname]) {
        fields[fieldname] = [fields[fieldname], val];
      } else {
        fields[fieldname] = val;
      }
    });

    busboy.on('finish', async () => {
      try {
        await Promise.all(fileWrites);

        console.log("fields:", fields);
        console.log("files:", files);

        const teamName = fields.teamName;
        const jersey = fields.jersey;
        const names = fields['name[]'] || [];
        const sizes = fields['size[]'] || [];
        const numbers = fields['number[]'] || [];
        const anecdotes = fields['anecdote[]'] || [];
        const sponsorLogo = files.sponsorLogo?.originalFilename || '';
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

      } catch (error) {
        console.error("Error processing form with busboy:", error);
        resolve({ statusCode: 500, body: JSON.stringify({ error: 'Failed to process form data' }) });
      }
    });

    busboy.on('error', (error) => {
      console.error("Busboy error:", error);
      resolve({ statusCode: 500, body: JSON.stringify({ error: 'Failed to parse form data' }) });
    });

    busboy.write(event.body, event.isBase64Encoded ? 'base64' : 'binary');
  });
};