exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method Not Allowed' };
    }
  
    try {
      const data = JSON.parse(event.body);
  
      const teamName = data.teamName;
      const jersey = data.jersey;
      const names = data.name || [];
      const sizes = data.size || [];
      const numbers = data.number || [];
      const anecdotes = data.anecdote || [];
      const sponsorLogo = data.sponsorLogo || '';
      const email = data.email;
  
      let csvString = "Nom de l'équipe,Maillot,Nom,Taille,Numéro,Anecdote,Logo Sponsor,Email Capitaine\n";
  
      const numPlayers = Math.max(names.length, sizes.length, numbers.length, anecdotes.length);
  
      for (let i = 0; i < numPlayers; i++) {
        const playerName = names[i] || '';
        const playerSize = sizes[i] || '';
        const playerNumber = numbers[i] || '';
        const playerAnecdote = anecdotes[i] || '';
  
        csvString += `${teamName},${jersey},"${playerName}",${playerSize},${playerNumber},"${playerAnecdote}","${sponsorLogo}",${email}\n`;
      }
  
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="inscription_${teamName.replace(/\s+/g, '_')}.csv"`,
        },
        body: csvString,
      };
  
    } catch (error) {
      console.error("Error processing form submission:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to process submission' }),
      };
    }
  };