import { useState, useEffect } from 'react';
import { useAuth } from './routeComp/privateRoute';
import { firebaseRest } from '../../api/firebaseRest';

const createTodoService = () => {
  const baseService = collection => ({
    create: data =>
      firebaseRest.create(collection, {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),

    update: (id, data) =>
      firebaseRest.update(collection, id, {
        ...data,
        updatedAt: new Date(),
      }),

    delete: id => firebaseRest.delete(collection, id),

    query: (field, operator, value) => firebaseRest.query(collection, field, operator, value),
  });

  const todos = baseService('todos');
  const events = baseService('events');

  return {
    // todo list items
    createItem: itemData => todos.create(itemData),
    updateItem: (id, itemData) => todos.update(id, itemData),
    deleteItem: id => todos.delete(id),

    getUserItems: userId => todos.query('userId', 'EQUAL', userId),
    getUserHistory: userId =>
      todos
        .query('userId', 'EQUAL', userId)
        .then(items => items.filter(item => item.type === 'todo' && item.completed)),

    // Calendar events
    getEventsByTodoId: todoId => events.query('todoId', 'EQUAL', todoId),
    createCalendarEvent: eventData => events.create(eventData),
    deleteCalendarEvent: eventId => events.delete(eventId),
  };
};

const todoService = createTodoService();

const ToDoComp = () => {
  const [state, setState] = useState({
    items: [],
    history: [],
    loading: false,
    error: null,
  });

  const { currentUser } = useAuth();

  const setLoading = loading => setState(prev => ({ ...prev, loading }));
  const setError = error => setState(prev => ({ ...prev, error }));
  const updateItems = updater => setState(prev => ({ ...prev, items: updater(prev.items) }));
  const updateHistory = updater => setState(prev => ({ ...prev, history: updater(prev.history) }));

  useEffect(() => {
    if (currentUser?.uid) {
      loadData();
    }
  }, [currentUser?.uid]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [userItems, userHistory] = await Promise.all([
        todoService.getUserItems(currentUser.uid),
        todoService.getUserHistory(currentUser.uid),
      ]);

      setState(prev => ({
        ...prev,
        items: userItems,
        history: userHistory,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const executeOperation = async (operation, { onSuccess, onError } = {}) => {
    setLoading(true);
    setError(null);

    try {
      const result = await operation();
      onSuccess?.(result);
      return result;
    } catch (err) {
      setError(err.message);
      onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCalendarEvents = async todoId => {
    try {
      const events = await todoService.getEventsByTodoId(todoId);
      await Promise.all(events.map(event => todoService.deleteCalendarEvent(event.id)));
    } catch (error) {
      console.error('Error deleting calendar events:', error);
    }
  };

  const createItem = async itemData =>
    executeOperation(
      () =>
        todoService.createItem({
          ...itemData,
          userId: currentUser.uid,
          completed: false,
        }),
      {
        onSuccess: newItem => {
          updateItems(prev => [newItem, ...prev]);

          if (itemData.type === 'todo' && itemData.deadline) {
            todoService.createCalendarEvent({
              title: `Todo: ${itemData.title}`,
              description: itemData.description || '',
              start: new Date(itemData.deadline),
              end: new Date(new Date(itemData.deadline).getTime() + 60 * 60 * 1000),
              allDay: false,
              backgroundColor: '#FF6B6B',
              userId: currentUser.uid,
              todoId: newItem.id,
              editable: false,
              isTodoEvent: true,
            });
          }
        },
      },
    );

  const updateItem = async (id, updates) =>
    executeOperation(() => todoService.updateItem(id, updates), {
      onSuccess: updatedItem => {
        updateItems(prev =>
          prev.map(item => (item.id === id ? { ...item, ...updatedItem } : item)),
        );

        if (updates.deadline) {
          deleteCalendarEvents(id);

          todoService.createCalendarEvent({
            title: `Todo: ${updatedItem.title}`,
            description: updatedItem.description || '',
            start: new Date(updates.deadline),
            end: new Date(new Date(updates.deadline).getTime() + 60 * 60 * 1000),
            allDay: false,
            backgroundColor: '#FF6B6B',
            userId: currentUser.uid,
            todoId: id,
            editable: false,
            isTodoEvent: true,
          });
        }
      },
    });

  const deleteItem = async id =>
    executeOperation(
      async () => {
        await deleteCalendarEvents(id);
        await todoService.deleteItem(id);
      },
      {
        onSuccess: () => {
          updateItems(prev => prev.filter(item => item.id !== id));
          updateHistory(prev => prev.filter(item => item.id !== id));
        },
      },
    );

  const toggleComplete = async id => {
    const item = state.items.find(item => item.id === id);
    if (!item || item.type !== 'todo') return;

    if (!item.completed) {
      await executeOperation(
        async () => {
          await deleteCalendarEvents(id);
          return todoService.updateItem(id, {
            ...item,
            completed: true,
            completedAt: new Date(),
          });
        },
        {
          onSuccess: completedItem => {
            updateItems(prev => prev.filter(item => item.id !== id));
            updateHistory(prev => [completedItem, ...prev]);
          },
        },
      );
    } else {
      await updateItem(id, {
        completed: false,
        completedAt: null,
      });
    }
  };

  const restoreFromHistory = async id => {
    const historyItem = state.history.find(item => item.id === id);
    if (!historyItem) return;

    await executeOperation(
      () =>
        todoService.updateItem(id, {
          ...historyItem,
          completed: false,
          completedAt: null,
        }),
      {
        onSuccess: restoredItem => {
          updateHistory(prev => prev.filter(item => item.id !== id));
          updateItems(prev => [restoredItem, ...prev]);

          // Recreate calendar event if there's a deadline
          if (restoredItem.deadline) {
            todoService.createCalendarEvent({
              title: `Todo: ${restoredItem.title}`,
              description: restoredItem.description || '',
              start: new Date(restoredItem.deadline),
              end: new Date(new Date(restoredItem.deadline).getTime() + 60 * 60 * 1000),
              allDay: false,
              backgroundColor: '#FF6B6B',
              userId: currentUser.uid,
              todoId: id,
              editable: false,
              isTodoEvent: true,
            });
          }
        },
      },
    );
  };

  const clearHistory = async () =>
    executeOperation(
      async () => {
        await Promise.all(state.history.map(item => deleteCalendarEvents(item.id)));
        await Promise.all(state.history.map(item => todoService.deleteItem(item.id)));
      },
      { onSuccess: () => updateHistory(() => []) },
    );

  return {
    ...state,
    createItem,
    updateItem,
    deleteItem,
    toggleComplete,
    restoreFromHistory,
    clearHistory,
    refetch: loadData,
    refetchHistory: () => todoService.getUserHistory(currentUser.uid).then(updateHistory),
  };
};

export default ToDoComp;
