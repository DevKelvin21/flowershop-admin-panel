import { Route, Routes } from 'react-router-dom';
import { DashboardContainer, InventoryContainer, LoginContainer, LossInventoryContainer, FinancialContainer } from '../pages';
import { Layout } from './Layout';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginContainer />} />

            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<DashboardContainer />} />
                <Route path="inventory" element={<InventoryContainer />} />
                <Route path="losses" element={<LossInventoryContainer />} />
                <Route path="financial" element={<FinancialContainer />} />
            </Route>

            <Route path="*" element={<LoginContainer />} />
        </Routes>
    );
}

