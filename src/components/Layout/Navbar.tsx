import { Search, Bell, Settings, HelpCircle } from 'lucide-react';

const Navbar = () => {
    return (
        <header className="h-[60px] flex items-center justify-between px-6 border-b border-border-color bg-bg-primary sticky top-0 z-40 flex-shrink-0">
            {/* Search */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
                <div className="flex items-center bg-bg-secondary border border-border-color rounded-md px-3 py-2 w-full transition-all focus-within:border-accent-primary focus-within:ring-2 focus-within:ring-accent-primary/20">
                    <Search size={15} className="text-text-muted mr-2 flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search departments, notices, people..."
                        className="bg-transparent border-none text-text-primary text-sm w-full outline-none placeholder:text-text-muted"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button className="w-9 h-9 flex items-center justify-center rounded-md text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors">
                    <HelpCircle size={18} />
                </button>
                <button className="relative w-9 h-9 flex items-center justify-center rounded-md text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors">
                    <Bell size={18} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-status-danger rounded-full border-2 border-bg-primary"></span>
                </button>
                <button className="w-9 h-9 flex items-center justify-center rounded-md text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors">
                    <Settings size={18} />
                </button>

                <div className="w-px h-6 bg-border-color mx-2"></div>

                <button className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-md hover:bg-bg-secondary transition-colors">
                    <img
                        src="https://ui-avatars.com/api/?name=Admin+User&background=1d72b8&color=fff&size=64"
                        alt="Profile"
                        className="w-7 h-7 rounded-full object-cover"
                    />
                    <div className="text-left hidden md:block">
                        <p className="text-xs font-semibold text-text-primary leading-tight">Admin User</p>
                        <p className="text-[10px] text-text-muted leading-tight">Super Admin</p>
                    </div>
                </button>
            </div>
        </header>
    );
};

export default Navbar;
