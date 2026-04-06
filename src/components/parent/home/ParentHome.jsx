
// import React, { useEffect, useRef, useState } from 'react';
// import axios from 'axios';
// import { Card } from '../../../components/shared';
// import { TrendingUp, Award, BookOpen, Star, Calendar } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { API_BASE_URL } from '../../../config';

// const ParentHome = ({ selectedChild }) => {

//   // ── State ───────────────────────────────────────────────────
//   const [starsData, setStarsData] = useState({
//     total_stars: 0,
//     today_stars: 0,
//     today_count: 0,
//     results: [],
//   });
//   const [presentToday, setPresentToday] = useState(false);
//   const [showLiveBanner, setShowLiveBanner] = useState(false);
//   const [latestResult, setLatestResult] = useState(null);
//   const prevCountRef = useRef(0);

//   // ── Values from state ───────────────────────────────────────
//   const totalStars = starsData.total_stars;
//   const todayStars = starsData.today_stars;
//   const todayCount = starsData.today_count;
//   const allResults = starsData.results;
//   const today = new Date().toISOString().split('T')[0];
//   const todayResults = allResults.filter(r => r.date === today);
//   const todayAvg = todayResults.length > 0
//     ? (todayResults.reduce((s, r) => s + r.stars, 0) / todayResults.length).toFixed(1)
//     : '—';

//   // ── Fetch jab bhi selectedChild badle ──────────────────────
//   useEffect(() => {
//     if (!selectedChild?.id) return;
//     fetchStarsData(selectedChild.id);
//     fetchAttendance(selectedChild.id, selectedChild.name); // ✅ dono pass
//   }, [selectedChild?.id]);

//   // ── Har 15 sec refresh ─────────────────────────────────────
//   useEffect(() => {
//     if (!selectedChild?.id) return;
//     const interval = setInterval(() => {
//       fetchStarsData(selectedChild.id);
//       fetchAttendance(selectedChild.id, selectedChild.name);
//     }, 15000);
//     return () => clearInterval(interval);
//   }, [selectedChild?.id]);

//   const fetchStarsData = async (studentId) => {
//     try {
//       const res = await axios.get(
//         `${API_BASE_URL}/api/parent/child-stars?student_id=${studentId}`
//       );
//       if (res.data?.status === 'success') {
//         setStarsData(res.data);
//         if (res.data.results.length > prevCountRef.current && prevCountRef.current > 0) {
//           setLatestResult(res.data.results[0]);
//           setShowLiveBanner(true);
//           setTimeout(() => setShowLiveBanner(false), 4000);
//         }
//         prevCountRef.current = res.data.results.length;
//       }
//     } catch (err) {
//       console.error('Stars fetch error:', err);
//     }
//   };

//   const fetchAttendance = async (studentId, studentName) => {
//     console.log('fetchAttendance called:', studentId, studentName); // ← DEBUG
//     try {
//       // Student ki real _id se attendance check karo
//       const res = await axios.get(
//         `${API_BASE_URL}/api/parent/check-attendance?student_id=${studentId}&name=${encodeURIComponent(studentName)}`
//       );
//       if (res.data?.status === 'success') {
//         setPresentToday(res.data.present);
//         console.log('Attendance:', res.data.present);
//       }
//     } catch (err) {
//       console.error('Attendance fetch error:', err);
//     }
//   };



//   // ── Agar koi child select nahi ──────────────────────────────
//   if (!selectedChild) return (
//     <div className="flex items-center justify-center py-20">
//       <div className="text-center">
//         <div className="text-5xl mb-3">👶</div>
//         <p className="text-text/60 font-semibold">No child selected</p>
//         <p className="text-sm text-text/40 mt-1">
//           Please select a child from the top menu
//         </p>
//       </div>
//     </div>
//   );

//   const achievements = [
//     { icon: '🌟', title: 'Perfect Week', description: '5 day streak!' },
//     { icon: '💯', title: '100% Score', description: 'Alphabet mastery' },
//     { icon: '🎨', title: 'Color Expert', description: 'All colors learned' },
//   ];

//   return (
//     <div className="space-y-6">

//       {/* Header */}
//       <div>
//         <h1 className="text-4xl font-bold text-text mb-2">Hi, Welcome! 👋</h1>
//         <p className="text-text/60">Track {selectedChild?.name}'s learning journey</p>
//       </div>

