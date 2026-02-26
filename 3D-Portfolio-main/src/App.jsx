import React from 'react';
import { Route, BrowserRouter, Routes } from 'react-router-dom'; 
import Home from './Home';
import References from './References';

const App = () => {
  return (
    <main >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/references" element={<References />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
}

export default App;
