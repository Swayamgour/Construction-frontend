// import React, { useState, useRef, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { FiMenu, FiX } from "react-icons/fi";
// import Sidebar from "./Sidebar";

// const Header = ({ sidebarOpen, setSidebarOpen }) => {
//   const [openProfile, setOpenProfile] = useState(false);
//   // const [sidebarOpen, setSidebarOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const navigate = useNavigate();

//   // Close dropdown when clicked outside
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setOpenProfile(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <>
//       {/* Header Section */}
//       <header className="flex justify-between items-center w-full bg-white px-6 py-4 border-b border-gray-200 shadow-sm sticky top-0 z-40">
//         {/* 👇 Left: Menu Button + Title */}
//         <div className="flex items-center gap-4">
//           {/* Menu Toggle Button */}
//           <button
//             onClick={() => setSidebarOpen(true)}
//             className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition"
//           >
//             <FiMenu className="text-2xl text-gray-700" />
//           </button>

//           {/* Title */}
//           <h1 className="text-2xl font-normal bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
//             ERP System
//           </h1>
//         </div>

//         {/* 👇 Right: date, time, Notifications, Profile Dropdown */}
//         <div className="flex items-center gap-4 relative" ref={dropdownRef}>


//           {/* Notification Bell */}
//           <div className="relative">

//             <FiBell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-yellow-500 transition"
//               onClick={() => navigate("/Notification")} />
//             <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
//               2
//             </span>
//           </div>

//           <span className="text-gray-600 font-medium hidden sm:block">
//             Hi, Admin
//           </span>

//           <button
//             onClick={() => setOpenProfile(!openProfile)}
//             className="focus:outline-none"
//           >
//             <img
//               src="profile.png"
//               alt="User"
//               className="w-10 h-10 rounded-full border-2 border-gray-300 hover:scale-105 transition-transform"
//             />
//           </button>

//           {/* Profile Dropdown */}
//           <AnimatePresence>
//             {openProfile && (
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -10 }}
//                 transition={{ duration: 0.2 }}
//                 className="absolute right-0 top-14 w-48 bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden z-50"
//               >
//                 <ul className="text-gray-700">
//                   <li
//                     onClick={() => { setOpenProfile(false); navigate("/Profile"); }}
//                     className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                   >
//                     Profile
//                   </li>
//                   <li
//                     onClick={() => setOpenProfile(false)}
//                     className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                   >
//                     Settings
//                   </li>
//                   <li
//                     onClick={() => navigate("/login")}
//                     className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
//                   >
//                     Logout
//                   </li>
//                 </ul>
//               </motion.div>
//             )}
//           </AnimatePresence>
//         </div>
//       </header>

//       {/* 👇 Right: Profile Dropdown */}
//       <div className="flex items-center gap-4 relative" ref={dropdownRef}>
//         <span className="text-gray-600 font-medium hidden sm:block">
//           Hi, Admin
//         </span>

//         <button
//           onClick={() => setOpenProfile(!openProfile)}
//           className="focus:outline-none"
//         >
//           <img
//             src="profile.png"
//             alt="User"
//             className="w-10 h-10 rounded-full border-2 border-gray-300 hover:scale-105 transition-transform"
//           />
//         </button>

//         {/* Profile Dropdown */}
//         <AnimatePresence>
//           {openProfile && (
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.2 }}
//               className="absolute right-0 top-14 w-48 bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden z-50"
//             >
//               <ul className="text-gray-700">
//                 <li
//                   onClick={() => { setOpenProfile(false); navigate("/Profile"); }}
//                   className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                 >
//                   Profile
//                 </li>
//                 <li
//                   onClick={() => setOpenProfile(false)}
//                   className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                 >
//                   Settings
//                 </li>
//                 <li
//                   onClick={() => navigate("/login")}
//                   className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
//                 >
//                   Logout
//                 </li>
//               </ul>
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </header >

