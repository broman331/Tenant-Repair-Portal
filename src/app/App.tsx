import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import RepairRequestForm from './components/RepairRequestForm';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import WorkerList from './components/WorkerList';

/**
 * Root application component.
 * Sets up client-side routing with a shared sidebar layout.
 */
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<RepairRequestForm />} />
                    <Route path="/tickets" element={<TicketList />} />
                    <Route path="/tickets/:id" element={<TicketDetail />} />
                    <Route path="/workers" element={<WorkerList />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
