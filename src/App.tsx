import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { TableManage } from './pages/TableManage';
import { RateConfig } from './pages/RateConfig';
import { QueueCall } from './pages/QueueCall';
import { BillDetail } from './pages/BillDetail';
import { MemberManage } from './pages/MemberManage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tables" element={<TableManage />} />
        <Route path="/rates" element={<RateConfig />} />
        <Route path="/queue" element={<QueueCall />} />
        <Route path="/bills" element={<BillDetail />} />
        <Route path="/members" element={<MemberManage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
