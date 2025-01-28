const fs = require('fs');

// Leggi il file JSON
fs.readFile('finale.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Errore durante la lettura del file:', err);
    return;
  }

  // Parse il contenuto del file JSON
  let components = JSON.parse(data);

  // Imposta l'inizio del cardId
  let cardIdStart = 300000;

  // Aggiungi il campo cardId e incrementa di 1 per ogni componente
  components = components.map((component, index) => {
    return {
      ...component,
      cardId: cardIdStart + index
    };
  });

  // Scrivi i nuovi dati su un nuovo file JSON
  fs.writeFile('finaleWithIds.json', JSON.stringify(components, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Errore durante la scrittura del file:', err);
      return;
    }
    console.log('File salvato correttamente come output.json');
  });
});

