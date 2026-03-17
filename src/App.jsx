// import React from 'react';
// import { BrowserRouter } from 'react-router-dom';
// import AppRoutes from './routes/AppRoutes';

// function App() {
//   return (
//     <BrowserRouter>
//       <AppRoutes />
//     </BrowserRouter>
//   );
// }

// export default App;


// src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { StarProvider } from './context/StarContext'; // ← NEW

function App() {
  return (
    // StarProvider wraps everything so teacher, student, and parent
    // pages all share the same star store automatically.
    <StarProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </StarProvider>
  );
}

export default App;