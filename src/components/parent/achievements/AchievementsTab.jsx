

// // src/components/parent/achievements/AchievementsTab.jsx
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { API_BASE_URL } from '../../../config';
// import { Card } from '../../../components/shared';
// import { Star, Lock } from 'lucide-react';
// import { motion } from 'framer-motion';

// const ALL_BADGES = [
//   { id:1, icon:'🌟', name:'First Star',    description:'Earn your first star',   unlockAt:1,   rarity:'common'    },
//   { id:2, icon:'📚', name:'Bookworm',      description:'Complete 3 activities',  unlockAt:5,   rarity:'common'    },
//   { id:3, icon:'🏃', name:'Fast Learner',  description:'Earn 15 stars',          unlockAt:15,  rarity:'common'    },
//   { id:4, icon:'🔥', name:'On Fire',       description:'Earn 30 stars',          unlockAt:30,  rarity:'uncommon'  },
//   { id:5, icon:'🎨', name:'Color Master',  description:'Earn 50 stars',          unlockAt:50,  rarity:'rare'      },
//   { id:6, icon:'💯', name:'Perfect Score', description:'Earn 75 stars',          unlockAt:75,  rarity:'rare'      },
//   { id:7, icon:'🏆', name:'Champion',      description:'Earn 100 stars',         unlockAt:100, rarity:'epic'      },
//   { id:8, icon:'👑', name:'Legend',        description:'Earn 200 stars',         unlockAt:200, rarity:'legendary' },
// ];

// const RARITY_GRADIENT = {
//   common:    'from-gray-400 to-gray-600',
//   uncommon:  'from-green-400 to-green-600',
//   rare:      'from-blue-400 to-blue-600',
//   epic:      'from-purple-400 to-purple-600',
//   legendary: 'from-yellow-400 to-orange-500',
// };

// const AchievementsTab = ({ selectedChild }) => {

//   // ── State ───────────────────────────────────────────────────
//   const [starsData, setStarsData] = useState({
//     total_stars: 0,
//     results: [],
//   });
//   const [loading, setLoading] = useState(false);

//   // ── Fetch jab bhi selectedChild badle ──────────────────────
//   useEffect(() => {
//     if (!selectedChild?.id) return;
//     fetchAchievementsData(selectedChild.id);
//   }, [selectedChild?.id]);

//   const fetchAchievementsData = async (studentId) => {
//     try {
//       setLoading(true);
//       const res = await axios.get(
//         `${API_BASE_URL}/api/parent/child-stars?student_id=${studentId}`
//       );
//       if (res.data?.status === 'success') {
//         setStarsData({
//           total_stars: res.data.total_stars,
//           results:     res.data.results,
//         });
//       }
//     } catch (err) {
//       console.error('Achievements fetch error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Calculations ────────────────────────────────────────────
//   const totalStars = starsData.total_stars;
//   const earned     = ALL_BADGES.filter(b => totalStars >= b.unlockAt);
//   const locked     = ALL_BADGES.filter(b => totalStars <  b.unlockAt);
//   const nextBadge  = locked[0];

//   // Leaderboard — current child live, baaki static
//   const leaderboard = [
//     { name: selectedChild?.name || 'You', stars: totalStars, isCurrentUser: true  },
//     { name: 'Priya Patel',                stars: 42,         isCurrentUser: false },
//     { name: 'Rohan Kumar',                stars: 37,         isCurrentUser: false },
//     { name: 'Sara Ali',                   stars: 35,         isCurrentUser: false },
//     { name: 'Ananya Singh',               stars: 29,         isCurrentUser: false },
//   ]
//     .sort((a, b) => b.stars - a.stars)
//     .map((s, i) => ({ ...s, rank: i + 1 }));

//   // ── No child selected ───────────────────────────────────────
//   if (!selectedChild) return (
//     <div className="flex items-center justify-center py-20">
//       <div className="text-center">
//         <div className="text-5xl mb-3">🏆</div>
//         <p className="text-text/60 font-semibold">No child selected</p>
//         <p className="text-sm text-text/40 mt-1">Please select a child from the top menu</p>
//       </div>
//     </div>
//   );

//   // ── Loading ─────────────────────────────────────────────────
//   if (loading) return (
//     <div className="flex items-center justify-center py-20">
//       <div className="text-center">
//         <div className="text-5xl mb-3 animate-spin inline-block">⏳</div>
//         <p className="text-text/60">Loading achievements...</p>
//       </div>
//     </div>
//   );

