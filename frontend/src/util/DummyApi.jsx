
const projects = [
  {
    name: "Project 1",
    id: "0",
    owner: "Me",
    milestones:
    {
      total: 10,
      completed: 5,
    },

    deadline: "Never",

  },
  {
    name: "Hello",
    id: "1",
    owner: "Me",
    milestones:
    {
      total: 30,
      completed: 1,
    },

    deadline: "Never",
  },
];

const projectGoals = [
  { project: 0, goal: 0 },
  { project: 0, goal: 1 },
  { project: 0, goal: 2 },
  { project: 0, goal: 3 },
  { project: 1, goal: 4 },
]


const goals =
  [
    {
      title: "Do thing",
      assigned: "Me",
      status: 2,
      deadline: "Yesterday",
    },

    {
      title: "Do other thing",
      assigned: "Me",
      status: 1,
      deadline: "Today",
    },

    {
      title:
        "Do nothing",
      assigned:
        "Friend",
      status:
        0,
      deadline:
        "Today",
    },

    {
      title:
        "Chill",
      assigned:
        "Me ",
      status:
        3,
      deadline:
        "Tomorrow",
    },
    {
      title:
        "Chill",
      assigned:
        "Me ",
      status:
        0,
      deadline:
        "Tomorrow",
    },
  ]

const getProjects = () => { return projects }
const getProject = (id) => {


  var project = projects[id]

  const goalIds = projectGoals.filter((relation) => (
    relation.project == id
  ));
  project.goals = goalIds.map((relation) => (goals[relation.goal]))

  return project

}

const getGoal = (id) => {
  return goals[id]
}

const events = [
  {
    title: "Team Meeting",
    description: "Weekly project sync with the team.",
    start: "2025-05-08T09:00:00",
    end: "2025-05-09T10:30:00",
    allDay: false,
    textColor: "#e5e508",
    backgroundColor: "#cc2bf3",
  },
  {
    title: "coursework meeting",
    description: "Weekly project sync with the team.",
    start: "2025-05-10",
    end: "2025-05-10",
    allDay: true,
    textColor: "#e5e508",
    backgroundColor: "#cc2bf3",
  },
  {
    title: 'BCH237',
    start: '2025-05-12T10:30:00',
    end: '2025-05-12T11:30:00',
    extendedProps: {
      department: 'BioChemistry'
    },
    description: 'Lecture',
  },
]

const todo = [
  {
    title:"buy groceries",
    dueDate:"2025-05-07",
    status:"Not completed",
  },
  {
    title:"complete homework",
    dueDate:"2025-05-10",
    status:"Not completed",
  },
  {
    title:"plant waters",
    dueDate:"2025-05-01",
    status:"Completed",
  },
]

const getTodo = () => { return todo}
const getEvents = () => { return events}

const getName = async (id) => {
  return "Ronalds"
}

const API = {
  getProjects: getProjects,
  getProject: getProject,
  getGoal: getGoal,
  getName: getName,
  getTodo: getTodo,
  getEvents: getEvents
}


// export { getProjects, getProject, getGoal, getTodo, getEvent }
export default API
