import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

exports.handler = async (event) => {
  try {
    const filePath = path.join(__dirname, 'donnees.csv');
    const results = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => {
          const parsedData = {};
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              try {
                // Tente de parser la valeur si elle ressemble à un tableau JSON
                parsedData[key] = JSON.parse(data[key]);
              } catch (e) {
                // Si le parsing échoue, garde la valeur telle quelle
                parsedData[key] = data[key];
              }
            }
          }
          results.push(parsedData);
        })
        .on('end', () => resolve())
        .on('error', (error) => reject(error));
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(results, null, 2),
    };

  } catch (error) {
    console.error('Erreur lors de la lecture du fichier CSV :', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};