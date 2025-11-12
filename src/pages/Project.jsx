import React from 'react';
import { Link, useParams } from 'react-router-dom';

import DetailsList from '../components/DetailsList.jsx';
import Divider from '../components/Divider.jsx';
import Navbar from '../components/Navbar.jsx';
import StatusTag from '../components/StatusTag.jsx';
import Table from '../components/Table.jsx';
import Loading from '../components/Loading.jsx';
import PopupForm from '../components/PopupForm.jsx';

import { firebaseRest } from '../../api/firebaseRest.jsx';

// Headers
const GoalHeaders = ['Name', 'Assigned', 'Progress', 'Deadline'];

const DescriptionHeaders = ['Owner', 'Goals', 'Project Deadline'];

// Conversion functions
const goalToList = goal => [
  <Link
    to={'/goal/' + goal.id}
    className='font-medium text-gray-900 whitespace-nowrap dark:text-white'
  >
    {goal.title}
  </Link>,
  goal.assignedUserId || 'Unassigned',
  <StatusTag
    statusId={goal.status}
    updateStatus={async status => {
      try {
        await firebaseRest.update('goals', goal.id, { status: status });
      } catch (err) {
        console.error('Error updating goal status:', err);
      }
    }}
  />,
  goal.deadline ? new Date(goal.deadline).toDateString() : 'No deadline',
];

const projectToDescriptionList = project => [
  project.ownerName || project.owner || 'Unknown',
  (project.milestonesCompleted || 0) + ' / ' + (project.milestonesTotal || 0),
  project.deadline ? new Date(project.deadline).toDateString() : 'No deadline',
];

// Main component
const Project = () => {
  const { id } = useParams();
  const [project, setProject] = React.useState(null);
  const [goals, setGoals] = React.useState([]);
  const [loadingProject, setLoadingProject] = React.useState(true);
  const [loadingGoals, setLoadingGoals] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Fetch project data
  React.useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoadingProject(true);
        const projectData = await firebaseRest.get('projects', id);
        setProject(projectData);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err.message);
      } finally {
        setLoadingProject(false);
      }
    };

    if (id) {
      fetchProject();
    }
  }, [id]);

  // Fetch project goals
  React.useEffect(() => {
    const fetchGoals = async () => {
      try {
        setLoadingGoals(true);
        const projectGoals = await firebaseRest.query('goals', 'projectId', 'EQUAL', id);
        setGoals(projectGoals);
      } catch (err) {
        console.error('Error fetching goals:', err);
        setError(err.message);
      } finally {
        setLoadingGoals(false);
      }
    };

    if (id) {
      fetchGoals();
    }
  }, [id]);

  if (error) {
    console.log(error);
    return (
      <div>
        <Navbar />
        <div className='dark:bg-gray-900 min-h-screen h-full p-6'>
          <div className='text-red-500'>Error: {error}</div>
        </div>
      </div>
    );
  }

  if (loadingProject || loadingGoals)
    return (
      <div>
        <Navbar />
        <Loading></Loading>
      </div>
    );

  if (!project) {
    return (
      <div>
        <Navbar />
        <div className='dark:bg-gray-900 min-h-screen h-full p-6'>
          <div>Project not found</div>
        </div>
      </div>
    );
  }

  const descriptionList = projectToDescriptionList(project);
  const goalLists = goals.map(goalToList);
  const goalKeys = goals.map(goal => goal.id);

  const createGoal = (title, deadline) => ({
    assignedUserId: '',
    deadline: new Date(deadline),
    projectId: id,
    title: title,
    status: 0, // Default status
    createdAt: new Date(),
  });

  const handleCreateGoal = async formData => {
    try {
      const title = formData.get('title');
      const deadline = formData.get('deadline');
      const newGoal = createGoal(title, deadline);

      const createdGoal = await firebaseRest.create('goals', newGoal);

      // Update local state
      setGoals(prev => [...prev, createdGoal]);

      // Update project milestones count
      const updatedMilestonesTotal = (project.milestonesTotal || 0) + 1;
      await firebaseRest.update('projects', id, {
        milestonesTotal: updatedMilestonesTotal,
      });

      // Update local project state
      setProject(prev => ({
        ...prev,
        milestonesTotal: updatedMilestonesTotal,
      }));
    } catch (err) {
      console.error('Error creating goal:', err);
      alert('Failed to create goal: ' + err.message);
    }
  };

  return (
    <div className='dark:bg-gray-900 min-h-screen h-full'>
      <Navbar />
      <div className='px-6 '>
        <h1 className=' py-4 text-gray-900 dark:text-white text-2xl'>{project.name}</h1>
        <DetailsList headers={DescriptionHeaders} data={descriptionList} />
        <Divider title='Goals' />
        <Table headers={GoalHeaders} data={goalLists} keys={goalKeys} />
        <PopupForm title={'Create New Goal'} handleFormData={handleCreateGoal}>
          <label>
            Title:
            <input type='text' name='title' required />
          </label>
          <br />
          <label>
            Deadline:
            <input type='date' name='deadline' required />
          </label>
        </PopupForm>
      </div>
    </div>
  );
};

export default Project;
