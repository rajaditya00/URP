import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="flex bg-bg-primary h-screen w-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative">
                    <div className="max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
