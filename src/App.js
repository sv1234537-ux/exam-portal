import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, addDoc, onSnapshot, collection, query, orderBy, serverTimestamp, getDocs, where, updateDoc } from 'firebase/firestore';
import { useForm } from "react-hook-form";
import { X, User, Shield, CheckCircle, Clock, List, Calendar, FileText, Send } from 'lucide-react';

// --- Firebase Initialization ---
// Global variables provided by the canvas environment
const appId = "exam-portal";
const firebaseConfig = {
  apiKey: "AIzaSyDSnJ25d0y6qjAUn0PE0BqrI1DrKJMip0s",
  authDomain: "test-app-f5824.firebaseapp.com",
  projectId: "test-app-f5824",
  storageBucket: "test-app-f5824.firebasestorage.app",
  messagingSenderId: "85024879681",
  appId: "1:85024879681:web:0e8c48365da46388c8c2c0"
};
const initialAuthToken = "";

// Initialize Firebase
let app, auth, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (e) {
  console.error("Firebase initialization failed:", e);
}

function App() {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [view, setView] = useState('login'); // 'login', 'admin', 'student'
  const [isLoading, setIsLoading] = useState(true);

  // --- Auth state and initial sign-in ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
        setUserId(authUser.uid);
        if (authUser.uid === 'admin') {
            setView('admin');
        } else {
            setView('student');
        }
      } else {
        setUser(null);
        setUserId(null);
        setView('login');
      }
      setIsLoading(false);
    });

    const signIn = async () => {
        try {
            await signInWithCustomToken(auth, initialAuthToken);
        } catch (error) {
            console.error("Error signing in with custom token:", error);
            setIsLoading(false);
        }
    };
    if (initialAuthToken) {
        signIn();
    } else {
        setIsLoading(false);
    }
    return () => unsubscribe();
  }, []);

  const handleLogin = (name, password) => {
    const validStudents = {
      'Utkarsha': 'utkarsha123',
      'Prankur': 'prankur123'
    };
    const adminPassword = 'admin123';

    if (name === 'Admin' && password === adminPassword) {
      const mockAdmin = { uid: 'admin', displayName: 'Admin' };
      setUser(mockAdmin);
      setUserId(mockAdmin.uid);
      setView('admin');
    } else if (validStudents[name] && validStudents[name] === password) {
      const mockUser = {
        uid: name,
        displayName: name,
      };
      setUser(mockUser);
      setUserId(mockUser.uid);
      setView('student');
    } else {
      setShowLoginError(true);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUserId(null);
    setView('login');
  };

  const [showLoginError, setShowLoginError] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl font-semibold text-gray-700">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased text-gray-800 p-4">
      {view === 'login' && <LoginPage onLogin={handleLogin} showLoginError={showLoginError} setShowLoginError={setShowLoginError} />}
      {view === 'admin' && <AdminPage userId={userId} onLogout={handleLogout} />}
      {view === 'student' && <StudentPage userId={userId} user={user} onLogout={handleLogout} />}
    </div>
  );
}

