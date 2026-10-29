import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Authentication Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Protected Application Pages

import Dashboard from './pages/Dashboard';
import DatasetPage from './pages/DatasetPage';
import DataQualityPage from './pages/DataQualityPage';
import VisualizationPage from './pages/VisualizationPage';
import TrainingPage from './pages/TrainingPage';
import EvaluationPage from './pages/EvaluationPage';
import ModelComparisonPage from './pages/ModelComparisonPage';
import PredictionPage from './pages/PredictionPage';
import ShapPage from './pages/ShapPage';
import CounterfactualPage from './pages/CounterfactualPage';
import UncertaintyPage from './pages/UncertaintyPage';
import FairnessPage from './pages/FairnessPage';
import AnalysisHistoryPage from './pages/AnalysisHistoryPage';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import ArchitecturePage from './pages/ArchitecturePage';
import AboutPage from './pages/AboutPage';

export const router = createBrowserRouter([
  // Public Authentication Routes
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/register',
    element: <RegisterPage />
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />
  },


  // Protected Application Routes
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'dataset',
        element: <DatasetPage />
      },
      {
        path: 'data-quality',
        element: <DataQualityPage />
      },
      {
        path: 'visualization',
        element: <VisualizationPage />
      },
      {
        path: 'training',
        element: <TrainingPage />
      },
      {
        path: 'evaluation',
        element: <EvaluationPage />
      },
      {
        path: 'model-comparison',
        element: <ModelComparisonPage />
      },
      {
        path: 'prediction',
        element: <PredictionPage />
      },
      {
        path: 'shap',
        element: <ShapPage />
      },
      {
        path: 'counterfactual',
        element: <CounterfactualPage />
      },
      {
        path: 'uncertainty',
        element: <UncertaintyPage />
      },
      {
        path: 'fairness',
        element: <FairnessPage />
      },
      {
        path: 'history',
        element: <AnalysisHistoryPage />
      },
      {
        path: 'profile',
        element: <ProfilePage />
      },
      {
        path: 'change-password',
        element: <ChangePasswordPage />
      },
      {
        path: 'architecture',
        element: <ArchitecturePage />
      },
      {
        path: 'about',
        element: <AboutPage />
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />
      }
    ]
  }
]);

export default router;