//   return (
//     <div className="space-y-6">

//       <div>
//         <h1 className="text-4xl font-bold text-text mb-2">
//           {selectedChild.name}'s Achievements 🏆
//         </h1>
//         <p className="text-text/60">Badges earned and goals to unlock</p>
//       </div>

//       {/* Stars summary */}
//       <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 border-0 text-white text-center py-6">
//         <motion.div key={totalStars} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
//           transition={{ type: 'spring' }}>
//           <Star size={56} className="mx-auto mb-2 fill-white text-white" />
//           <p className="text-6xl font-bold">{totalStars}</p>
//           <p className="text-white/90 text-xl mt-1">Total Stars</p>
//           <p className="text-white/70 text-sm mt-1">
//             {earned.length} / {ALL_BADGES.length} badges unlocked
//           </p>
//         </motion.div>
//       </Card>

//       {/* Earned Badges */}
//       {earned.length > 0 && (
//         <div>
//           <h2 className="text-2xl font-bold text-text mb-4">
//             🎖️ Earned Badges ({earned.length})
//           </h2>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             {earned.map((badge, i) => (
//               <motion.div key={badge.id}
//                 initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
//                 transition={{ delay: i * 0.07, type: 'spring' }}>
//                 <Card className="text-center hover:shadow-lg transition-shadow">
//                   <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${RARITY_GRADIENT[badge.rarity]} flex items-center justify-center text-4xl mx-auto mb-3`}>
//                     {badge.icon}
//                   </div>
//                   <h3 className="font-bold text-text text-sm mb-1">{badge.name}</h3>
//                   <p className="text-xs text-text/60 mb-2">{badge.description}</p>
//                   <span className={`text-xs px-2 py-1 rounded-full font-semibold bg-gradient-to-r ${RARITY_GRADIENT[badge.rarity]} text-white capitalize`}>
//                     {badge.rarity}
//                   </span>
//                 </Card>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* No badges yet */}
//       {earned.length === 0 && (
//         <Card className="text-center py-10">
//           <div className="text-5xl mb-3">🌱</div>
//           <p className="text-text/60 font-semibold">No badges yet!</p>
//           <p className="text-sm text-text/40 mt-1">
//             Complete activities to earn your first badge
//           </p>
//         </Card>
//       )}

//       {/* Locked Badges */}
//       {locked.length > 0 && (
//         <div>
//           <h2 className="text-2xl font-bold text-text mb-4">
//             🔒 Locked Badges ({locked.length})
//           </h2>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             {locked.map((badge, i) => (
//               <motion.div key={badge.id}
//                 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: i * 0.06 }}>
//                 <Card className="text-center opacity-60">
//                   <div className="w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center mx-auto mb-3 relative">
//                     <span className="text-4xl blur-sm">{badge.icon}</span>
//                     <Lock size={20} className="absolute text-gray-500" />
//                   </div>
//                   <h3 className="font-bold text-text text-sm mb-1">{badge.name}</h3>
//                   <p className="text-xs text-text/60 mb-2">{badge.description}</p>
//                   <p className="text-xs font-semibold text-primary-600">
//                     Need {badge.unlockAt} ⭐ ({Math.max(0, badge.unlockAt - totalStars)} more)
//                   </p>
//                 </Card>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Leaderboard */}
//       <Card>
//         <h2 className="text-2xl font-bold text-text mb-4">🏅 Class Leaderboard</h2>
//         <div className="space-y-3">
//           {leaderboard.map((student, i) => (
//             <motion.div key={student.name}
//               initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: i * 0.07 }}
//               className={`flex items-center justify-between p-4 rounded-2xl border-2 ${
//                 student.isCurrentUser
//                   ? 'border-primary-300 bg-primary-50'
//                   : 'border-gray-100 bg-white'
//               }`}>
//               <div className="flex items-center gap-4">
//                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
//                   student.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
//                   student.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'   :
//                   student.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
//                   'bg-gray-200 text-gray-700'
//                 }`}>
//                   {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : student.rank}
//                 </div>
//                 <div>
//                   <h3 className={`font-semibold ${student.isCurrentUser ? 'text-primary-700' : 'text-text'}`}>
//                     {student.name}
//                     {student.isCurrentUser && (
//                       <span className="ml-2 text-sm text-primary-400">(You!)</span>
//                     )}
//                   </h3>
//                   <div className="flex items-center gap-1 text-sm text-text/60">
//                     <Star size={12} className="fill-yellow-400 text-yellow-400" />
//                     <span>{student.stars} stars</span>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </Card>