//       {/* 👇 Sidebar with Overlay (for mobile view) */ }
//       < AnimatePresence >
//       { sidebarOpen && (
//         <>
//           {/* Overlay Background */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 0.5 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.2 }}
//             className="fixed inset-0 bg-black z-40 lg:hidden"
//             onClick={() => setSidebarOpen(false)}
//           />

//           {/* Sidebar */}
//           <motion.div
//             initial={{ x: "-100%" }}
//             animate={{ x: 0 }}
//             exit={{ x: "-100%" }}
//             transition={{ type: "tween", duration: 0.3 }}
//             className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 lg:hidden"
//           >
//             <div className="flex justify-between items-center p-4 border-b">
//               <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
//               <button
//                 onClick={() => setSidebarOpen(false)}
//                 className="p-2 rounded-md hover:bg-gray-100 transition"
//               >
//                 <FiX className="text-2xl text-gray-700" />
//               </button>
//             </div>

//             {/* Reuse your existing Sidebar component */}
//             <Sidebar
//               sidebarOpen={sidebarOpen}
//               setSidebarOpen={setSidebarOpen}
//             />
//           </motion.div>
//         </>
//       )
// }
//       </AnimatePresence >
//     </>
//   );
// };

// export default Header;



import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiBell } from "react-icons/fi";
import Sidebar from "./Sidebar";
import toast from "react-hot-toast";
// import Notification from "../pages/Notification";


const Header = ({ sidebarOpen, setSidebarOpen, role, user }) => {

  // console.log(role, user)


  const [openProfile, setOpenProfile] = useState(false);
  // const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [dateTime, setDateTime] = useState(new Date());

  const dropdownRef = useRef(null);
  const navigate = useNavigate();




  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handelLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");

    // navigate first (redirect)
    navigate("/login");

    // then reload page
    window.location.reload();
  };




  return (
    <>
      {/* Header Section */}
      <header className="flex justify-between items-center w-full bg-white px-6 py-4 border-b border-gray-200 shadow-sm sticky top-0 z-40">
        {/* 👇 Left: Menu Button + Title */}
        <div className="flex items-center gap-4">
          {/* Menu Toggle Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition"
          >
            <FiMenu className="text-2xl text-gray-700" />
          </button>

          {/* Title */}
          <h1 className="text-2xl font-normal bg-gradient-to-r from-slate-900 via-blue-800 to-purple-700 bg-clip-text text-transparent">
            ERP System
          </h1>
        </div>



        {/* 👇 Right: date, time, Notifications, Profile Dropdown */}
        <div className="flex items-center gap-4 relative" ref={dropdownRef}>


          {/* Notification Bell */}
          <div className="relative">

            <FiBell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-yellow-500 transition"
              onClick={() => navigate("/Notification")} />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
              2
            </span>
          </div>

          <span className="text-gray-600 font-medium hidden sm:block">
            Hi, {user?.name || 'User'} {`( ${role || 'Role'} )`}
          </span>

          <button
            onClick={() => setOpenProfile(!openProfile)}
            className="focus:outline-none"
          >
            <img
              src="/profile.png"
              alt="User"
              className="w-10 h-10 rounded-full border-2 border-gray-300 hover:scale-105 transition-transform"
            />
          </button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {openProfile && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-14 w-48 bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden z-50"
              >
                <ul className="text-gray-700">
                  <li
                    onClick={() => { setOpenProfile(false); navigate("/Profile"); }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Profile
                  </li>
                  {/* <li
                    onClick={() => setOpenProfile(false)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Settings
                  </li> */}
                  <li
                    onClick={() => handelLogout()}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
                  >
                    Logout
                  </li>
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* 👇 Sidebar with Overlay (for mobile view) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay Background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 lg:hidden"
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-md hover:bg-gray-100 transition"
                >
                  <FiX className="text-2xl text-gray-700" />
                </button>
              </div>

              {/* Reuse your existing Sidebar component */}
              <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
