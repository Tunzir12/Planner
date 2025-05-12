import DummyAPI from './DummyApi.jsx'

import { useEffect, useState } from 'react'

import { db } from '../firebase';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';


const asyncDataWrapper = (asyncFunction) => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await asyncFunction();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [asyncFunction]);

  return { data, loading, error };
}

const getProjects = () => {

  const inner = async () => {

    const querySnapshot = await getDocs(collection(db, "projects"));

    var projects = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))

    const usersRef = collection(db, 'users')

    const ownerIds = projects.map(doc => doc.owner)
    const ownersSnapshot = await getDocs(usersRef, ownerIds)

    var owners = []
    ownersSnapshot.docs.forEach(doc => {
      owners[doc.id] = ({ id: doc.id, ...doc.data() })
    })

    projects = projects.map(doc => ({ ...doc, owner: owners[doc.owner] }))

    return projects
  }

  return asyncDataWrapper(inner)
}

const getUser = (userId) => {
  const inner = async () => {

    const querySnapshot = await getDocs(collection(db, "users"), userId);

    const doc = querySnapshot.docs[0];
    const user = ({ id: doc.id, ...doc.data() })

    return user
  }

  return asyncDataWrapper(inner)
}

const getProject = (projectId) => {

  const inner = async () => {

    const querySnapshot = await getDocs(collection(db, "projects"), projectId);
    const doc = querySnapshot.docs[0];
    const project = ({ id: doc.id, ...doc.data() })

    return project
  }

  return asyncDataWrapper(inner)
}

const getGoal = (id) => {
  return goals[id]
}

const API = {
  getProjects: getProjects,
  getUser: getUser,
  getProject: getProject,
  getGoal: DummyAPI.getGoal,
  getTodo: DummyAPI.getTodo,
  getEvent: DummyAPI.getEvent
}

export default API 
