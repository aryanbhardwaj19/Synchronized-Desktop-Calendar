import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Box, Paper, Dialog, DialogTitle, DialogContent, TextField, Button, Snackbar, Alert, Container } from '@mui/material';
import { initializeGoogleCalendar, signIn, listEvents, addEvent } from '../services/googleCalendar';
import { testGoogleCalendarIntegration } from '../utils/calendarTest';


const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const initCalendar = async () => {
      try {
        await initializeGoogleCalendar();
        const isSignedIn = await signIn();
        if (isSignedIn) {
          await fetchEvents();
        }
      } catch (error) {
        console.error('Error initializing calendar:', error);
        setSnackbar({
          open: true,
          message: 'Failed to initialize Google Calendar',
          severity: 'error'
        });
      }
    };

    initCalendar();
  }, []);

  const fetchEvents = async () => {
    try {
      const now = new Date();
      const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      
      const calendarEvents = await listEvents(oneYearAgo, oneYearFromNow);
      const formattedEvents = calendarEvents.map(event => ({
        title: event.summary,
        description: event.description,
        start: event.start.dateTime || event.start.date,
        end: event.end.dateTime || event.end.date,
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch events',
        severity: 'error'
      });
    }
  };

  const handleDateSelect = (selectInfo) => {
    setSelectedDate(selectInfo);
    setOpenDialog(true);
  };

  const handleEventAdd = async () => {
    if (eventTitle) {
      try {
        const newEvent = {
          title: eventTitle,
          description: eventDescription,
          start: selectedDate.startStr,
          end: selectedDate.endStr,
        };
        
        await addEvent(newEvent);
        await fetchEvents(); // Refresh events list
        
        handleCloseDialog();
        setSnackbar({
          open: true,
          message: 'Event added successfully',
          severity: 'success'
        });
      } catch (error) {
        console.error('Error adding event:', error);
        setSnackbar({
          open: true,
          message: 'Failed to add event',
          severity: 'error'
        });
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEventTitle('');
    setEventDescription('');
    setSelectedDate(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleTest = async () => {
    try {
      setSnackbar({
        open: true,
        message: 'Running integration tests...',
        severity: 'info'
      });

      const results = await testGoogleCalendarIntegration();
      
      const allTestsPassed = Object.values(results).every(result => result === true);
      
      setSnackbar({
        open: true,
        message: allTestsPassed 
          ? 'All integration tests passed successfully!' 
          : 'Some tests failed. Check console for details.',
        severity: allTestsPassed ? 'success' : 'error'
      });
    } catch (error) {
      console.error('Test failed:', error);
      setSnackbar({
        open: true,
        message: 'Integration tests failed. Check console for details.',
        severity: 'error'
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {process.env.NODE_ENV === 'development' && (
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={handleTest}
          sx={{ mb: 2 }}
        >
          Test Integration
        </Button>
      )}
      
      <div className="calendar-container">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          select={handleDateSelect}
          height="auto"
        />
      </div>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Event</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Event Title"
            fullWidth
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Event Description"
            fullWidth
            multiline
            rows={4}
            value={eventDescription}
            onChange={(e) => setEventDescription(e.target.value)}
          />
          <Button onClick={handleEventAdd} color="primary" sx={{ mt: 2 }}>
            Add Event
          </Button>
        </DialogContent>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Calendar;