//       {/* Motivation */}
//       <Card className="bg-gradient-to-r from-purple-400 to-pink-400 text-white border-0">
//         <div className="flex items-center gap-4">
//           <div className="text-6xl">🚀</div>
//           <div>
//             <h3 className="text-2xl font-bold mb-1">Keep Going!</h3>
//             <p className="text-white/90">
//               {totalStars === 0
//                 ? 'Complete your first activity to earn stars and unlock badges!'
//                 : nextBadge
//                   ? `Only ${nextBadge.unlockAt - totalStars} more stars to unlock "${nextBadge.name}"! ${nextBadge.icon}`
//                   : 'You have unlocked all badges! You are a Legend! 👑'}
//             </p>
//           </div>
//         </div>
//       </Card>

//     </div>
//   );
// };

// export default AchievementsTab;

// src/components/parent/achievements/AchievementsTab.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import { Card } from '../../../components/shared';
import { Star, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const ALL_BADGES = [
  { id:1, icon:'🌟', name:'First Star',    description:'Earn your first star',   unlockAt:1,   rarity:'common'    },
  { id:2, icon:'📚', name:'Bookworm',      description:'Complete 3 activities',  unlockAt:5,   rarity:'common'    },
  { id:3, icon:'🏃', name:'Fast Learner',  description:'Earn 15 stars',          unlockAt:15,  rarity:'common'    },
  { id:4, icon:'🔥', name:'On Fire',       description:'Earn 30 stars',          unlockAt:30,  rarity:'uncommon'  },
  { id:5, icon:'🎨', name:'Color Master',  description:'Earn 50 stars',          unlockAt:50,  rarity:'rare'      },
  { id:6, icon:'💯', name:'Perfect Score', description:'Earn 75 stars',          unlockAt:75,  rarity:'rare'      },
  { id:7, icon:'🏆', name:'Champion',      description:'Earn 100 stars',         unlockAt:100, rarity:'epic'      },
  { id:8, icon:'👑', name:'Legend',        description:'Earn 200 stars',         unlockAt:200, rarity:'legendary' },
];

const RARITY_GRADIENT = {
  common:    'from-gray-400 to-gray-600',
  uncommon:  'from-green-400 to-green-600',
  rare:      'from-blue-400 to-blue-600',
  epic:      'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500',
};

const AchievementsTab = ({ selectedChild }) => {

  const [starsData, setStarsData] = useState({
    total_stars: 0,
    results: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedChild?.id) return;
    fetchAchievementsData(selectedChild.id);
  }, [selectedChild?.id]);

  const fetchAchievementsData = async (studentId) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/parent/child-stars?student_id=${studentId}`
      );
      if (res.data?.status === 'success') {
        setStarsData({
          total_stars: res.data.total_stars,
          results:     res.data.results,
        });
      }
    } catch (err) {
      console.error('Achievements fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalStars = starsData.total_stars;
  const earned     = ALL_BADGES.filter(b => totalStars >= b.unlockAt);
  const locked     = ALL_BADGES.filter(b => totalStars <  b.unlockAt);
  const nextBadge  = locked[0];

  const leaderboard = [
    { name: selectedChild?.name || 'You', stars: totalStars, isCurrentUser: true  },
    { name: 'Priya Patel',                stars: 42,         isCurrentUser: false },
    { name: 'Rohan Kumar',                stars: 37,         isCurrentUser: false },
    { name: 'Sara Ali',                   stars: 35,         isCurrentUser: false },
    { name: 'Ananya Singh',               stars: 29,         isCurrentUser: false },
  ]
    .sort((a, b) => b.stars - a.stars)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  if (!selectedChild) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-5xl mb-3">🏆</div>
        <p className="text-text/60 font-semibold">No child selected</p>
        <p className="text-sm text-text/40 mt-1">Please select a child from the top menu</p>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-5xl mb-3 animate-spin inline-block">⏳</div>
        <p className="text-text/60">Loading achievements...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2">
          {selectedChild.name}'s Achievements 🏆
        </h1>
        <p className="text-text/60">Badges earned and goals to unlock</p>
      </div>

      {/* Stars summary */}
      <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 border-0 text-white text-center py-6">
        <motion.div key={totalStars} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
          transition={{ type: 'spring' }}>
          <Star size={56} className="mx-auto mb-2 fill-white text-white" />
          <p className="text-5xl sm:text-6xl font-bold">{totalStars}</p>
          <p className="text-white/90 text-xl mt-1">Total Stars</p>
          <p className="text-white/70 text-sm mt-1">
            {earned.length} / {ALL_BADGES.length} badges unlocked
          </p>
        </motion.div>
      </Card>

      {/* Earned Badges */}
      {earned.length > 0 && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-text mb-4">
            🎖️ Earned Badges ({earned.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {earned.map((badge, i) => (
              <motion.div key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.07, type: 'spring' }}>
                <Card className="text-center hover:shadow-lg transition-shadow">
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${RARITY_GRADIENT[badge.rarity]} flex items-center justify-center text-3xl sm:text-4xl mx-auto mb-3`}>
                    {badge.icon}
                  </div>
                  <h3 className="font-bold text-text text-sm mb-1">{badge.name}</h3>
                  <p className="text-xs text-text/60 mb-2">{badge.description}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold bg-gradient-to-r ${RARITY_GRADIENT[badge.rarity]} text-white capitalize`}>
                    {badge.rarity}
                  </span>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No badges yet */}
      {earned.length === 0 && (
        <Card className="text-center py-10">
          <div className="text-5xl mb-3">🌱</div>
          <p className="text-text/60 font-semibold">No badges yet!</p>
          <p className="text-sm text-text/40 mt-1">Complete activities to earn your first badge</p>
        </Card>
      )}

      {/* Locked Badges */}
      {locked.length > 0 && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-text mb-4">
            🔒 Locked Badges ({locked.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {locked.map((badge, i) => (
              <motion.div key={badge.id}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}>
                <Card className="text-center opacity-60">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gray-200 flex items-center justify-center mx-auto mb-3 relative">
                    <span className="text-3xl sm:text-4xl blur-sm">{badge.icon}</span>
                    <Lock size={20} className="absolute text-gray-500" />
                  </div>
                  <h3 className="font-bold text-text text-sm mb-1">{badge.name}</h3>
                  <p className="text-xs text-text/60 mb-2">{badge.description}</p>
                  <p className="text-xs font-semibold text-primary-600">
                    Need {badge.unlockAt} ⭐ ({Math.max(0, badge.unlockAt - totalStars)} more)
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <Card>
        <h2 className="text-xl sm:text-2xl font-bold text-text mb-4">🏅 Class Leaderboard</h2>
        <div className="space-y-3">
          {leaderboard.map((student, i) => (
            <motion.div key={student.name}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`flex items-center justify-between p-4 rounded-2xl border-2 ${
                student.isCurrentUser
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-gray-100 bg-white'
              }`}>
              <div className="flex items-center gap-3 sm:gap-4">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg shrink-0 ${
                  student.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                  student.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white'   :
                  student.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                  'bg-gray-200 text-gray-700'
                }`}>
                  {student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : student.rank}
                </div>
                <div>
                  <h3 className={`font-semibold ${student.isCurrentUser ? 'text-primary-700' : 'text-text'}`}>
                    {student.name}
                    {student.isCurrentUser && (
                      <span className="ml-2 text-sm text-primary-400">(You!)</span>
                    )}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-text/60">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span>{student.stars} stars</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Motivation */}
      <Card className="bg-gradient-to-r from-purple-400 to-pink-400 text-white border-0">
        <div className="flex items-center gap-4">
          <div className="text-5xl sm:text-6xl shrink-0">🚀</div>
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-1">Keep Going!</h3>
            <p className="text-white/90">
              {totalStars === 0
                ? 'Complete your first activity to earn stars and unlock badges!'
                : nextBadge
                  ? `Only ${nextBadge.unlockAt - totalStars} more stars to unlock "${nextBadge.name}"! ${nextBadge.icon}`
                  : 'You have unlocked all badges! You are a Legend! 👑'}
            </p>
          </div>
        </div>
      </Card>

    </div>
  );
};

export default AchievementsTab;
