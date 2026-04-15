import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, PlayCircle, BookOpen, Clock, Star, MonitorPlay, X, Plus } from 'lucide-react';

const E_LEARNING_COURSES = [
  {
    id: 1,
    title: 'Advanced Data Structures and Algorithms',
    university: 'IIT Madras',
    subject: 'Computer Science',
    semester: 'Semester 5',
    instructor: 'Prof. Naveen Garg',
    rating: 4.8,
    duration: '12 Weeks',
    enrolled: 15420,
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
    progress: 45
  },
  {
    id: 2,
    title: 'Machine Learning for Engineers',
    university: 'Stanford Online',
    subject: 'Artificial Intelligence',
    semester: 'Semester 6',
    instructor: 'Dr. Andrew Ng',
    rating: 4.9,
    duration: '10 Weeks',
    enrolled: 22100,
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80',
    progress: 0
  },
  {
    id: 3,
    title: 'Differential Equations in Engineering',
    university: 'MIT OpenCourseWare',
    subject: 'Mathematics',
    semester: 'Semester 3',
    instructor: 'Prof. Arthur Mattuck',
    rating: 4.7,
    duration: '14 Weeks',
    enrolled: 8500,
    image: 'https://images.unsplash.com/photo-1635070041071-e6f0b0bd3a0c?w=800&q=80',
    progress: 80
  },
  {
    id: 4,
    title: 'Digital Signal Processing',
    university: 'IIT Kanpur',
    subject: 'Electronics',
    semester: 'Semester 5',
    instructor: 'Prof. Aditya K. Jagannatham',
    rating: 4.6,
    duration: '8 Weeks',
    enrolled: 5400,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    progress: 0
  },
  {
    id: 5,
    title: 'Introduction to Quantum Physics',
    university: 'Central University',
    subject: 'Physics',
    semester: 'Semester 4',
    instructor: 'Dr. H. C. Verma',
    rating: 4.9,
    duration: '12 Weeks',
    enrolled: 12300,
    image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80',
    progress: 10
  },
  {
    id: 6,
    title: 'Organic Chemistry II',
    university: 'IIT Bombay',
    subject: 'Chemistry',
    semester: 'Semester 3',
    instructor: 'Prof. R. P. Singh',
    rating: 4.5,
    duration: '8 Weeks',
    enrolled: 4200,
    image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fa6?w=800&q=80',
    progress: 100
  },
  {
    id: 7,
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
    id: 8,
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

const ELearning: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const canUpload = user && ['UNIVERSITY', 'COLLEGE', 'PROFESSOR'].includes(user.role);

  const [activeTab, setActiveTab] = useState('explore');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState<any[]>(E_LEARNING_COURSES);

  // Filter States
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedBranch, setSelectedBranch] = useState('All');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', university: user?.role === 'UNIVERSITY' ? user.name : 'Central University', subject: 'Computer Science', semester: '', instructor: user?.name || 'Faculty Member', duration: '', image: '', description: '', pdfUrl: '',
    topics: [{ title: '', description: '', videoUrl: '', videoFile: null as File | null }]
  });

  const addTopic = () => {
    setFormData({ ...formData, topics: [...formData.topics, { title: '', description: '', videoUrl: '', videoFile: null }] });
  };
  const updateTopic = (index: number, field: string, value: any) => {
    const updatedTopics = [...formData.topics];
    updatedTopics[index] = { ...updatedTopics[index], [field]: value };
    if (field === 'videoFile') updatedTopics[index].videoUrl = '';
    if (field === 'videoUrl') updatedTopics[index].videoFile = null;
    setFormData({ ...formData, topics: updatedTopics });
  };
  const removeTopic = (index: number) => {
    if (formData.topics.length === 1) return;
    setFormData({ ...formData, topics: formData.topics.filter((_, i) => i !== index) });
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    const processedTopics = formData.topics.map(topic => {
      let finalUrl = topic.videoUrl;
      if (topic.videoFile) finalUrl = URL.createObjectURL(topic.videoFile);
      return { title: topic.title, description: topic.description, videoUrl: finalUrl };
    });

    try {
      const response = await fetch('http://localhost:5000/api/elearning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, topics: processedTopics, rating: 0, enrolled: 0, progress: 0 })
      });
      if (response.ok) {
        const newCourse = await response.json();
        setCourses([newCourse, ...courses]);
        setIsModalOpen(false);
        setFormData({ title: '', university: user?.role === 'UNIVERSITY' ? user.name : 'Central University', subject: 'Computer Science', semester: '', instructor: user?.name || 'Faculty Member', duration: '', image: '', description: '', pdfUrl: '', topics: [{ title: '', description: '', videoUrl: '', videoFile: null }] });
      }
    } catch (err) {
      console.error('Error uploading course:', err);
    }
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/elearning');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setCourses(data);
          }
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-bg-primary">
      {/* Header */}
      <header className="bg-bg-primary border-b border-border-color px-6 py-4 flex-shrink-0 flex justify-between items-center z-10 sticky top-0">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2 tracking-tight">
            <MonitorPlay className="text-accent-primary" size={24} />
            E-Learning Platform
          </h1>
          <p className="text-sm text-text-muted mt-1">Integrated University Courses</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              type="text"
              placeholder="Search courses, subjects..."
              className="pl-9 pr-4 py-2 border border-border-color rounded-md text-sm focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary w-64 bg-bg-secondary text-text-primary transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
             <select 
               value={selectedSemester} 
               onChange={(e) => setSelectedSemester(e.target.value)}
               className="px-3 py-2 border border-border-color rounded-md text-sm focus:outline-none focus:border-accent-primary bg-bg-secondary text-text-primary shadow-sm"
             >
               {['All', ...Array.from(new Set(courses.map(c => c.semester)))].map(sem => <option key={sem} value={sem}>{sem}</option>)}
             </select>

             <select 
               value={selectedBranch} 
               onChange={(e) => setSelectedBranch(e.target.value)}
               className="max-w-[150px] px-3 py-2 border border-border-color rounded-md text-sm focus:outline-none focus:border-accent-primary bg-bg-secondary text-text-primary shadow-sm"
             >
               {['All', ...Array.from(new Set(courses.map(c => c.subject)))].map(branch => <option key={branch} value={branch}>{branch}</option>)}
             </select>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-accent-primary text-white rounded-md text-sm font-medium hover:bg-accent-secondary transition-colors duration-200 shadow-sm"
          >
            Upload Course
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto w-full p-6 bg-bg-secondary/30">
        <div className="max-w-7xl mx-auto w-full">
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-border-color mb-8">
            <button
              onClick={() => setActiveTab('explore')}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'explore' ? 'text-accent-primary' : 'text-text-muted hover:text-text-primary'}`}
            >
              Explore Courses
              {activeTab === 'explore' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-primary rounded-t-full"></span>}
            </button>
            <button
              onClick={() => setActiveTab('my-learning')}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'my-learning' ? 'text-accent-primary' : 'text-text-muted hover:text-text-primary'}`}
            >
              My Learning
              {activeTab === 'my-learning' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-primary rounded-t-full"></span>}
            </button>
             <button
              onClick={() => setActiveTab('university')}
              className={`pb-3 text-sm font-medium transition-colors relative ${activeTab === 'university' ? 'text-accent-primary' : 'text-text-muted hover:text-text-primary'}`}
            >
              University Uploads
              {activeTab === 'university' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-accent-primary rounded-t-full"></span>}
            </button>
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.filter(course => {
                const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesSem = selectedSemester === 'All' || course.semester === selectedSemester;
                const matchesBranch = selectedBranch === 'All' || course.subject === selectedBranch;
                return matchesSearch && matchesSem && matchesBranch;
            }).map((course) => (
              <div key={course._id || course.id} className="bg-bg-primary rounded-lg border border-border-color overflow-hidden hover:shadow-md transition-shadow duration-300 group flex flex-col">
                {/* Course Image */}
                <div className="relative h-40 w-full overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300"></div>
                  <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                    <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-text-primary shadow-sm tracking-wider w-fit">
                      {course.semester}
                    </span>
                    <span className="bg-accent-primary/95 text-white backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold shadow-sm tracking-wider w-fit">
                      {course.subject}
                    </span>
                  </div>
                  {activeTab === 'my-learning' && course.progress > 0 && course.progress < 100 && (
                     <div className="absolute top-2 right-2 bg-accent-primary text-white backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold shadow-sm flex items-center gap-1">
                      <PlayCircle size={12}/> In Progress
                     </div>
                  )}
                  {activeTab === 'my-learning' && course.progress === 100 && (
                     <div className="absolute top-2 right-2 bg-green-500 text-white backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold shadow-sm flex items-center gap-1">
                      <Star size={12}/> Completed
                     </div>
                  )}
                </div>

                {/* Course Details */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="text-xs font-medium text-accent-primary mb-1 uppercase tracking-wider">{course.subject}</div>
                  <h3 className="text-sm font-bold text-text-primary leading-tight mb-2 line-clamp-2" title={course.title}>
                    {course.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-xs text-text-muted mb-3">
                    <BookOpen size={14} className="flex-shrink-0" />
                    <span className="truncate">{course.university}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
                    <span className="font-medium text-text-secondary">{course.instructor}</span>
                  </div>
                  
                  <div className="mt-auto">
                    {activeTab === 'my-learning' ? (
                       <div className="space-y-2">
                         <div className="flex justify-between text-xs font-medium mb-1">
                           <span className={course.progress === 100 ? "text-green-600" : "text-text-secondary"}>
                              {course.progress === 100 ? "Completed" : `${course.progress}% Completed`}
                           </span>
                         </div>
                         <div className="w-full bg-border-color rounded-full h-1.5">
                           <div 
                             className={`h-1.5 rounded-full ${course.progress === 100 ? "bg-green-500" : "bg-accent-primary"}`} 
                             style={{ width: `${course.progress}%` }}
                           ></div>
                         </div>
                         <button className={`w-full py-2 rounded-md text-sm font-medium transition-colors mt-3 ${course.progress === 100 ? 'bg-bg-secondary text-text-secondary hover:bg-gray-200' : 'bg-accent-primary/10 text-accent-primary hover:bg-accent-primary hover:text-white'}`}>
                           {course.progress === 100 ? 'Download Certificate' : 'Continue Learning'}
                         </button>
                       </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-xs text-text-muted border-t border-border-color pt-3">
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {course.duration}
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500 font-medium">
                            <Star size={14} className="fill-current" />
                            {course.rating}
                          </div>
                        </div>
                      </>
                    )}
                    <button 
                      onClick={() => navigate(`/e-learning/${course._id || course.id}`)}
                      className={`w-full py-2 rounded-md text-sm font-bold transition-colors mt-4 shadow-sm ${
                        activeTab === 'my-learning' && course.progress === 100
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-accent-primary text-white hover:bg-accent-secondary'
                      }`}
                    >
                      {activeTab === 'my-learning' 
                        ? (course.progress === 100 ? 'Download Certificate' : 'Continue Learning') 
                        : 'Explore'
                      }
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-bg-primary rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-color sticky top-0 bg-bg-primary z-10">
              <h2 className="text-lg font-bold text-text-primary">Upload New Course</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {/* Logged in Teacher Details */}
              <div className="bg-accent-primary/5 border border-accent-primary/20 rounded-lg p-4 mb-2 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-primary flex-shrink-0 flex items-center justify-center text-white font-bold text-xl shadow-sm mt-1">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-accent-primary tracking-wider uppercase mb-1">Authenticated Instructor Profile</p>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <div>
                      <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Name</p>
                      <p className="text-sm font-bold text-text-primary">{user?.name || 'Local User'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Assigned Role Structure</p>
                      <p className="text-sm font-bold text-text-primary">{user?.role || 'Unauthenticated'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Course Title</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 border border-border-color rounded-md text-sm focus:outline-none focus:border-accent-primary bg-bg-secondary text-text-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">University</label>
                  <input required type="text" value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} className="w-full px-3 py-2 border border-border-color rounded-md text-sm focus:outline-none focus:border-accent-primary bg-bg-secondary text-text-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Subject</label>
                  <input required type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full px-3 py-2 border border-border-color rounded-md text-sm focus:outline-none focus:border-accent-primary bg-bg-secondary text-text-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Instructor</label>
                  <input required type="text" value={formData.instructor} onChange={e => setFormData({...formData, instructor: e.target.value})} className="w-full px-3 py-2 border border-border-color rounded-md text-sm focus:outline-none focus:border-accent-primary bg-bg-secondary text-text-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Semester</label>
                  <input required type="text" value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})} className="w-full px-3 py-2 border border-border-color rounded-md text-sm focus:outline-none focus:border-accent-primary bg-bg-secondary text-text-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Duration (e.g., 12 Weeks)</label>
                  <input required type="text" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full px-3 py-2 border border-border-color rounded-md text-sm focus:outline-none focus:border-accent-primary bg-bg-secondary text-text-primary" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Course Description</label>
                  <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-border-color rounded-md text-sm focus:outline-none focus:border-accent-primary bg-bg-secondary text-text-primary resize-none" placeholder="Enter course description..."></textarea>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">Cover Image URL</label>
                  <input required type="text" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full px-3 py-2 border border-border-color rounded-md text-sm focus:outline-none focus:border-accent-primary bg-bg-secondary text-text-primary" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text-secondary mb-1">PDF Notes URL</label>
                  <input type="text" value={formData.pdfUrl} onChange={e => setFormData({...formData, pdfUrl: e.target.value})} className="w-full px-3 py-2 border border-border-color rounded-md text-sm focus:outline-none focus:border-accent-primary bg-bg-secondary text-text-primary" placeholder="Optional" />
                </div>
                
                <div className="col-span-2 mt-4 pt-4 border-t border-border-color">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-text-primary">Course Modules ({formData.topics.length})</h3>
                    <button type="button" onClick={addTopic} className="text-xs font-bold text-accent-primary bg-accent-primary/10 hover:bg-accent-primary/20 px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors">
                      <Plus size={14} /> Add Module
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.topics.map((topic, index) => (
                      <div key={index} className="p-4 border border-border-color rounded-md bg-bg-secondary/30 relative group">
                        {formData.topics.length > 1 && (
                          <button type="button" onClick={() => removeTopic(index)} className="absolute top-3 right-3 text-red-500 opacity-50 hover:opacity-100 p-1">
                            <X size={16} />
                          </button>
                        )}
                        <h4 className="text-xs font-bold text-text-muted mb-3 uppercase tracking-wider">Module {index + 1}</h4>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Module Title</label>
                            <input required type="text" value={topic.title} onChange={e => updateTopic(index, 'title', e.target.value)} className="w-full px-3 py-2 border border-border-color rounded-md text-sm focus:outline-none focus:border-accent-primary bg-bg-primary text-text-primary" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Module Description (Optional)</label>
                            <textarea rows={2} value={topic.description} onChange={e => updateTopic(index, 'description', e.target.value)} className="w-full px-3 py-2 border border-border-color rounded-md text-sm focus:outline-none focus:border-accent-primary bg-bg-primary text-text-primary resize-none"></textarea>
                          </div>
                          
                          <div className="pt-2">
                            <label className="block text-[10px] uppercase tracking-wider font-bold text-text-secondary mb-2">Video Source</label>
                            <div className="grid grid-cols-2 gap-3 items-end">
                              <div>
                                <label className="block text-[10px] text-text-muted mb-1">Upload File (.mp4)</label>
                                <input type="file" accept="video/mp4,video/*" onChange={e => {
                                   if(e.target.files?.[0]) updateTopic(index, 'videoFile', e.target.files[0]);
                                }} className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-accent-primary/10 file:text-accent-primary cursor-pointer hover:file:bg-accent-primary/20" />
                              </div>
                              <div>
                                <label className="block text-[10px] text-text-muted mb-1">OR External URL</label>
                                <input type="text" disabled={!!topic.videoFile} value={topic.videoUrl} onChange={e => updateTopic(index, 'videoUrl', e.target.value)} className="w-full px-2 py-1.5 border border-border-color rounded-md text-xs bg-bg-primary text-text-primary disabled:opacity-50" placeholder="https://..." />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-border-color mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-text-secondary hover:bg-bg-secondary rounded-md transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-accent-primary text-white text-sm font-medium rounded-md hover:bg-accent-secondary transition-colors">Publish Course</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ELearning;
