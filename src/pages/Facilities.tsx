import { Card } from '../components/UI/Card';
import { CalendarCheck, MapPin, Users, Clock, Check, Calendar as CalIcon } from 'lucide-react';

const facilities = [
    { id: 1, name: 'Main Auditorium', type: 'Event Hall', capacity: 1200, location: 'Central Block', image: 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20', available: true },
    { id: 2, name: 'Seminar Hall A', type: 'Lecture Hall', capacity: 150, location: 'Science Block', image: 'bg-gradient-to-br from-teal-500/20 to-emerald-500/20', available: false },
    { id: 3, name: 'Indoor Sports Complex', type: 'Sports', capacity: 500, location: 'South Campus', image: 'bg-gradient-to-br from-rose-500/20 to-orange-500/20', available: true },
    { id: 4, name: 'Conference Room 1', type: 'Meeting', capacity: 25, location: 'Admin Block', image: 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20', available: true },
];

const Facilities = () => {
    return (
        <div className="flex flex-col gap-12 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl tracking-tight mb-2 text-gradient">Campus Facilities Booking</h1>
                    <p className="text-lg text-text-secondary">Reserve auditoriums, seminar halls, and sports complexes across the university.</p>
                </div>
                <button className="secondary-btn flex-center gap-2 shrink-0">
                    <CalIcon size={18} /> My Bookings
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="flex-1 flex gap-4">
                    <select className="bg-bg-tertiary text-text-primary border border-border-color px-4 py-3 rounded-xl outline-none focus:border-accent-primary w-full md:w-auto">
                        <option className="bg-bg-secondary">All Facility Types</option>
                        <option className="bg-bg-secondary">Event Halls</option>
                        <option className="bg-bg-secondary">Sports</option>
                        <option className="bg-bg-secondary">Meeting Rooms</option>
                    </select>
                    <input type="date" className="bg-bg-tertiary text-text-primary border border-border-color px-4 py-3 rounded-xl outline-none focus:border-accent-primary w-full md:w-auto" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8 pl-1 pr-1">
                {facilities.map(hall => (
                    <Card key={hall.id} className="hover-lift !p-0 flex flex-col h-full overflow-hidden border border-border-color pointer-events-auto">
                        <div className={`h-32 ${hall.image} relative flex items-start justify-end p-4`}>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md backdrop-blur-md ${
                            hall.available ? 'bg-status-success/20 text-status-success border border-status-success/30' : 'bg-status-danger/20 text-status-danger border border-status-danger/30'
                        }`}>
                        {hall.available ? 'Available' : 'Booked Today'}
                    </span>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-xl font-bold text-text-primary mb-1">{hall.name}</h3>
                <p className="text-accent-primary text-sm font-medium mb-5">{hall.type}</p>

                <div className="flex flex-col gap-3 mb-6">
                    <div className="flex items-center gap-3 text-text-secondary text-sm">
                        <MapPin size={16} className="text-text-muted shrink-0" /> <span>{hall.location}</span>
                    </div>
                    <div className="flex items-center gap-3 text-text-secondary text-sm">
                        <Users size={16} className="text-text-muted shrink-0" /> <span>Capacity: {hall.capacity}</span>
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-border-color">
                    <button
                        className={`w-full py-2.5 rounded-lg font-semibold flex-center gap-2 transition-all ${
                        hall.available
                            ? 'bg-accent-primary/10 text-accent-primary hover:bg-accent-primary hover:text-white border border-accent-primary/30'
                            : 'bg-bg-tertiary text-text-muted cursor-not-allowed border border-border-color'
                    }`}
                    disabled={!hall.available}
                >
                    <CalendarCheck size={18} /> {hall.available ? 'Book Facility' : 'Unavailable'}
                </button>
            </div>
        </div>
          </Card >
        ))}
      </div >
    </div >
  );
};

export default Facilities;