//       {/* ⚡ LIVE new result banner */}
//       <AnimatePresence>
//         {showLiveBanner && latestResult && (
//           <motion.div
//             initial={{ opacity: 0, y: -20, scale: 0.95 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: -20, scale: 0.95 }}
//             className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 flex items-center gap-4 text-white shadow-lg"
//           >
//             <div className="text-4xl">🎉</div>
//             <div>
//               <p className="font-bold text-lg">New result just in!</p>
//               <p className="text-white/90">
//                 {latestResult.activityName} —{' '}
//                 {latestResult.stars} star{latestResult.stars !== 1 ? 's' : ''} earned!&nbsp;
//                 {[...Array(5)].map((_, i) => (
//                   <span key={i}>{i < latestResult.stars ? '⭐' : '☆'}</span>
//                 ))}
//               </p>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Child Info Card */}
//       <Card className="bg-gradient-to-r from-primary-400 to-secondary-400 text-white border-0">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-3xl font-bold mb-2">{selectedChild?.name}</h2>
//             <p className="text-white/90 mb-1">
//               {selectedChild?.class} · Roll No: {selectedChild?.roll_number || selectedChild?.rollNo || '—'}
//             </p>
//             <div className="flex items-center gap-2 mt-3">
//               <div className={`px-3 py-1 backdrop-blur rounded-full text-sm font-semibold ${presentToday ? 'bg-white/20' : 'bg-red-400/40'
//                 }`}>
//                 {presentToday ? '✅ Present Today' : '❌ Not Marked Yet'}
//               </div>
//             </div>
//           </div>
//           <div className="text-8xl opacity-20">🎒</div>
//         </div>
//       </Card>

//       {/* Today's Summary */}
//       <div>
//         <h2 className="text-2xl font-bold text-text mb-4">Today's Summary</h2>
//         <div className="grid grid-cols-4 gap-4">

//           <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
//             <div className="flex items-center gap-2 mb-2">
//               <BookOpen size={20} className="text-green-700" />
//               <p className="text-sm text-green-700 font-semibold">Activities</p>
//             </div>
//             <p className="text-4xl font-bold text-green-900">{todayCount}</p>
//             <p className="text-xs text-green-700 mt-1">Completed today</p>
//           </Card>

//           <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
//             <div className="flex items-center gap-2 mb-2">
//               <Star size={20} className="text-yellow-700" />
//               <p className="text-sm text-yellow-700 font-semibold">Today Stars</p>
//             </div>
//             <motion.div key={todayStars} initial={{ scale: 1.4 }} animate={{ scale: 1 }}
//               transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
//               <p className="text-4xl font-bold text-yellow-900">{todayStars} ⭐</p>
//             </motion.div>
//             <p className="text-xs text-yellow-700 mt-1">Avg {todayAvg}/5</p>
//           </Card>

//           <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
//             <div className="flex items-center gap-2 mb-2">
//               <TrendingUp size={20} className="text-purple-700" />
//               <p className="text-sm text-purple-700 font-semibold">Streak</p>
//             </div>
//             <p className="text-4xl font-bold text-purple-900">—</p>
//             <p className="text-xs text-purple-700 mt-1">Days 🔥</p>
//           </Card>

//           <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
//             <div className="flex items-center gap-2 mb-2">
//               <Award size={20} className="text-orange-700" />
//               <p className="text-sm text-orange-700 font-semibold">Total Stars</p>
//             </div>
//             <motion.div key={totalStars} initial={{ scale: 1.5 }} animate={{ scale: 1 }}
//               transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
//               <p className="text-4xl font-bold text-orange-900">{totalStars} ⭐</p>
//             </motion.div>
//             <p className="text-xs text-orange-700 mt-1">All time ⭐</p>
//           </Card>

//         </div>
//       </div>

