import { Routes, Route } from 'react-router-dom';
import { DashboardPage } from '../pages/Dashboard';
import { InventoryManagement } from '../pages/InventoryManagement';
import { LossInventoryManagement } from '../pages/LossInventoryManagement';
import { TransactionsPage } from '../pages/Transactions';
import { LoginPage } from '../pages/Login';
import { Layout } from './Layout';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<DashboardPage />} />
                <Route path="inventory" element={<InventoryManagement />} />
                <Route path="losses" element={<LossInventoryManagement />} />
                <Route path="transactions" element={<TransactionsPage />} />
            </Route>

            <Route path="*" element={<LoginPage />} />
        </Routes>
    );
}

