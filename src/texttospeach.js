import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import jwt from 'jsonwebtoken';
import axios from "axios"

const __dirname = dirname(fileURLToPath(import.meta.url));

class TextConverter {
    async getToken() {
        const key = JSON.parse(
            readFileSync(resolve(__dirname, '../config/google-tgbot.json'), 'utf-8')
        )
        const token = jwt.sign(
            {
                iss: key.client_email,
                scope: 'https://www.googleapis.com/auth/cloud-platform',
                aud: 'https://www.googleapis.com/oauth2/v4/token',
                exp: Math.floor(Date.now() / 1000) + 60 * 60,
                iat: Math.floor(Date.now() / 1000),
            },
            key.private_key,
            { algorithm: 'RS256' }
        )

        const response = await axios.post(
            'https://www.googleapis.com/oauth2/v4/token',
            {
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: token,
            }
        )

        console.log(response.data.access_token);
        return response.data.access_token;
    }

    textToSpeach(text) {

    }

}

export const textConverter = new TextConverter();

textConverter.getToken();