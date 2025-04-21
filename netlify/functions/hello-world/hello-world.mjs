import { promises as fs } from 'fs';
import path from 'path';

export default async (request, context) => {
  try {
    const filePath = path.join(__dirname, 'donnees.csv');
    const csvContent = await fs.readFile(filePath, 'utf8');

    // Ici, tu as le contenu de ton fichier CSV dans la variable 'csvContent'
    // Tu peux maintenant le parser et le traiter.

    // Pour l'instant, on va juste le renvoyer comme réponse pour voir si ça fonctionne.
    return new Response(`Contenu du fichier CSV:\n\n${csvContent}`, {
      headers: { 'Content-Type': 'text/plain' },
      status: 200,
    });

  } catch (error) {
    console.error('Erreur lors de la lecture du fichier CSV :', error);
    return new Response(`Erreur lors de la lecture du fichier CSV : ${error.message}`, {
      status: 500,
    });
  }
};
