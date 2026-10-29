import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PredictionProvider } from './context/PredictionContext';
import router from './router';

export function App() {
  return (
    <AuthProvider>
      <PredictionProvider>
        <RouterProvider router={router} />
      </PredictionProvider>
    </AuthProvider>
  );
}

export default App;
