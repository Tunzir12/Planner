import { useState, useEffect } from 'react';
import { firebaseRest } from './firebaseRest';
import { auth } from '../../backend/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export const useEvents = () => {
  const [user] = useAuthState(auth);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchEvents();
    } else {
      setEvents([]);
    }
  }, [user]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the corrected query method
      const userEvents = await firebaseRest.query('events', 'userId', 'EQUAL', user.uid);
      setEvents(userEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async eventData => {
    setLoading(true);
    setError(null);
    try {
      const newEvent = await firebaseRest.create('events', {
        ...eventData,
        userId: user.uid,
      });
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      setError(err.message);
      console.error('Error creating event:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (id, eventData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedEvent = await firebaseRest.update('events', id, {
        ...eventData,
        userId: user.uid,
      });
      setEvents(prev => prev.map(event => (event.id === id ? updatedEvent : event)));
      return updatedEvent;
    } catch (err) {
      setError(err.message);
      console.error('Error updating event:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async id => {
    setLoading(true);
    setError(null);
    try {
      await firebaseRest.delete('events', id);
      setEvents(prev => prev.filter(event => event.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error deleting event:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  };
};
