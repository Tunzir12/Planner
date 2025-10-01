import DummyAPI from './DummyApi.jsx'

import { useEffect, useState } from 'react'

import { db } from '../firebase';
import {
  Timestamp,
  collection,
  getDocs,
  addDoc,
  setDoc,
  getDoc,
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

const getUserProjects = (uid) => {

  const inner = async () => {

    const querySnapshot = await getDocs(collection(db, "projects"));

    var projects = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(project => (project.members.includes(uid)))

    const usersRef = collection(db, 'users')

    const ownerIds = projects.map(doc => doc.owner)
    const ownersSnapshot = await getDocs(usersRef, ownerIds)

    var owners = []
    ownersSnapshot.docs.forEach(doc => {
      owners[doc.id] = ({ id: doc.id, ...doc.data() })
    })

    const goalsSnap = await getDocs(collection(db, "goals"));

    const goals = goalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    projects = projects.map(project => ({
      ...project,
      owner: owners[project.owner],
      milestonesTotal: goals.filter(goal => goal.projectId == project.id).length,
      milestonesCompleted: goals.filter(goal => (goal.projectId == project.id && goal.status == 2)).length,
    }))

    return projects
  }

  return asyncDataWrapper(inner)
}

const getUser = (userId) => {
  const inner = async () => {

    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    const user = ({ id: userDocSnap.id, ...userDocSnap.data() })

    return user
  }

  return asyncDataWrapper(inner)
}

const getProject = (projectId) => {

  const inner = async () => {

    const projectDocRef = doc(db, "projects", projectId);
    const projectDocSnap = await getDoc(projectDocRef);

    const project = ({ id: projectDocSnap.id, ...projectDocSnap.data() })

    const ownerDocRef = doc(db, "users", project.owner);
    const ownerDocSnap = await getDoc(ownerDocRef);

    project.owner = ({ id: ownerDocSnap.id, ...ownerDocSnap.data() })

    const goalsSnap = await getDocs(collection(db, "goals"));
    const goals = goalsSnap.docs.filter(doc => doc.data().projectId == project.id)


    project.milestonesTotal = goals.length
    project.milestonesCompleted = goals.filter(doc => doc.data().status == 2).length

    return project
  }

  return asyncDataWrapper(inner)
}

const getGoalsFromProjectId = (projectId) => {

  const inner = async () => {
    const querySnapshot = await getDocs(collection(db, "goals"));

    const goals = querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(goal => goal.projectId == projectId)

    return goals
  }

  return asyncDataWrapper(inner)
}

const getGoal = (goalId) => {

  const inner = async () => {

    const docRef = doc(db, "goals", goalId);
    const docSnap = await getDoc(docRef);

    const goal = ({ id: docSnap.id, ...docSnap.data() })

    return goal
  }

  return asyncDataWrapper(inner)
}


const setGoal = (goalId, goal) => {

  const inner = async () => {

    await setDoc(doc(db, "goals", goalId), goal, { merge: true })

  }

  return inner()

}

const goalDefaults = {
  assignedUserId: "",
  deadline: Timestamp.fromDate(new Date()),
  projectId: "v03N45JW7aG4R3ecIAuK",
  status: 0,
  title: "No title",
}

const addGoal = (goal) => {

  const inner = async () => {

    const goalDoc = {
      ...goalDefaults,
      ...goal,
      deadline: Timestamp.fromDate(goal.deadline),
    }

    await addDoc(collection(db, "goals"), goalDoc)
  }
  return inner()
}

const projectDefaults = {
  deadline: new Date(),
  milestonesCompleted: 0,
  milestonesTotal: 0,
  members: [],
}

const addProject = (project) => {

  const inner = async () => {

    const projectDoc = {
      ...projectDefaults,
      ...project,
      deadline: Timestamp.fromDate(project.deadline),
    }

    await addDoc(collection(db, "projects"), projectDoc)
  }
  return inner()
}
//////////////////// Update user information /////////////////////



///////////////////// API ///////////////////////////////
const API = {
  getUserProjects: getUserProjects,
  getUser: getUser,
  getProject: getProject,
  getTodo: DummyAPI.getTodo,
  getGoal: getGoal,
  setGoal: setGoal,
  addGoal: addGoal,
  addProject: addProject,
  getGoalsFromProjectId: getGoalsFromProjectId,
  getEvent: DummyAPI.getEvent
}

export default API 