//       {/* Today's Activities */}
//       <Card>
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-2xl font-bold text-text">Today's Activities</h2>
//           <Calendar size={24} className="text-primary-600" />
//         </div>
//         {todayResults.length === 0 ? (
//           <div className="text-center py-10 text-text/40">
//             <div className="text-5xl mb-3">📚</div>
//             <p className="text-lg font-semibold">No activities yet today</p>
//             <p className="text-sm mt-1">Teacher will launch activities from the classroom TV!</p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {todayResults.map((result, index) => (
//               <motion.div key={result.id}
//                 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: index * 0.08 }}
//                 className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
//                 <div className="flex items-center gap-4">
//                   <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
//                     <BookOpen size={24} className="text-primary-600" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-text">{result.activityName}</h3>
//                     <p className="text-sm text-text/60">
//                       {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                     </p>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-2xl">
//                     {[...Array(5)].map((_, i) => (
//                       <span key={i}>{i < result.stars ? '⭐' : '☆'}</span>
//                     ))}
//                   </p>
//                   <p className="text-sm text-text/60">{result.score}%</p>
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         )}
//       </Card>

//       {/* Achievements */}
//       <Card>
//         <h2 className="text-2xl font-bold text-text mb-4">🏆 Achievements This Week</h2>
//         <div className="grid grid-cols-3 gap-4">
//           {achievements.map((a, i) => (
//             <motion.div key={i}
//               initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
//               transition={{ delay: i * 0.1 }}
//               className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200 text-center">
//               <div className="text-5xl mb-2">{a.icon}</div>
//               <h3 className="font-bold text-text mb-1">{a.title}</h3>
//               <p className="text-sm text-text/60">{a.description}</p>
//             </motion.div>
//           ))}
//         </div>
//       </Card>

//     </div>
//   );
// };

// export default ParentHome;


