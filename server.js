// server.js
const express = require('express');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Instantiates a client
const client = new textToSpeech.TextToSpeechClient();

app.post('/synthesize', async (req, res) => {
    const { text, lang } = req.body;
    
    const request = {
        input: { text: text },
        voice: { 
            languageCode: lang, 
            ssmlGender: 'FEMALE' 
        },
        audioConfig: { 
            audioEncoding: 'MP3' 
        },
    };

    try {
        const [response] = await client.synthesizeSpeech(request);
        const writeFile = util.promisify(fs.writeFile);
        const fileName = `output-${Date.now()}.mp3`;
        await writeFile(`./public/${fileName}`, response.audioContent, 'binary');
        res.send({ fileName });
    } catch (error) {
        console.error('ERROR:', error);
        res.status(500).send(error);
    }
});

app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
