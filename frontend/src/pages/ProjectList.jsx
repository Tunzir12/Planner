import React from 'react';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import User from '../components/User';
import PopupForm from '../components/PopupForm.jsx';
import Loading from '../components/Loading';
import { Link } from 'react-router-dom';
import { useAuth } from '../components/routeComp/privateRoute';
import { firebaseRest } from '../firebaseRest';

const HEADERS = ['Name', 'Owner', 'Goals', 'Deadline'];

const projectToList = pr => [
  <Link
    to={'/projects/' + pr.id}
    className='font-medium text-gray-900 whitespace-nowrap dark:text-white'
  >
    {pr.name}
  </Link>,
  <span>{pr.ownerName || pr.ownerEmail || 'Unknown User'}</span>,
  (pr.milestonesCompleted || 0) + ' / ' + (pr.milestonesTotal || 0),
  pr.deadline ? new Date(pr.deadline).toDateString() : 'No deadline',
];

const ProjectList = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [userEmails, setUserEmails] = React.useState(['']);
  const [emailLookupCache, setEmailLookupCache] = React.useState({});
  const [emailErrors, setEmailErrors] = React.useState({});
  const [isCreatingProject, setIsCreatingProject] = React.useState(false);

  // Improved project fetching
  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        console.log('=== DEBUG: Fetching projects for user:', currentUser.uid);

        let userProjects = [];

        try {
          // Try query for projects where user is a member
          userProjects = await firebaseRest.query(
            'projects',
            'members',
            'ARRAY_CONTAINS',
            currentUser.uid,
          );
          console.log('=== DEBUG: Query found projects:', userProjects.length);
        } catch (queryError) {
          console.warn('=== DEBUG: Query failed, using client filtering:', queryError);
          const allProjects = await firebaseRest.getAll('projects');
          userProjects = allProjects.filter(project => {
            // Unified member checking
            return isUserMemberOfProject(project, currentUser.uid);
          });
        }

        setProjects(userProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.uid) {
      fetchProjects();
    }
  }, [currentUser.uid]);

  // Helper function to check if user is member of project
  const isUserMemberOfProject = (project, userId) => {
    if (!project || !userId) return false;

    // Check members array
    if (Array.isArray(project.members) && project.members.includes(userId)) {
      return true;
    }

    // Check members object (if stored as key-value pairs)
    if (
      typeof project.members === 'object' &&
      project.members !== null &&
      project.members[userId]
    ) {
      return true;
    }

    // Check owner
    if (project.owner === userId) {
      return true;
    }

    // Check memberDetails array
    if (Array.isArray(project.memberDetails)) {
      return project.memberDetails.some(member => member.uid === userId);
    }

    return false;
  };

  const findUserByEmail = async email => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) return null;

    // Check cache first
    if (emailLookupCache[trimmedEmail]) {
      return emailLookupCache[trimmedEmail];
    }

    try {
      const allUsers = await firebaseRest.getAll('users');
      const foundUser = allUsers.find(user => {
        const userEmail = user.email?.toLowerCase();
        const userPendingEmail = user.pendingEmail?.toLowerCase();
        return userEmail === trimmedEmail || userPendingEmail === trimmedEmail;
      });

      if (foundUser) {
        setEmailLookupCache(prev => ({
          ...prev,
          [trimmedEmail]: foundUser,
        }));
        setEmailErrors(prev => ({
          ...prev,
          [email]: null,
        }));
        return foundUser;
      } else {
        setEmailErrors(prev => ({
          ...prev,
          [email]: `User with email "${email}" not found`,
        }));
        return null;
      }
    } catch (err) {
      console.error('Error finding user by email:', err);
      setEmailErrors(prev => ({
        ...prev,
        [email]: 'Error searching for user',
      }));
      return null;
    }
  };

  // Real-time email validation
  const validateEmail = async (email, index) => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailErrors(prev => ({ ...prev, [index]: null }));
      return true;
    }

    if (!isValidEmail(trimmedEmail)) {
      setEmailErrors(prev => ({ ...prev, [index]: 'Invalid email format' }));
      return false;
    }

    const user = await findUserByEmail(trimmedEmail);
    return !!user;
  };

  const addEmailField = () => {
    setUserEmails(prev => [...prev, '']);
  };

  const removeEmailField = index => {
    setUserEmails(prev => prev.filter((_, i) => i !== index));
    setEmailErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[index];
      return newErrors;
    });
  };

  const updateEmailField = async (index, value) => {
    setUserEmails(prev => prev.map((email, i) => (i === index ? value : email)));

    // Clear previous error
    setEmailErrors(prev => ({ ...prev, [index]: null }));

    // Validate if email is not empty
    if (value.trim()) {
      await validateEmail(value, index);
    }
  };

  const isValidEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateAllEmails = async () => {
    const newErrors = {};
    let hasErrors = false;

    for (let i = 0; i < userEmails.length; i++) {
      const email = userEmails[i];
      if (email.trim()) {
        const isValid = await validateEmail(email, i);
        if (!isValid && !newErrors[i]) {
          newErrors[i] = emailErrors[i] || 'Invalid email';
          hasErrors = true;
        }
      }
    }

    setEmailErrors(prev => ({ ...prev, ...newErrors }));
    return !hasErrors;
  };

  const createProject = async (name, deadline) => {
    // Use Set to avoid duplicate members
    const membersSet = new Set([currentUser.uid]);
    const memberDetails = [
      {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email,
        role: 'owner',
      },
    ];

    // Process additional email addresses
    const validEmails = userEmails.filter(email => email.trim() !== '');

    console.log('=== DEBUG: Processing emails:', validEmails);

    for (const email of validEmails) {
      const user = await findUserByEmail(email);
      console.log('=== DEBUG: User found for email', email, ':', user);

      if (user && user.uid) {
        if (!membersSet.has(user.uid)) {
          membersSet.add(user.uid);
          memberDetails.push({
            uid: user.uid,
            email: user.email || user.pendingEmail,
            displayName: user.displayName || user.email || user.pendingEmail,
            role: 'member',
          });
        }
      } else {
        throw new Error(`User with email "${email}" not found in system`);
      }
    }

    const members = Array.from(membersSet);

    console.log('=== DEBUG: Final members:', members);
    console.log('=== DEBUG: Final memberDetails:', memberDetails);

    const projectData = {
      deadline: new Date(deadline),
      milestonesCompleted: 0,
      milestonesTotal: 0,
      name: name,
      owner: currentUser.uid,
      ownerName: currentUser.displayName || currentUser.email,
      ownerEmail: currentUser.email,
      members: members, // Store as array for querying
      memberDetails: memberDetails, // Store detailed info
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return projectData;
  };

  const handleProjectFormData = async formData => {
    if (isCreatingProject) return; // Prevent multiple submissions

    try {
      setIsCreatingProject(true);
      const name = formData.get('name');
      const deadline = formData.get('deadline');

      if (!name || !deadline) {
        alert('Please fill in all required fields');
        return;
      }

      console.log('=== DEBUG: Starting project creation...');

      // Validate all emails before creating project
      const emailsValid = await validateAllEmails();
      if (!emailsValid) {
        alert('Please fix email validation errors before creating project');
        return;
      }

      const newProject = await createProject(name, deadline);
      console.log('=== DEBUG: Project data to save:', newProject);

      const createdProject = await firebaseRest.create('projects', newProject);
      console.log('=== DEBUG: Project created:', createdProject);

      // Add new project to local state instead of refetching
      setProjects(prev => [...prev, { ...newProject, id: createdProject.id }]);

      // Reset form state
      setUserEmails(['']);
      setEmailErrors({});

      alert('Project created successfully!');
    } catch (err) {
      console.error('Error creating project:', err);
      alert('Failed to create project: ' + err.message);
    } finally {
      setIsCreatingProject(false);
    }
  };

  if (loading) {
    return (
      <div className='dark:bg-gray-900 min-h-screen h-full'>
        <Navbar />
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className='dark:bg-gray-900 min-h-screen h-full'>
        <Navbar />
        <div className='p-6 text-red-500'>Error: {error}</div>
      </div>
    );
  }

  const list = projects.map(projectToList);
  const keys = projects.map(project => project.id);

  return (
    <div className='dark:bg-gray-900 min-h-screen h-full'>
      <Navbar />
      <div className='px-6'>
        <h1 className='px-6 py-4 text-gray-900 dark:text-white'>Projects</h1>
        <Table headers={HEADERS} data={list} keys={keys} />
        <PopupForm
          title={'New Project'}
          handleFormData={handleProjectFormData}
          onClose={() => {
            setUserEmails(['']);
            setEmailErrors({});
          }}
          disabled={isCreatingProject}
        >
          <label className='block mb-4'>
            <span className='text-gray-700 dark:text-gray-300'>Project Title:</span>
            <input
              type='text'
              name='name'
              required
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
            />
          </label>

          <div className='mb-4'>
            <label className='text-gray-700 dark:text-gray-300'>Add team members by email:</label>
            {userEmails.map((email, index) => (
              <div key={index} className='mt-2'>
                <div className='flex items-center'>
                  <input
                    type='email'
                    value={email}
                    onChange={e => updateEmailField(index, e.target.value)}
                    placeholder='Enter email address'
                    className={`flex-1 rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white p-2 ${
                      emailErrors[index] ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {userEmails.length > 1 && (
                    <button
                      type='button'
                      onClick={() => removeEmailField(index)}
                      className='ml-2 px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600'
                    >
                      Remove
                    </button>
                  )}
                </div>
                {emailErrors[index] && (
                  <p className='text-red-500 text-sm mt-1'>{emailErrors[index]}</p>
                )}
              </div>
            ))}
            <button
              type='button'
              onClick={addEmailField}
              className='mt-2 px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600'
            >
              Add Another Email
            </button>
          </div>

          <label className='block'>
            <span className='text-gray-700 dark:text-gray-300'>Deadline:</span>
            <input
              type='date'
              name='deadline'
              required
              min={new Date().toISOString().split('T')[0]}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
            />
          </label>
        </PopupForm>
      </div>
    </div>
  );
};

export default ProjectList;
