import { gapi } from 'gapi-script';

// Replace these with your Google Calendar API credentials from the Google Cloud Console
// Client ID: From OAuth 2.0 Client ID
const CLIENT_ID = 'REPLACE_WITH_YOUR_OAUTH_CLIENT_ID';
// API Key: From API Keys section
const API_KEY = 'REPLACE_WITH_YOUR_API_KEY';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/calendar';

export const initializeGoogleCalendar = () => {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        })
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  });
};

export const signIn = async () => {
  if (!gapi.auth2.getAuthInstance().isSignedIn.get()) {
    try {
      await gapi.auth2.getAuthInstance().signIn();
      return true;
    } catch (error) {
      console.error('Error signing in:', error);
      return false;
    }
  }
  return true;
};

export const signOut = () => {
  if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
    return gapi.auth2.getAuthInstance().signOut();
  }
};

export const listEvents = async (timeMin, timeMax) => {
  try {
    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.result.items;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const addEvent = async (event) => {
  try {
    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: {
        summary: event.title,
        description: event.description,
        start: {
          dateTime: event.start,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: event.end,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      },
    });

    return response.result;
  } catch (error) {
    console.error('Error adding event:', error);
    throw error;
  }
};
