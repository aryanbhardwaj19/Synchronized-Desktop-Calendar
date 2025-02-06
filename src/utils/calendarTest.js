import { initializeGoogleCalendar, signIn, listEvents, addEvent } from '../services/googleCalendar';

export const testGoogleCalendarIntegration = async () => {
  const results = {
    initialization: false,
    signIn: false,
    eventsFetch: false,
    eventCreation: false,
  };

  try {
    // Test 1: Initialize Google Calendar
    await initializeGoogleCalendar();
    results.initialization = true;
    console.log('✅ Google Calendar initialized successfully');

    // Test 2: Sign In
    const isSignedIn = await signIn();
    results.signIn = isSignedIn;
    console.log(isSignedIn ? '✅ Signed in successfully' : '❌ Sign in failed');

    if (isSignedIn) {
      // Test 3: Fetch Events
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      const events = await listEvents(now, oneHourLater);
      results.eventsFetch = true;
      console.log('✅ Events fetched successfully:', events.length, 'events found');

      // Test 4: Create Test Event
      const testEvent = {
        title: 'Test Event',
        description: 'This is a test event created by the Calendar Sync App',
        start: now.toISOString(),
        end: oneHourLater.toISOString(),
      };

      const createdEvent = await addEvent(testEvent);
      results.eventCreation = true;
      console.log('✅ Test event created successfully:', createdEvent.id);
    }

    return results;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return results;
  }
};
