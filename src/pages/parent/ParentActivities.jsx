// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { ArrowLeft } from 'lucide-react';

// // ✅ Same ActivitiesTab jo teacher mein use ho rahi hai
// import ActivitiesTab from '../../components/teacher/activities/ActivitiesTab';

// const ParentActivities = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">

//       {/* Top Bar */}
//       <div className="bg-white/80 backdrop-blur-lg border-b-4 border-pink-200 px-8 py-4">
//         <div className="flex items-center gap-4">
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={() => navigate('/parent-selection')}
//             className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200
//               text-purple-700 font-bold rounded-2xl transition-colors">
//             <ArrowLeft size={20} />
//             Back
//           </motion.button>

//           <h1 className="text-3xl font-bold text-gray-800">
//             🎮 Learning Activities
//           </h1>

//           <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-bold ml-2">
//             Home Mode 🏠
//           </span>
//         </div>
//       </div>

//       {/* Activities — same component as teacher */}
//       <div className="px-8 py-6">
//         <ActivitiesTab isParentMode={true} />
//       </div>

//     </div>
//   );
// };

// export default ParentActivities;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
// ✅ Same ActivitiesTab jo teacher mein use ho rahi hai
import ActivitiesTab from '../../components/teacher/activities/ActivitiesTab';

const ParentActivities = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Top Bar */}
      <div className="bg-white/80 backdrop-blur-lg border-b-4 border-pink-200 px-4 sm:px-4 md:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3 sm:gap-3 md:gap-4 lg:gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/parent-selection')}
            className="flex items-center gap-2 px-3 sm:px-3 md:px-4 lg:px-4 py-2 bg-purple-100 hover:bg-purple-200
              text-purple-700 font-bold rounded-2xl transition-colors">
            <ArrowLeft size={18} />
            <span className="hidden sm:hidden md:inline lg:inline">Back</span>
          </motion.button>
          <h1 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
            🎮 Learning Activities
          </h1>
          <span className="px-2 sm:px-2 md:px-3 lg:px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs sm:text-xs md:text-sm lg:text-sm font-bold ml-1 sm:ml-1 md:ml-2 lg:ml-2">
            Home Mode 🏠
          </span>
        </div>
      </div>
      {/* Activities — same component as teacher */}
      <div className="px-4 sm:px-4 md:px-6 lg:px-8 py-6">
        <ActivitiesTab isParentMode={true} />
      </div>
    </div>
  );
};

export default ParentActivities;