import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Card } from '../../../components/shared';
import { TrendingUp, Award, BookOpen, Star, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../../../config';

const ParentHome = ({ selectedChild }) => {

  const [starsData, setStarsData] = useState({
    total_stars: 0,
    today_stars: 0,
    today_count: 0,
    results: [],
  });
  const [presentToday, setPresentToday] = useState(false);
  const [showLiveBanner, setShowLiveBanner] = useState(false);
  const [latestResult, setLatestResult] = useState(null);
  const prevCountRef = useRef(0);

  const totalStars = starsData.total_stars;
  const todayStars = starsData.today_stars;
  const todayCount = starsData.today_count;
  const allResults = starsData.results;
  const today = new Date().toISOString().split('T')[0];
  const todayResults = allResults.filter(r => r.date === today);
  const todayAvg = todayResults.length > 0
    ? (todayResults.reduce((s, r) => s + r.stars, 0) / todayResults.length).toFixed(1)
    : '—';

  useEffect(() => {
    if (!selectedChild?.id) return;
    fetchStarsData(selectedChild.id);
    fetchAttendance(selectedChild.id, selectedChild.name);
  }, [selectedChild?.id]);

  useEffect(() => {
    if (!selectedChild?.id) return;
    const interval = setInterval(() => {
      fetchStarsData(selectedChild.id);
      fetchAttendance(selectedChild.id, selectedChild.name);
    }, 15000);
    return () => clearInterval(interval);
  }, [selectedChild?.id]);

  const fetchStarsData = async (studentId) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/parent/child-stars?student_id=${studentId}`
      );
      if (res.data?.status === 'success') {
        setStarsData(res.data);
        if (res.data.results.length > prevCountRef.current && prevCountRef.current > 0) {
          setLatestResult(res.data.results[0]);
          setShowLiveBanner(true);
          setTimeout(() => setShowLiveBanner(false), 4000);
        }
        prevCountRef.current = res.data.results.length;
      }
    } catch (err) {
      console.error('Stars fetch error:', err);
    }
  };

  const fetchAttendance = async (studentId, studentName) => {
    console.log('fetchAttendance called:', studentId, studentName);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/parent/check-attendance?student_id=${studentId}&name=${encodeURIComponent(studentName)}`
      );
      if (res.data?.status === 'success') {
        setPresentToday(res.data.present);
        console.log('Attendance:', res.data.present);
      }
    } catch (err) {
      console.error('Attendance fetch error:', err);
    }
  };

  if (!selectedChild) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-5xl mb-3">👶</div>
        <p className="text-text/60 font-semibold">No child selected</p>
        <p className="text-sm text-text/40 mt-1">Please select a child from the top menu</p>
      </div>
    </div>
  );

  const achievements = [
    { icon: '🌟', title: 'Perfect Week', description: '5 day streak!' },
    { icon: '💯', title: '100% Score', description: 'Alphabet mastery' },
    { icon: '🎨', title: 'Color Expert', description: 'All colors learned' },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2">Hi, Welcome! 👋</h1>
        <p className="text-text/60">Track {selectedChild?.name}'s learning journey</p>
      </div>

      {/* Live Banner */}
      <AnimatePresence>
        {showLiveBanner && latestResult && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 flex items-center gap-4 text-white shadow-lg"
          >
            <div className="text-4xl">🎉</div>
            <div>
              <p className="font-bold text-lg">New result just in!</p>
              <p className="text-white/90">
                {latestResult.activityName} —{' '}
                {latestResult.stars} star{latestResult.stars !== 1 ? 's' : ''} earned!&nbsp;
                {[...Array(5)].map((_, i) => (
                  <span key={i}>{i < latestResult.stars ? '⭐' : '☆'}</span>
                ))}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Child Info Card */}
      <Card className="bg-gradient-to-r from-primary-400 to-secondary-400 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{selectedChild?.name}</h2>
            <p className="text-white/90 mb-1">
              {selectedChild?.class} · Roll No: {selectedChild?.roll_number || selectedChild?.rollNo || '—'}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className={`px-3 py-1 backdrop-blur rounded-full text-sm font-semibold ${presentToday ? 'bg-white/20' : 'bg-red-400/40'}`}>
                {presentToday ? '✅ Present Today' : '❌ Not Marked Yet'}
              </div>
            </div>
          </div>
          <div className="text-6xl sm:text-8xl opacity-20">🎒</div>
        </div>
      </Card>

      {/* Today's Summary */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-text mb-4">Today's Summary</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={20} className="text-green-700" />
              <p className="text-sm text-green-700 font-semibold">Activities</p>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-green-900">{todayCount}</p>
            <p className="text-xs text-green-700 mt-1">Completed today</p>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Star size={20} className="text-yellow-700" />
              <p className="text-sm text-yellow-700 font-semibold">Today Stars</p>
            </div>
            <motion.div key={todayStars} initial={{ scale: 1.4 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
              <p className="text-3xl sm:text-4xl font-bold text-yellow-900">{todayStars} ⭐</p>
            </motion.div>
            <p className="text-xs text-yellow-700 mt-1">Avg {todayAvg}/5</p>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-purple-700" />
              <p className="text-sm text-purple-700 font-semibold">Streak</p>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-purple-900">—</p>
            <p className="text-xs text-purple-700 mt-1">Days 🔥</p>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Award size={20} className="text-orange-700" />
              <p className="text-sm text-orange-700 font-semibold">Total Stars</p>
            </div>
            <motion.div key={totalStars} initial={{ scale: 1.5 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
              <p className="text-3xl sm:text-4xl font-bold text-orange-900">{totalStars} ⭐</p>
            </motion.div>
            <p className="text-xs text-orange-700 mt-1">All time ⭐</p>
          </Card>

        </div>
      </div>

      {/* Today's Activities */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-text">Today's Activities</h2>
          <Calendar size={24} className="text-primary-600" />
        </div>
        {todayResults.length === 0 ? (
          <div className="text-center py-10 text-text/40">
            <div className="text-5xl mb-3">📚</div>
            <p className="text-lg font-semibold">No activities yet today</p>
            <p className="text-sm mt-1">Teacher will launch activities from the classroom TV!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayResults.map((result, index) => (
              <motion.div key={result.id}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen size={24} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text">{result.activityName}</h3>
                    <p className="text-sm text-text/60">
                      {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < result.stars ? '⭐' : '☆'}</span>
                    ))}
                  </p>
                  <p className="text-sm text-text/60">{result.score}%</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Achievements */}
      <Card>
        <h2 className="text-xl sm:text-2xl font-bold text-text mb-4">🏆 Achievements This Week</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {achievements.map((a, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border-2 border-yellow-200 text-center">
              <div className="text-5xl mb-2">{a.icon}</div>
              <h3 className="font-bold text-text mb-1">{a.title}</h3>
              <p className="text-sm text-text/60">{a.description}</p>
            </motion.div>
          ))}
        </div>
      </Card>

    </div>
  );
};

export default ParentHome;
