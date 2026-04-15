import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayCircle, CheckCircle, MessageSquare, Send, ArrowLeft, Video, Circle, FileText, Check } from 'lucide-react';

const MOCK_DATA = {
  title: "Course Overview",
  instructor: "University Professor",
  topics: [
    { id: 1, title: 'Module 1: Introduction & Basics', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', description: 'A comprehensive introduction to the foundational concepts of this topic. We cover terminologies and basic applications.', completed: true },
    { id: 2, title: 'Module 2: Advanced Concept Visualization', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', description: 'Deep dive into complex visual models and understanding the core mechanics step by step.', completed: false },
    { id: 3, title: 'Module 3: Practical Implementation', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', description: 'Hands-on practice wrapping up the theories discussed previously. Follow along with the provided dummy code.', completed: false },
    { id: 4, title: 'Module 4: Final Assessments & Wrap up', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', description: 'Final project instructions and overall course summary.', completed: false },
  ],
  comments: [
    { id: 1, user: 'Priya Sharma', avatar: 'P', text: 'The first module was extremely clear. Thanks!', time: '2 hours ago' },
    { id: 2, user: 'Rahul Verma', avatar: 'R', text: 'I am having a bit of trouble with the second assignment, any hints?', time: '5 hours ago' }
  ]
};

const CourseDetail: React.FC = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<any>(null);
  const [topics, setTopics] = useState(MOCK_DATA.topics);
  const [activeTopic, setActiveTopic] = useState(topics[0]);
  const [comments, setComments] = useState(MOCK_DATA.comments);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetch(`http://localhost:5000/api/elearning/${courseId}`)
      .then(res => res.json())
      .then(data => {
         if(data && !data.title?.includes('Not found')) {
            setCourse(data);
            if(data.topics && data.topics.length > 0) {
               const mappedTopics = data.topics.map((t: any, i: number) => ({
                 id: t._id || i + 1,
                 title: t.title,
                 videoUrl: t.videoUrl,
                 description: t.description,
                 completed: false
               }));
               setTopics(mappedTopics);
               setActiveTopic(mappedTopics[0]);
            } else if(data.videoUrl || data.description) {
               // Legacy fallback
               const loadedTopic = { 
                 id: 1, 
                 title: 'Module 1: Main Course Content', 
                 videoUrl: data.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4', 
                 description: data.description || MOCK_DATA.topics[0].description, 
                 completed: false 
               };
               setTopics([loadedTopic]);
               setActiveTopic(loadedTopic);
            }
         }
      })
      .catch(console.error);
  }, [courseId]);

  const markTopicCompleted = (id: number) => {
    setTopics(topics.map(t => t.id === id ? { ...t, completed: true } : t));
    if (activeTopic.id === id) {
       setActiveTopic(prev => ({ ...prev, completed: true }));
    }
  };

  const completedCount = topics.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / topics.length) * 100);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now(),
      user: 'You',
      avatar: 'Y',
      text: newComment,
      time: 'Just now'
    };
    setComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-secondary w-full">
      {/* Header */}
      <header className="bg-bg-primary border-b border-border-color px-6 py-4 flex-shrink-0 flex items-center gap-4 z-10 sticky top-0">
        <button onClick={() => navigate('/e-learning')} className="p-2 hover:bg-bg-secondary text-text-secondary rounded-full transition-colors border border-border-color bg-white shadow-sm">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-text-primary tracking-tight">Pathway Explorer</h1>
          <p className="text-xs text-text-muted mt-0.5">Explore topics and track progress</p>
        </div>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row w-full mx-auto">
        {/* Main Video & Details Section (Left) */}
        <div className="flex-1 flex flex-col overflow-y-auto border-r border-border-color bg-bg-primary">
          <div className="w-full aspect-video bg-black sticky top-0 z-10 shadow-sm border-b border-border-color">
            <video 
              key={activeTopic.id}
              className="w-full h-full" 
              src={activeTopic.videoUrl} 
              title={activeTopic.title}
              controls
              autoPlay
              onEnded={() => markTopicCompleted(activeTopic.id)}
            />
          </div>
          
          <div className="p-6 lg:p-10 max-w-4xl w-full">
            <div className="mb-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-xs font-bold uppercase tracking-wider mb-4 shadow-sm border border-accent-primary/20">
                    <Video size={14} /> Module {activeTopic.id}
                  </div>
                  <h2 className="text-3xl font-bold text-text-primary mb-3 leading-tight">{activeTopic.title}</h2>
                </div>
                {activeTopic.completed && (
                  <div className="flex items-center gap-2 px-4 py-2 mt-1 rounded-md text-sm font-bold shadow-sm bg-green-500 text-white">
                    <Check size={16} /> Completed
                  </div>
                )}
              </div>
              <p className="text-text-secondary leading-relaxed text-base mb-6">{activeTopic.description}</p>
              
              <div className="flex gap-4">
                 <a href={course?.pdfUrl || '#'} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold shadow-sm transition-colors ${course?.pdfUrl ? 'bg-text-primary text-white hover:bg-text-secondary' : 'bg-bg-secondary border border-border-color text-text-muted pointer-events-none'}`}>
                    <FileText size={16} /> {course?.pdfUrl ? 'Download Course PDF' : 'No Notes Attached'}
                 </a>
              </div>
            </div>

            <hr className="border-border-color my-8" />

            {/* Comments Section */}
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <MessageSquare size={20} className="text-text-muted" />
                Discussion ({comments.length})
              </h3>
              
              <form onSubmit={handleAddComment} className="flex gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-accent-primary flex-shrink-0 flex items-center justify-center text-white font-bold shadow-sm">
                  Y
                </div>
                <div className="flex-1 flex items-center gap-2 bg-bg-secondary border border-border-color rounded-lg px-2 shadow-sm focus-within:border-accent-primary focus-within:ring-1 focus-within:ring-accent-primary transition-all">
                   <input 
                     type="text" 
                     placeholder="Add to the discussion..." 
                     value={newComment}
                     onChange={e => setNewComment(e.target.value)}
                     className="w-full bg-transparent px-2 py-3 text-sm focus:outline-none text-text-primary"
                   />
                   <button type="submit" disabled={!newComment.trim()} className="p-2 text-accent-primary disabled:text-text-muted hover:bg-accent-primary/10 rounded-md transition-colors">
                     <Send size={18} />
                   </button>
                </div>
              </form>

              <div className="space-y-6">
                {comments.map(comment => (
                  <div key={comment.id} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-border-color flex-shrink-0 flex items-center justify-center text-text-secondary font-bold shadow-sm text-sm">
                      {comment.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-text-primary text-sm">{comment.user}</span>
                        <span className="text-xs text-text-muted">{comment.time}</span>
                      </div>
                      <p className="text-text-secondary text-sm leading-relaxed bg-bg-secondary p-3 rounded-lg rounded-tl-none border border-border-color shadow-sm inline-block">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Syllabus / Pathway (Right) */}
        <div className="w-full md:w-80 lg:w-[400px] flex-shrink-0 bg-bg-secondary/50 overflow-y-auto flex flex-col border-l border-border-color">
           <div className="p-6 border-b border-border-color bg-bg-primary sticky top-0 z-10 shadow-sm">
              <h3 className="font-bold text-text-primary text-lg">Completion Pathway</h3>
              <div className="mt-4">
                 <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                   <span className="text-text-muted">{completedCount} of {topics.length} completed</span>
                   <span className={progressPercent === 100 ? 'text-green-500' : 'text-accent-primary'}>{progressPercent}%</span>
                 </div>
                 <div className="w-full h-2 bg-bg-secondary rounded-full overflow-hidden border border-border-color relative">
                    <div className={`h-full transition-all duration-500 rounded-full ${progressPercent === 100 ? 'bg-green-500' : 'bg-accent-primary'}`} style={{ width: `${progressPercent}%` }}></div>
                 </div>
              </div>
           </div>
           <div className="p-4 space-y-3">
             {topics.map((topic, idx) => (
               <button 
                 key={topic.id}
                 onClick={() => setActiveTopic(topic)}
                 className={`w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 border-2 ${activeTopic.id === topic.id ? 'border-accent-primary bg-white shadow-md' : 'border-transparent hover:bg-bg-secondary hover:border-border-color'}`}
               >
                 <div className="mt-0.5 flex-shrink-0">
                    {topic.completed ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : ( activeTopic.id === topic.id ? (
                      <PlayCircle size={20} className="text-accent-primary" />
                    ) : (
                      <Circle size={20} className="text-text-muted" />
                    ))}
                 </div>
                 <div>
                   <h4 className={`text-sm font-bold leading-tight mb-1 ${activeTopic.id === topic.id ? 'text-accent-primary' : 'text-text-primary'}`}>
                      {topic.title}
                   </h4>
                   <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                      {topic.description}
                   </p>
                 </div>
               </button>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
