import { auth } from '../backend/firebase';

const FIRESTORE_URL = 'https://firestore.googleapis.com/v1/projects';

class FirebaseRestService {
  constructor(projectId) {
    this.projectId = projectId;
    this.baseUrl = `${FIRESTORE_URL}/${projectId}/databases/(default)/documents`;
  }

  // Get ID token for authenticated requests
  async getIdToken() {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken(true); // Force token refresh
    }
    return null;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const idToken = await this.getIdToken();
    if (!idToken) {
      throw new Error('User not authenticated');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const defaultOptions = {
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Firestore API error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    if (options.method !== 'DELETE') {
      return await response.json();
    }

    return null;
  }

  //The toFirestoreFormat method:
  toFirestoreFormat(data) {
    const fields = {};
    Object.keys(data).forEach(key => {
      const value = data[key];
      if (typeof value === 'string') {
        fields[key] = { stringValue: value };
      } else if (typeof value === 'boolean') {
        fields[key] = { booleanValue: value };
      } else if (typeof value === 'number') {
        fields[key] = { integerValue: value };
      } else if (value instanceof Date) {
        fields[key] = { timestampValue: value.toISOString() };
      } else if (value === null) {
        fields[key] = { nullValue: null };
      } else if (Array.isArray(value)) {
        // Handle arrays
        fields[key] = {
          arrayValue: {
            values: value.map(item => {
              if (typeof item === 'object' && item !== null) {
                return { mapValue: { fields: this.toFirestoreFormat(item).fields } };
              } else if (typeof item === 'string') {
                return { stringValue: item };
              } else if (typeof item === 'number') {
                return { integerValue: item };
              } else if (typeof item === 'boolean') {
                return { booleanValue: item };
              }
              return { nullValue: null };
            }),
          },
        };
      } else if (typeof value === 'object' && value !== null) {
        // Handle objects
        fields[key] = {
          mapValue: {
            fields: this.toFirestoreFormat(value).fields,
          },
        };
      }
    });
    return { fields };
  }

  // Convert from Firestore format
  fromFirestoreFormat(document) {
    const result = { id: document.name.split('/').pop() };
    if (document.fields) {
      Object.keys(document.fields).forEach(key => {
        const field = document.fields[key];
        const fieldType = Object.keys(field)[0];
        let value = field[fieldType];

        if (fieldType === 'timestampValue') {
          value = new Date(value);
        } else if (fieldType === 'integerValue') {
          value = parseInt(value, 10);
        } else if (fieldType === 'doubleValue') {
          value = parseFloat(value);
        } else if (fieldType === 'booleanValue') {
          value = Boolean(value);
        } else if (fieldType === 'nullValue') {
          value = null;
        }

        result[key] = value;
      });
    }
    return result;
  }

  // CRUD operations

  // Create a new document
  async create(collection, data) {
    const firestoreData = this.toFirestoreFormat(data);
    const result = await this.request(`/${collection}`, {
      method: 'POST',
      body: JSON.stringify(firestoreData),
    });
    return { id: result.name.split('/').pop(), ...data };
  }

  // Get a specific document
  async get(collection, id) {
    const result = await this.request(`/${collection}/${id}`);
    return this.fromFirestoreFormat(result);
  }

  // Get all documents with optional filtering
  async getAll(collection, filters = []) {
    try {
      // Use the list API and filter client-side
      const result = await this.request(`/${collection}`);

      if (!result.documents) {
        return [];
      }

      let documents = result.documents.map(doc => this.fromFirestoreFormat(doc));

      // Apply filters client-side
      if (filters.length > 0) {
        documents = documents.filter(doc => {
          return filters.every(filter => {
            if (filter.operator === 'EQUAL') {
              return doc[filter.field] === filter.value;
            }
            // Add other operators as needed
            return true;
          });
        });
      }

      return documents;
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  }

  // Corrected query method using runQuery
  async query(collection, field, operator, value) {
    try {
      // The correct format for runQuery is to send the structuredQuery directly as the request body
      const structuredQuery = {
        from: [{ collectionId: collection }],
        where: {
          fieldFilter: {
            field: { fieldPath: field },
            op: operator,
            value: this.toFirestoreValue(value),
          },
        },
      };

      const result = await this.request(`:runQuery`, {
        method: 'POST',
        body: JSON.stringify({ structuredQuery }),
      });

      return result
        .filter(item => item.document)
        .map(item => this.fromFirestoreFormat(item.document));
    } catch (error) {
      console.error('Error in query:', error);
      // Fall back to client-side filtering
      const allDocs = await this.getAll(collection);
      return allDocs.filter(doc => doc[field] === value);
    }
  }


  // Helper to convert values to Firestore format for queries
  toFirestoreValue(value) {
    if (typeof value === 'string') {
      return { stringValue: value };
    } else if (typeof value === 'boolean') {
      return { booleanValue: value };
    } else if (typeof value === 'number') {
      return { integerValue: value };
    } else if (value instanceof Date) {
      return { timestampValue: value.toISOString() };
    }
    return { nullValue: null };
  }

  // Update a document
  async update(collection, id, data) {
    const firestoreData = this.toFirestoreFormat(data);
    await this.request(`/${collection}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(firestoreData),
    });
    return { id, ...data };
  }

  // Delete a document
  async delete(collection, id) {
    await this.request(`/${collection}/${id}`, {
      method: 'DELETE',
    });
    return true;
  }
}

// Create an instance with your project ID
export const firebaseRest = new FirebaseRestService('goalgetter-tddd27');