// --- Login Page Component ---
function LoginPage({ onLogin, showLoginError, setShowLoginError }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = data => onLogin(data.name, data.password);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-400 to-indigo-500 p-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Welcome to the Exam Portal</h2>
        <p className="text-gray-600 mb-8">Please login with your credentials to begin your test.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
              {...register("name", { required: true })}
            >
              <option value="">Select User</option>
              <option value="Admin">Admin</option>
              <option value="Utkarsha">Utkarsha</option>
              <option value="Prankur">Prankur</option>
            </select>
            {errors.name && <span className="text-red-500 text-sm mt-1 block">User selection is required</span>}
          </div>
          <div>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
              {...register("password", { required: true })}
            />
            {errors.password && <span className="text-red-500 text-sm mt-1 block">Password is required</span>}
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
          >
            Enter Portal
          </button>
        </form>
      </div>

      {showLoginError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl text-center max-w-sm">
            <h3 className="text-2xl font-bold text-red-600 mb-4">Login Failed</h3>
            <p className="text-lg text-gray-700 mb-6">Incorrect username or password. Please try again.</p>
            <button
              onClick={() => setShowLoginError(false)}
              className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition duration-300 transform hover:scale-105"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Admin Page Component ---
function AdminPage({ onLogout }) {
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [testQueries, setTestQueries] = useState([]);

  // Form hooks for bulk question upload
  const { register: bulkQRegister, handleSubmit: bulkQHandleSubmit, reset: bulkQReset, formState: { errors: bulkQErrors } } = useForm();
  
  // Form hooks for notifications
  const { register: nRegister, handleSubmit: nHandleSubmit, reset: nReset, formState: { errors: nErrors } } = useForm();
  
  // Form hooks for weekly schedule
  const { register: wsRegister, handleSubmit: wsHandleSubmit, reset: wsReset, formState: { errors: wsErrors } } = useForm();

  // Fetch data on load
  useEffect(() => {
    if (!db) return;

    // Fetch questions
    const qQuestions = query(collection(db, `artifacts/${appId}/public/data/questions`));
    const unsubscribeQuestions = onSnapshot(qQuestions, (snapshot) => {
      const qList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(qList);
    });

    // Fetch results
    const qResults = query(collection(db, `artifacts/${appId}/public/data/results`));
    const unsubscribeResults = onSnapshot(qResults, (snapshot) => {
      const rList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResults(rList);
    });

    // Fetch daily reports
    const qDailyReports = query(collection(db, `artifacts/${appId}/public/data/daily_reports`), orderBy("createdAt", "desc"));
    const unsubscribeDailyReports = onSnapshot(qDailyReports, (snapshot) => {
        const drList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDailyReports(drList);
    });
    
    // Fetch test queries
    const qTestQueries = query(collection(db, `artifacts/${appId}/public/data/test_queries`), orderBy("createdAt", "desc"));
    const unsubscribeTestQueries = onSnapshot(qTestQueries, (snapshot) => {
        const tqList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTestQueries(tqList);
    });

    // Fetch notifications
    const qNotifications = query(collection(db, `artifacts/${appId}/public/data/notifications`), orderBy("createdAt", "desc"));
    const unsubscribeNotifications = onSnapshot(qNotifications, (snapshot) => {
      const nList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(nList);
    });

    // Fetch weekly schedule
    const qWeeklySchedule = query(collection(db, `artifacts/${appId}/public/data/weekly_schedule`), orderBy("date", "asc"));
    const unsubscribeWeeklySchedule = onSnapshot(qWeeklySchedule, (snapshot) => {
      const wsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWeeklySchedule(wsList);
    });

    return () => {
      unsubscribeQuestions();
      unsubscribeResults();
      unsubscribeDailyReports();
      unsubscribeTestQueries();
      unsubscribeNotifications();
      unsubscribeWeeklySchedule();
    };
  }, []);

  // Handler for bulk question upload
  const handleBulkQuestionUpload = async (data) => {
    if (!db) return;
    try {
      const questionsToUpload = JSON.parse(data.questionsJson);
      if (!Array.isArray(questionsToUpload)) {
        throw new Error("Invalid JSON format. Expected an array of questions.");
      }
      
      const testDateTime = new Date(`${data.testDate}T${data.testTime}`);
      
      const questionsCollection = collection(db, `artifacts/${appId}/public/data/questions`);
      for (const question of questionsToUpload) {
        await addDoc(questionsCollection, {
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          testDate: testDateTime, // Save the test date and time with each question
          createdAt: serverTimestamp(),
        });
      }
      bulkQReset();
    } catch (e) {
      console.error("Error adding questions:", e);
    }
  };

  const handleAddNotification = async (data) => {
    if (!db) return;
    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/notifications`), {
        title: data.title,
        message: data.message,
        date: data.date,
        createdAt: serverTimestamp(),
      });
      nReset();
    } catch (e) {
      console.error("Error adding notification:", e);
    }
  };

  const handleAddWeeklySchedule = async (data) => {
    if (!db) return;
    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/weekly_schedule`), {
        title: data.title,
        topic: data.topic,
        date: data.date,
        createdAt: serverTimestamp(),
      });
      wsReset();
    } catch (e) {
      console.error("Error adding weekly schedule:", e);
    }
  };
  
  const handleResolveQuery = async (queryId) => {
    if (!db) return;
    try {
        const queryRef = doc(db, `artifacts/${appId}/public/data/test_queries`, queryId);
        await updateDoc(queryRef, {
            resolved: true,
            resolvedAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Error resolving query:", e);
    }
  };
  
  // Sort results and daily reports by timestamp for consistent display
  const sortedResults = results.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
  const sortedDailyReports = dailyReports.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

  return (
    <div className="p-8 bg-white min-h-screen rounded-2xl shadow-2xl">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-4xl font-extrabold text-indigo-700 flex items-center">
          <Shield className="mr-3 h-10 w-10 text-indigo-600" />
          Admin Dashboard
        </h1>
        <button
          onClick={onLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-red-600 transition duration-300 transform hover:scale-105"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Bulk Question Upload Form */}
        <div className="bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Bulk Question Upload</h2>
          <p className="text-gray-600 mb-4">
            Paste a JSON array of questions here.
            <br />
            Example Format:
            <code className="block bg-gray-200 p-2 my-2 rounded-lg text-sm text-gray-700">
              {`[{ "questionText": "Q1...", "options": ["A", "B"], "correctAnswer": "A" }]`}
            </code>
          </p>
          <form onSubmit={bulkQHandleSubmit(handleBulkQuestionUpload)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Test Date</label>
              <input
                type="date"
                className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...bulkQRegister("testDate", { required: true })}
              />
              {bulkQErrors.testDate && <span className="text-red-500 text-sm">Test date is required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Test Time</label>
              <input
                type="time"
                className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...bulkQRegister("testTime", { required: true })}
              />
              {bulkQErrors.testTime && <span className="text-red-500 text-sm">Test time is required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Questions JSON</label>
              <textarea
                className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                rows="8"
                {...bulkQRegister("questionsJson", { required: true })}
              ></textarea>
              {bulkQErrors.questionsJson && <span className="text-red-500 text-sm">Questions JSON is required</span>}
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
            >
              Upload Questions
            </button>
          </form>
        </div>

        {/* Add Notification & Weekly Schedule Forms */}
        <div className="space-y-8">
            {/* Add Notification Form */}
            <div className="bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Notification</h2>
                <form onSubmit={nHandleSubmit(handleAddNotification)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <input
                    type="text"
                    className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    {...nRegister("title", { required: true })}
                    />
                    {nErrors.title && <span className="text-red-500 text-sm">Title is required</span>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea
                    className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="3"
                    {...nRegister("message", { required: true })}
                    ></textarea>
                    {nErrors.message && <span className="text-red-500 text-sm">Message is required</span>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                    type="date"
                    className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    {...nRegister("date", { required: true })}
                    />
                    {nErrors.date && <span className="text-red-500 text-sm">Date is required</span>}
                </div>
                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
                >
                    Send Notification
                </button>
                </form>
            </div>

            {/* Add Weekly Test Schedule Form */}
            <div className="bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Weekly Test Schedule</h2>
                <form onSubmit={wsHandleSubmit(handleAddWeeklySchedule)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Test Title</label>
                        <input
                            type="text"
                            className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            {...wsRegister("title", { required: true })}
                        />
                        {wsErrors.title && <span className="text-red-500 text-sm">Title is required</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Topics</label>
                        <input
                            type="text"
                            placeholder="e.g., Physics, Chemistry, Maths"
                            className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            {...wsRegister("topic", { required: true })}
                        />
                        {wsErrors.topic && <span className="text-red-500 text-sm">Topic is required</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            {...wsRegister("date", { required: true })}
                        />
                        {wsErrors.date && <span className="text-red-500 text-sm">Date is required</span>}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
                    >
                        Set Schedule
                    </button>
                </form>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Student Records Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Test Records</h2>
          {sortedResults.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Taken</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedResults.map((result, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.userName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {result.score} / {result.totalQuestions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.timeTaken} seconds</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${result.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(result.timestamp?.seconds * 1000).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No test records available yet.</p>
          )}
        </div>
        
        {/* Test Queries Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Queries</h2>
          {testQueries.length > 0 ? (
            <ul className="space-y-4">
              {testQueries.map(query => (
                <li key={query.id} className={`p-4 rounded-xl shadow border border-gray-200 ${query.resolved ? 'bg-green-50' : 'bg-red-50'}`}>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-800">{query.userName}</p>
                    {query.resolved ? (
                      <span className="text-sm text-green-600 font-bold">Resolved</span>
                    ) : (
                      <button
                        onClick={() => handleResolveQuery(query.id)}
                        className="bg-green-500 text-white text-sm px-4 py-1 rounded-full hover:bg-green-600 transition"
                      >
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 mt-1">{query.queryText}</p>
                  <p className="text-sm text-gray-500 mt-2">Date: {new Date(query.createdAt?.seconds * 1000).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No new student queries.</p>
          )}
        </div>
      </div>
      
      {/* Daily Reports Section for Admin */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Student Daily Reports</h2>
        {sortedDailyReports.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Physics</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chemistry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Math</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedDailyReports.map((report, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.userName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{report.physicsTopics || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{report.chemistryTopics || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{report.mathTopics || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No daily reports available yet.</p>
        )}
      </div>
    </div>
  );
}

// --- Student Dashboard Component ---
function StudentPage({ userId, user, onLogout }) {
  const [questions, setQuestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [isTestMode, setIsTestMode] = useState(false);
  const [userRecords, setUserRecords] = useState([]);
  const [isDailyReportSubmitted, setIsDailyReportSubmitted] = useState(false);
  const { register: reportRegister, handleSubmit: reportHandleSubmit, reset: reportReset, formState: { errors: reportErrors } } = useForm();
  const { register: queryRegister, handleSubmit: queryHandleSubmit, reset: queryReset, formState: { errors: queryErrors } } = useForm();
  const [isTestAvailable, setIsTestAvailable] = useState(false);
  const [hasAttemptedTest, setHasAttemptedTest] = useState(false);
  const [testCountdown, setTestCountdown] = useState('');
  
  const today = new Date().toISOString().slice(0, 10);
  const [showWeeklyScheduleModal, setShowWeeklyScheduleModal] = useState(false);
  
  // Check daily report status
  const checkDailyReportStatus = async () => {
    if (!db) return;
    const reportRef = collection(db, `artifacts/${appId}/public/data/daily_reports`);
    const q = query(reportRef, where("userId", "==", userId), where("date", "==", today));
    const querySnapshot = await getDocs(q);
    setIsDailyReportSubmitted(!querySnapshot.empty);
  };

  const handleQuerySubmit = async (data) => {
    if (!db || !userId) return;
    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/test_queries`), {
        userId,
        userName: user.displayName,
        queryText: data.queryText,
        resolved: false,
        createdAt: serverTimestamp(),
      });
      queryReset();
    } catch (e) {
      console.error("Error submitting query:", e);
    }
  };
  
  // Check test availability
  const checkTestAvailability = (questions) => {
    if (questions.length === 0) {
      setIsTestAvailable(false);
      return;
    }
    // Assume all questions are part of the same test and have the same testDate
    const latestQuestion = questions.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds)[0];
    const testDateTime = latestQuestion?.testDate?.toDate();
    const now = new Date();

    if (testDateTime) {
      const timeDiff = testDateTime.getTime() - now.getTime();
      if (timeDiff <= 0) {
        setIsTestAvailable(true);
      } else {
        setIsTestAvailable(false);
        const interval = setInterval(() => {
          const newTimeDiff = testDateTime.getTime() - new Date().getTime();
          if (newTimeDiff <= 0) {
            setIsTestAvailable(true);
            setTestCountdown('Test is now available!');
            clearInterval(interval);
          } else {
            const days = Math.floor(newTimeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((newTimeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((newTimeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((newTimeDiff % (1000 * 60)) / 1000);
            setTestCountdown(`Test available in: ${days}d ${hours}h ${minutes}m ${seconds}s`);
          }
        }, 1000);
        return () => clearInterval(interval);
      }
    }
  };
  
  useEffect(() => {
    if (!db || !userId) return;

    // Fetch notifications
    const qNotifications = query(collection(db, `artifacts/${appId}/public/data/notifications`), orderBy("createdAt", "desc"));
    const unsubscribeNotifications = onSnapshot(qNotifications, (snapshot) => {
      const nList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(nList);
    });

    // Fetch questions and check availability
    const qQuestions = query(collection(db, `artifacts/${appId}/public/data/questions`), orderBy("createdAt", "desc"));
    const unsubscribeQuestions = onSnapshot(qQuestions, (snapshot) => {
        const qList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setQuestions(qList);
        checkTestAvailability(qList);
    });

    // Fetch user's personal records and check for a completed test
    const qUserRecords = query(collection(db, `artifacts/${appId}/public/data/results`), where("userId", "==", userId));
    const unsubscribeUserRecords = onSnapshot(qUserRecords, (snapshot) => {
      const records = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }));
      setUserRecords(records);
      const hasCompletedTest = records.some(record => record.status === 'completed');
      setHasAttemptedTest(hasCompletedTest);
    });
    
    // Fetch weekly schedule
    const qWeeklySchedule = query(collection(db, `artifacts/${appId}/public/data/weekly_schedule`), orderBy("date", "asc"));
    const unsubscribeWeeklySchedule = onSnapshot(qWeeklySchedule, (snapshot) => {
      const wsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWeeklySchedule(wsList);
    });
    
    // Check daily report status on component load
    checkDailyReportStatus();

    return () => {
      unsubscribeNotifications();
      unsubscribeQuestions();
      unsubscribeUserRecords();
      unsubscribeWeeklySchedule();
    };
  }, [userId]);

  const handleStartTest = () => {
    if (isDailyReportSubmitted && isTestAvailable && !hasAttemptedTest) {
      setIsTestMode(true);
    }
  };

  const handleTestEnd = () => {
    setIsTestMode(false);
    // After test ends, check again to update the "hasAttemptedTest" state
    setHasAttemptedTest(true);
  };

  const handleDailyReportSubmit = async (data) => {
    if (!db || !userId) return;
    try {
      const dailyReportsCollection = collection(db, `artifacts/${appId}/public/data/daily_reports`);
      await addDoc(dailyReportsCollection, {
        userId,
        userName: user.displayName,
        date: today,
        physicsTopics: data.physicsTopics,
        chemistryTopics: data.chemistryTopics,
        mathTopics: data.mathTopics,
        createdAt: serverTimestamp(),
      });
      setIsDailyReportSubmitted(true);
      reportReset();
    } catch (e) {
      console.error("Error submitting daily report:", e);
    }
  };

  const sortedUserRecords = userRecords.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);

  if (isTestMode) {
    return <TestPage questions={questions} userId={userId} userName={user.displayName} onTestEnd={handleTestEnd} />;
  }
  
  const canStartTest = isDailyReportSubmitted && isTestAvailable && !hasAttemptedTest;

  return (
    <div className="p-8 bg-white min-h-screen rounded-2xl shadow-2xl">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-200">
        <h1 className="text-4xl font-extrabold text-indigo-700 flex items-center">
          <User className="mr-3 h-10 w-10 text-indigo-600" />
          Welcome, {user.displayName}!
        </h1>
        <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowWeeklyScheduleModal(true)}
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-600 transition duration-300 transform hover:scale-105"
            >
                <Calendar className="mr-2" size={18} />
                Weekly Schedule
            </button>
            <button
                onClick={onLogout}
                className="bg-red-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-red-600 transition duration-300 transform hover:scale-105"
            >
                Logout
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Test Section */}
        <div className="bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Take a Test</h2>
          {questions.length > 0 ? (
            <>
              <p className="text-gray-600 mb-4">There are {questions.length} questions ready. You must submit your daily report and wait for the test to become available.</p>
              <div className="mb-4 text-center">
                <p className={`font-semibold text-lg ${isTestAvailable ? 'text-green-600' : 'text-yellow-600'}`}>
                  {hasAttemptedTest ? "Test already attempted." : (testCountdown || (isTestAvailable ? 'Test is currently available!' : 'Waiting for test schedule...'))}
                </p>
              </div>
              <button
                onClick={handleStartTest}
                disabled={!canStartTest}
                className={`w-full py-3 rounded-xl font-bold text-lg transition duration-300 transform
                  ${canStartTest ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-105' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}
                `}
              >
                Start Test Now
              </button>
              {!isDailyReportSubmitted && (
                <p className="text-sm text-red-500 mt-2">You must submit your daily report to start the test.</p>
              )}
               {hasAttemptedTest && (
                <p className="text-sm text-red-500 mt-2">You have already completed this test and cannot re-attempt it.</p>
              )}
            </>
          ) : (
            <p className="text-gray-600">No questions have been added by the admin yet.</p>
          )}
        </div>
        
        {/* Daily Report Section */}
        <div className="bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Daily Report ({today})</h2>
            <form onSubmit={reportHandleSubmit(handleDailyReportSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Physics Topics Completed</label>
                    <input
                        type="text"
                        className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Kinematics, Dynamics"
                        disabled={isDailyReportSubmitted}
                        {...reportRegister("physicsTopics", { required: true })}
                    />
                    {reportErrors.physicsTopics && <span className="text-red-500 text-sm">Physics topics are required</span>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Chemistry Topics Completed</label>
                    <input
                        type="text"
                        className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Stoichiometry, Chemical Bonding"
                        disabled={isDailyReportSubmitted}
                        {...reportRegister("chemistryTopics", { required: true })}
                    />
                    {reportErrors.chemistryTopics && <span className="text-red-500 text-sm">Chemistry topics are required</span>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Math Topics Completed</label>
                    <input
                        type="text"
                        className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Calculus, Algebra"
                        disabled={isDailyReportSubmitted}
                        {...reportRegister("mathTopics", { required: true })}
                    />
                    {reportErrors.mathTopics && <span className="text-red-500 text-sm">Math topics are required</span>}
                </div>
                <button
                    type="submit"
                    disabled={isDailyReportSubmitted}
                    className={`w-full py-3 rounded-xl font-bold text-lg transition duration-300 transform
                        ${isDailyReportSubmitted ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105'}
                    `}
                >
                    {isDailyReportSubmitted ? 'Report Submitted' : 'Submit Daily Report'}
                </button>
            </form>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Your Daily Reports Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Daily Reports</h2>
            {/* The daily reports for the current user will be shown here. This requires a separate fetch or filtering from the main reports list. */}
        </div>
      </div>
      
      {/* Your Test Records Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Past Records</h2>
        {sortedUserRecords.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Taken</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedUserRecords.map((result, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.score} / {result.totalQuestions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.timeTaken} seconds</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${result.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.timestamp?.seconds * 1000).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">You have not taken any tests yet.</p>
        )}
      </div>
      
      {/* Raise a Query Section */}
      <div className="bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200 mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Raise a Query</h2>
        <p className="text-gray-600 mb-4">Have an issue with a question or a test? Let the admin know here.</p>
        <form onSubmit={queryHandleSubmit(handleQuerySubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Your Query</label>
                <textarea
                    className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows="4"
                    placeholder="Describe your issue here..."
                    {...queryRegister("queryText", { required: true })}
                ></textarea>
                {queryErrors.queryText && <span className="text-red-500 text-sm">Query content is required</span>}
            </div>
            <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
            >
                Submit Query
            </button>
        </form>
      </div>

      {/* Weekly Schedule Modal */}
      {showWeeklyScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl text-center max-w-xl w-full">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <h3 className="text-2xl font-bold text-indigo-700">Weekly Test Schedule</h3>
                    <button onClick={() => setShowWeeklyScheduleModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                        <X size={24} />
                    </button>
                </div>
                {weeklySchedule.length > 0 ? (
                    <ul className="space-y-4 text-left">
                        {weeklySchedule.map((item, index) => (
                            <li key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <p className="font-semibold text-lg text-gray-800">{item.title}</p>
                                <p className="text-gray-600">Topics: {item.topic}</p>
                                <p className="text-sm text-gray-500">Date: {item.date}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600">No weekly schedule has been set yet.</p>
                )}
            </div>
        </div>
      )}
    </div>
  );
}

// --- Test Interface Component ---
function TestPage({ questions, userId, userName, onTestEnd }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [questionStatus, setQuestionStatus] = useState({}); // New state to track status
  const [timer, setTimer] = useState(0);
  const [isExamCancelled, setIsExamCancelled] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // --- Exam Logic Effects ---
  useEffect(() => {
    document.documentElement.requestFullscreen();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        event.preventDefault();
        setShowExitModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => {
      document.exitFullscreen();
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const saveResult = async (status) => {
    if (!db) return;
    const score = questions.filter((q, i) => answers[i] === q.correctAnswer).length;

    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/results`), {
        userId,
        userName,
        score,
        totalQuestions: questions.length,
        timeTaken: timer,
        status,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error("Error saving result:", e);
    }
  };

  const handleOptionChange = (e) => {
    const newAnswers = { ...answers, [currentQuestionIndex]: e.target.value };
    setAnswers(newAnswers);
    // If an option is selected, mark it as attempted
    const newStatus = { ...questionStatus };
    const currentStatus = newStatus[currentQuestionIndex];
    if (currentStatus === 'marked_for_review' || currentStatus === 'attempted_and_marked') {
        newStatus[currentQuestionIndex] = 'attempted_and_marked';
    } else {
        newStatus[currentQuestionIndex] = 'attempted';
    }
    setQuestionStatus(newStatus);
  };
  
  const handleMarkForReview = () => {
    const newStatus = { ...questionStatus };
    // Check if an answer is selected
    if (answers[currentQuestionIndex]) {
        newStatus[currentQuestionIndex] = 'attempted_and_marked';
    } else {
        newStatus[currentQuestionIndex] = 'marked_for_review';
    }
    setQuestionStatus(newStatus);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitTest = () => {
    saveResult('completed');
    onTestEnd();
  };

  const handleCancelExam = () => {
    setIsExamCancelled(true);
    saveResult('cancelled');
    onTestEnd();
  };

  if (isExamCancelled) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl text-center max-w-lg">
          <h2 className="text-3xl font-extrabold text-red-600 mb-4">Exam Cancelled!</h2>
          <p className="text-lg text-gray-700">You have exited the exam by pressing the Escape key. Your test has been submitted with the current progress.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition duration-300"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  if (showExitModal) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl text-center max-w-md">
                <h3 className="text-2xl font-bold text-red-600 mb-4">Warning: Exam Cancellation</h3>
                <p className="text-lg text-gray-700 mb-6">
                    Pressing the Escape key will cancel your exam and submit your current progress. Do you wish to proceed?
                </p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={handleCancelExam}
                        className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition duration-300 transform hover:scale-105"
                    >
                        Yes, Cancel Exam
                    </button>
                    <button
                        onClick={() => setShowExitModal(false)}
                        className="bg-gray-300 text-gray-800 px-6 py-3 rounded-xl font-bold hover:bg-gray-400 transition duration-300 transform hover:scale-105"
                    >
                        No, Continue Test
                    </button>
                </div>
            </div>
        </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  const getQuestionButtonClass = (index) => {
    // Current question always has a specific style
    if (index === currentQuestionIndex) {
      return 'bg-indigo-600 text-white';
    }

    // Status-based colors
    const status = questionStatus[index];
    switch (status) {
      case 'attempted':
        return 'bg-green-500 text-white';
      case 'marked_for_review':
        return 'bg-purple-500 text-white';
      case 'attempted_and_marked':
        return 'bg-pink-500 text-white';
      default:
        return 'bg-red-500 text-white'; // Unattempted
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 text-gray-800">
      <div className="bg-indigo-700 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold">NTA JEE Mock Test</h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-indigo-600 px-4 py-2 rounded-full font-semibold">
            <Clock className="mr-2" size={20} />
            Time Elapsed: {formattedTime}
          </div>
          <div className="bg-indigo-600 px-4 py-2 rounded-full font-semibold">
            Questions: {currentQuestionIndex + 1} / {questions.length}
          </div>
        </div>
      </div>

      <div className="flex flex-grow overflow-hidden">
        <div className="flex-grow p-8 flex flex-col bg-white overflow-y-auto">
          <div className="flex-grow bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Question {currentQuestionIndex + 1}:</h2>
            <p className="text-lg">{currentQuestion.questionText}</p>
            <div className="mt-6 space-y-4">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="flex items-center p-4 bg-white rounded-xl shadow-sm cursor-pointer hover:bg-gray-100 transition duration-200">
                  <input
                    type="radio"
                    name="currentQuestion"
                    value={option}
                    checked={answers[currentQuestionIndex] === option}
                    onChange={handleOptionChange}
                    className="form-radio h-5 w-5 text-indigo-600"
                  />
                  <span className="ml-3 text-lg text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mt-8 space-x-4">
            <button
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 bg-gray-300 text-gray-800 rounded-xl font-bold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400"
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentQuestionIndex === questions.length - 1}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700"
            >
              Next
            </button>
          </div>
        </div>

        <div className="w-1/4 bg-gray-200 p-6 flex flex-col items-center">
          <div className="bg-white p-4 rounded-2xl shadow-lg text-center mb-6 w-full">
            <h3 className="font-bold text-xl mb-2">Question Palette</h3>
            <div className="grid grid-cols-5 gap-3">
              {questions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`p-3 rounded-xl font-bold transition-colors duration-200
                    ${getQuestionButtonClass(index)}
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
          
          <button
            onClick={handleMarkForReview}
            className="w-full bg-purple-500 text-white py-3 rounded-xl font-bold text-lg hover:bg-purple-600 transition duration-300 transform hover:scale-105 mb-4"
          >
            Mark for Review
          </button>
          
          <button
            onClick={handleSubmitTest}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-700 transition duration-300 transform hover:scale-105"
          >
            Submit Test
          </button>
        </div>
      </div>
    </div>
  );
}
export default App;
