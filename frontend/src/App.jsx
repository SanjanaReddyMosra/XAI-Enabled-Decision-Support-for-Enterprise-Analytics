import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { PredictionProvider } from './context/PredictionContext';
import router from './router';

export function App() {
  return (
    <PredictionProvider>
      <RouterProvider router={router} />
    </PredictionProvider>
  );
}

export default App;
