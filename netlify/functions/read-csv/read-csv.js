import fs from 'fs/promises'; // Utilisation de l'API asynchrone
import path from 'path';
import csv from 'csv-parser';

exports.handler = async (event) => {
  try {
    const dataDir = path.join(__dirname, 'data');
    const files = await fs.readdir(dataDir);
    const allResults = [];

    for (const file of files) {
      if (file.endsWith('.csv')) {
        const filePath = path.join(dataDir, file);
        const results = [];

        await new Promise((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
              const parsedData = {};
              for (const key in data) {
                if (data.hasOwnProperty(key)) {
                  try {
                    parsedData[key] = JSON.parse(data[key]);
                  } catch (e) {
                    parsedData[key] = data[key];
                  }
                }
              }
              results.push(parsedData);
            })
            .on('end', () => resolve())
            .on('error', (error) => reject(error));
        });
        allResults.push(...results); // Ajouter les résultats de chaque fichier au tableau global
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(allResults, null, 2),
    };

  } catch (error) {
    console.error('Erreur lors de la lecture des fichiers CSV :', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};