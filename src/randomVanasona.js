const fs = require('fs').promises;
const path = require('path');

async function randomVanasona() {
    const filePath = path.join(__dirname, '..', 'txt', 'vanasonad.txt');

    const data = await fs.readFile(filePath, 'utf-8');

    const vanasonad = data
        .split(';')
        .map(vanasona => vanasona.trim())
        .filter(vanasona => vanasona.length > 0);

    const randomIndex = Math.floor(Math.random() * vanasonad.length);

    return vanasonad[randomIndex];
}

module.exports = randomVanasona;