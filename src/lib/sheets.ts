import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

async function getSheetsClient() {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!clientEmail || !privateKey || !sheetId) {
        return null;
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: clientEmail,
            private_key: privateKey,
        },
        scopes: SCOPES,
    });

    return {
        sheets: google.sheets({ version: 'v4', auth }),
        sheetId
    };
}

export async function appendToSheet(values: string[][]) {
    try {
        const client = await getSheetsClient();
        if (!client) {
            console.warn("Google Sheets Credentials Missing");
            return false;
        }

        await client.sheets.spreadsheets.values.append({
            spreadsheetId: client.sheetId,
            range: 'Sheet1!A:Z',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: values,
            },
        });

        return true;
    } catch (error) {
        console.error("Google Sheets API Error:", error);
        return false;
    }
}

export async function getSheetData() {
    try {
        const client = await getSheetsClient();
        if (!client) return [];

        const response = await client.sheets.spreadsheets.values.get({
            spreadsheetId: client.sheetId,
            range: 'Sheet1!A:Z',
        });

        return response.data.values || [];
    } catch (error) {
        console.error("Error reading sheets:", error);
        return [];
    }
}
