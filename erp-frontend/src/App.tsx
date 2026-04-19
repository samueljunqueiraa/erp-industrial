import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import { AuthProvider } from './contexts/AuthContext';
import { DefaultLayout } from './layouts/DefaultLayout/DefaultLayout';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<DefaultLayout />}>
            {/* Todas as rotas do sistema ficam dentro do layout padrão */}
            <Route path="*" element={<AppRoutes />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
