const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Répertoire de destination
const audioDir = path.join(__dirname, 'src/assets/audio');
const dataFile = path.join(__dirname, 'src/assets/phrasesData.json');

// Création des dossiers si manquants
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, '[]', 'utf8');

// Configuration de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, audioDir);
  },
  filename: (req, file, cb) => {
    const phrase = req.body.phrase?.replace(/\s+/g, '_').toLowerCase().slice(0, 50);
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${phrase}${ext}`);
  }
});
const upload = multer({ storage });

/**
 * POST /upload-audio
 * Reçoit une phrase, ses types (optionnel), et un fichier audio.
 */
app.post('/upload-audio', upload.single('audio'), (req, res) => {
  const phrase = req.body.phrase;
  const types = req.body.types ? JSON.parse(req.body.types) : {};
  const file = req.file;

  if (!phrase || !file) {
    return res.status(400).json({ error: 'Phrase ou fichier audio manquant.' });
  }

  const audioPath = `assets/audio/${file.filename}`;
  const phraseEntry = { phrase, types, audioPath };

  // Sauvegarde dans le fichier JSON (append-style)
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    data.push(phraseEntry);
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Erreur lors de l’écriture JSON', err);
  }

  res.status(200).json({ message: 'Phrase et audio enregistrés.', filename: file.filename });
});

/**
 * POST /reupload-audio
 * Réupload d’un fichier audio pour une phrase existante (remplacement).
 */
app.post('/reupload-audio', upload.single('audio'), (req, res) => {
  const phrase = req.body.phrase;
  const file = req.file;

  if (!phrase || !file) {
    return res.status(400).json({ error: 'Phrase ou audio manquant.' });
  }

  const newAudioPath = `assets/audio/${file.filename}`;

  // Mise à jour du JSON si besoin
  try {
    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    const index = data.findIndex(p => p.phrase === phrase);
    if (index !== -1) {
      data[index].audioPath = newAudioPath;
      fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Erreur de mise à jour JSON', err);
  }

  res.status(200).json({ message: 'Audio mis à jour.', filename: file.filename });
});

// Lancer le serveur
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur lancé sur http://localhost:${PORT}`);
});
