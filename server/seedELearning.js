const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ELearningCourse = require('./models/ELearningCourse');

dotenv.config();

const E_LEARNING_COURSES = [
  {
    title: 'Advanced Data Structures and Algorithms',
    university: 'IIT Madras',
    subject: 'Computer Science',
    semester: 'Semester 5',
    instructor: 'Prof. Naveen Garg',
    duration: '12 Weeks',
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
    rating: 4.8,
    enrolled: 15420,
    progress: 45
  },
  {
    title: 'Machine Learning for Engineers',
    university: 'Stanford Online',
    subject: 'Artificial Intelligence',
    semester: 'Semester 6',
    instructor: 'Dr. Andrew Ng',
    duration: '10 Weeks',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    rating: 4.9,
    enrolled: 22100,
    progress: 0
  },
  {
    title: 'Differential Equations in Engineering',
    university: 'MIT OpenCourseWare',
    subject: 'Mathematics',
    semester: 'Semester 3',
    instructor: 'Prof. Arthur Mattuck',
    duration: '14 Weeks',
    image: 'https://images.unsplash.com/photo-1635070041071-e6f0b0bd3a0c?w=800&q=80',
    rating: 4.7,
    enrolled: 8500,
    progress: 80
  },
  {
    title: 'Digital Signal Processing',
    university: 'IIT Kanpur',
    subject: 'Electronics',
    semester: 'Semester 5',
    instructor: 'Prof. Aditya K. Jagannatham',
    duration: '8 Weeks',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    rating: 4.6,
    enrolled: 5400,
    progress: 0
  },
  {
    title: 'Introduction to Quantum Physics',
    university: 'Central University',
    subject: 'Physics',
    semester: 'Semester 4',
    instructor: 'Dr. H. C. Verma',
    duration: '12 Weeks',
    image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80',
    rating: 4.9,
    enrolled: 12300,
    progress: 10
  },
  {
    title: 'Organic Chemistry II',
    university: 'IIT Bombay',
    subject: 'Chemistry',
    semester: 'Semester 3',
    instructor: 'Prof. R. P. Singh',
    duration: '8 Weeks',
    image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fa6?w=800&q=80',
    rating: 4.5,
    enrolled: 4200,
    progress: 100
  },
  {
    title: 'Thermodynamics',
    university: 'IIT Delhi',
    subject: 'Mechanical Engineering',
    semester: 'Semester 4',
    instructor: 'Dr. Ramesh Kumar',
    rating: 4.8,
    duration: '10 Weeks',
    enrolled: 7100,
    image: 'https://images.unsplash.com/photo-1542621334-a254cf47733d?q=80&w=800&auto=format&fit=crop',
    progress: 0
  },
  {
    title: 'Macroeconomics Principles',
    university: 'Delhi University',
    subject: 'Economics',
    semester: 'Semester 2',
    instructor: 'Prof. Amartya Sen',
    rating: 4.6,
    duration: '12 Weeks',
    enrolled: 15400,
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop',
    progress: 20
  }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campuscore')
.then(async () => {
    console.log('MongoDB connected for seeding E-Learning courses...');
    await ELearningCourse.deleteMany({});
    console.log('Cleared existing courses!');
    await ELearningCourse.insertMany(E_LEARNING_COURSES);
    console.log('Successfully seeded 6 E-Learning courses!');
    process.exit(0);
})
.catch(err => {
    console.error('Error seeding DB', err);
    process.exit(1);
});
