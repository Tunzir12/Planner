
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

    goals: [

      {
        title: "Do thing",
        assigned: "Me",
        status: "Completed",
        deadline: "Yesterday",
      },

      {
        title: "Do other thing",
        assigned: "Me",
        status: "Started",
        deadline: "Today",
      },

      {
        title:
          "Do nothing",
        assigned:
          "Friend",
        status:
          "Not started",
        deadline:
          "Today",
      },

      {
        title:
          "Chill",
        assigned:
          "Me ",
        status:
          "Not started",
        deadline:
          "Tomorrow",
      },
    ]
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
    goals: [
      {
        title:
          "Chill",
        assigned:
          "Me ",
        status:
          "Not started",
        deadline:
          "Tomorrow",
      },
    ]
  },
];

const getProjects = () => (projects)
const getProject = (id) => (projects[id])

export default { getProjects, getProject }


