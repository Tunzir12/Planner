
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
          0,
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
          0,
        deadline:
          "Tomorrow",
      },
    ]
  },
];

const getProjects = () => { return projects }
const getProject = (id) => { return projects[id] }

export { getProjects, getProject }


