import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, onSnapshot, collection, query, orderBy, serverTimestamp, getDocs, where, updateDoc, getDoc } from 'firebase/firestore';
import { useForm } from "react-hook-form";
import { X, User, Shield, CheckCircle, Clock, Calendar, MessageCircle, Loader2, Send, FileText } from 'lucide-react';

// --- Firebase Initialization ---
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
  const [view, setView] = useState('login'); // 'login', 'admin', 'student', 'query_chat', 'test_results'
  const [activeQuery, setActiveQuery] = useState(null);
  const [activeResult, setActiveResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    const adminPassword = 'Air1';

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

  const handleOpenQueryChat = (query) => {
    setActiveQuery(query);
    setView('query_chat');
  };
  
  const handleOpenTestResults = (result) => {
    setActiveResult(result);
    setView('test_results');
  };

  const handleCloseQueryChat = () => {
    setActiveQuery(null);
    setView(user.uid === 'admin' ? 'admin' : 'student');
  };

  const handleCloseTestResults = () => {
    setActiveResult(null);
    setView(user.uid === 'admin' ? 'admin' : 'student');
  };

  const [showLoginError, setShowLoginError] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-xl font-semibold text-gray-200">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 font-sans antialiased text-white p-4">
      {view === 'login' && <LoginPage onLogin={handleLogin} showLoginError={showLoginError} setShowLoginError={setShowLoginError} />}
      {view === 'admin' && <AdminPage userId={userId} onLogout={handleLogout} onOpenQueryChat={handleOpenQueryChat} onOpenTestResults={handleOpenTestResults} />}
      {view === 'student' && <StudentPage userId={userId} user={user} onLogout={handleLogout} onOpenTestResults={handleOpenTestResults} />}
      {view === 'query_chat' && <QueryChatPage userId={userId} user={user} query={activeQuery} onClose={handleCloseQueryChat} />}
      {view === 'test_results' && <TestResultPage result={activeResult} onClose={handleCloseTestResults} />}
    </div>
  );
}

// --- Login Page Component ---
function LoginPage({ onLogin, showLoginError, setShowLoginError }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const onSubmit = data => onLogin(data.name, data.password);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 p-4">
      <div className="bg-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl w-full max-w-md text-center text-white">
        <h2 className="text-3xl font-extrabold text-white mb-6">Welcome to the Exam Portal</h2>
        <p className="text-gray-300 mb-8">Please login with your credentials to begin your test.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <select
              className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
              {...register("name", { required: true })}
            >
              <option value="">Select User</option>
              <option value="Admin">Admin</option>
              <option value="Utkarsha">Utkarsha</option>
              <option value="Prankur">Prankur</option>
            </select>
            {errors.name && <span className="text-red-400 text-sm mt-1 block">User selection is required</span>}
          </div>
          <div>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
              {...register("password", { required: true })}
            />
            {errors.password && <span className="text-red-400 text-sm mt-1 block">Password is required</span>}
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
          <div className="bg-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl text-center max-w-sm text-white">
            <h3 className="text-2xl font-bold text-red-500 mb-4">Login Failed</h3>
            <p className="text-lg text-gray-300 mb-6">Incorrect username or password. Please try again.</p>
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
function AdminPage({ onLogout, onOpenQueryChat, onOpenTestResults }) {
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [testQueries, setTestQueries] = useState([]);

  const { register: testRegister, handleSubmit: testHandleSubmit, reset: testReset, formState: { errors: testErrors } } = useForm();
  const { register: bulkQRegister, handleSubmit: bulkQHandleSubmit, reset: bulkQReset, formState: { errors: bulkQErrors } } = useForm();
  const { register: nRegister, handleSubmit: nHandleSubmit, reset: nReset, formState: { errors: nErrors } } = useForm();
  
  useEffect(() => {
    if (!db) return;
    const qTests = query(collection(db, `artifacts/${appId}/public/data/tests`), orderBy("testDate", "desc"));
    const unsubscribeTests = onSnapshot(qTests, (snapshot) => {
      const tList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTests(tList);
    });

    const qQuestions = query(collection(db, `artifacts/${appId}/public/data/questions`));
    const unsubscribeQuestions = onSnapshot(qQuestions, (snapshot) => {
      const qList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(qList);
    });

    const qResults = query(collection(db, `artifacts/${appId}/public/data/results`));
    const unsubscribeResults = onSnapshot(qResults, (snapshot) => {
      const rList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setResults(rList);
    });

    const qDailyReports = query(collection(db, `artifacts/${appId}/public/data/daily_reports`), orderBy("createdAt", "desc"));
    const unsubscribeDailyReports = onSnapshot(qDailyReports, (snapshot) => {
        const drList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDailyReports(drList);
    });
    
    const qTestQueries = query(collection(db, `artifacts/${appId}/public/data/test_queries`), orderBy("createdAt", "desc"));
    const unsubscribeTestQueries = onSnapshot(qTestQueries, (snapshot) => {
        const tqList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTestQueries(tqList);
    });

    const qNotifications = query(collection(db, `artifacts/${appId}/public/data/notifications`), orderBy("createdAt", "desc"));
    const unsubscribeNotifications = onSnapshot(qNotifications, (snapshot) => {
      const nList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(nList);
    });

    return () => {
      unsubscribeTests();
      unsubscribeQuestions();
      unsubscribeResults();
      unsubscribeDailyReports();
      unsubscribeTestQueries();
      unsubscribeNotifications();
    };
  }, []);

  const handleCreateTest = async (data) => {
    if (!db) return;
    try {
        const testDateTime = new Date(`${data.testDate}T${data.testTime}`);
        const testRef = collection(db, `artifacts/${appId}/public/data/tests`);
        await addDoc(testRef, {
            testTitle: data.testTitle,
            testDate: testDateTime,
            duration: 60,
            createdAt: serverTimestamp(),
        });
        testReset();
    } catch (e) {
        console.error("Error creating test:", e);
    }
  };
  
  const handleBulkQuestionUpload = async (data) => {
    if (!db) return;
    try {
      const questionsToUpload = JSON.parse(data.questionsJson);
      if (!Array.isArray(questionsToUpload)) {
        throw new Error("Invalid JSON format. Expected an array of questions.");
      }
      
      const questionsCollection = collection(db, `artifacts/${appId}/public/data/questions`);
      for (const question of questionsToUpload) {
        await addDoc(questionsCollection, {
          testId: data.testId,
          subject: data.subject, // Include subject in the question data
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
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
  
  const unresolvedQueriesCount = testQueries.filter(q => !q.resolved).length;
  const sortedResults = results.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
  const sortedDailyReports = dailyReports.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

  return (
    <div className="p-8 bg-gray-800 min-h-screen rounded-2xl shadow-2xl text-white">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-700">
        <h1 className="text-4xl font-extrabold text-indigo-400 flex items-center">
          <Shield className="mr-3 h-10 w-10 text-indigo-400" />
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
        <div className="bg-gray-700 p-6 rounded-2xl shadow-lg border border-gray-600">
          <h2 className="text-2xl font-bold text-gray-200 mb-4">Create New Test</h2>
          <form onSubmit={testHandleSubmit(handleCreateTest)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200">Test Title</label>
              <input
                type="text"
                className="w-full mt-1 p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...testRegister("testTitle", { required: true })}
              />
              {testErrors.testTitle && <span className="text-red-400 text-sm">Test title is required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">Test Date</label>
              <input
                type="date"
                className="w-full mt-1 p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...testRegister("testDate", { required: true })}
              />
              {testErrors.testDate && <span className="text-red-400 text-sm">Test date is required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">Test Time</label>
              <input
                type="time"
                className="w-full mt-1 p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...testRegister("testTime", { required: true })}
              />
              {testErrors.testTime && <span className="text-red-400 text-sm">Test time is required</span>}
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
            >
              Create Test
            </button>
          </form>
        </div>

        <div className="bg-gray-700 p-6 rounded-2xl shadow-lg border border-gray-600">
          <h2 className="text-2xl font-bold text-gray-200 mb-4">Bulk Question Upload</h2>
          <p className="text-gray-400 mb-4">
            Upload questions for an existing test using its ID.
            <code className="block bg-gray-600 p-2 my-2 rounded-lg text-sm text-gray-200">
              {`[{ "questionText": "Q1...", "options": ["A", "B"], "correctAnswer": "A", "subject": "Physics" }]`}
            </code>
          </p>
          <form onSubmit={bulkQHandleSubmit(handleBulkQuestionUpload)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-200">Test ID</label>
              <input
                type="text"
                className="w-full mt-1 p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter Test ID to associate questions"
                {...bulkQRegister("testId", { required: true })}
              />
              {bulkQErrors.testId && <span className="text-red-400 text-sm">Test ID is required</span>}
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-200">Subject for questions</label>
              <select
                className="w-full mt-1 p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                {...bulkQRegister("subject", { required: true })}
              >
                  <option value="">Select Subject</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Math">Math</option>
              </select>
              {bulkQErrors.subject && <span className="text-red-400 text-sm">Subject is required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200">Questions JSON</label>
              <textarea
                className="w-full mt-1 p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                rows="8"
                {...bulkQRegister("questionsJson", { required: true })}
              ></textarea>
              {bulkQErrors.questionsJson && <span className="text-red-400 text-sm">Questions JSON is required</span>}
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
            >
              Upload Questions
            </button>
          </form>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-700 p-6 rounded-2xl shadow-lg border border-gray-600">
          <h2 className="text-2xl font-bold text-gray-200 mb-4">Scheduled Tests</h2>
          {tests.length > 0 ? (
            <ul className="space-y-4">
              {tests.map(test => (
                <li key={test.id} className="bg-gray-800 p-4 rounded-xl shadow border border-gray-700">
                  <h3 className="font-semibold text-lg text-indigo-400">{test.testTitle}</h3>
                  <p className="text-gray-400">ID: {test.id}</p>
                  <p className="text-sm text-gray-500">Date: {test.testDate.toDate().toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">Time: {test.testDate.toDate().toLocaleTimeString()}</p>
                  <p className="text-sm text-gray-500">Duration: {test.duration} minutes</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No tests have been scheduled yet.</p>
          )}
        </div>
        <div className="bg-gray-700 p-6 rounded-2xl shadow-lg border border-gray-600">
          <h2 className="text-2xl font-bold text-gray-200 mb-4">Student Queries</h2>
          {testQueries.length > 0 ? (
            <ul className="space-y-4">
              {testQueries.map(query => (
                <li key={query.id} className={`p-4 rounded-xl shadow border border-gray-700 ${query.resolved ? 'bg-gray-700' : 'bg-red-900'}`}>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-white">{query.userName}</p>
                    {query.resolved ? (
                      <span className="text-sm text-green-400 font-bold">Resolved</span>
                    ) : (
                      <button
                        onClick={() => onOpenQueryChat(query)}
                        className="bg-green-500 text-white text-sm px-4 py-1 rounded-full hover:bg-green-600 transition"
                      >
                        Satisfy
                      </button>
                    )}
                  </div>
                  <p className="text-gray-300 mt-1">{query.queryText}</p>
                  <p className="text-sm text-gray-500 mt-2">Date: {new Date(query.createdAt?.seconds * 1000).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center py-4">No new student queries.</p>
          )}
        </div>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-gray-200 mb-4">Student Test Records</h2>
        {sortedResults.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Test Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {sortedResults.map((result, index) => {
                  const test = tests.find(t => t.id === result.testId);
                  const testTitle = test ? test.testTitle : result.testId;
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{result.userName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-400">{testTitle}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {result.score} / {result.totalQuestions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${result.status === 'completed' ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(result.timestamp?.seconds * 1000).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button onClick={() => onOpenTestResults(result)} className="text-indigo-400 hover:text-indigo-200">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">No test records available yet.</p>
        )}
      </div>

      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-gray-200 mb-4">Student Daily Reports</h2>
        {sortedDailyReports.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timetable</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Physics</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Chemistry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Math</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">File</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {sortedDailyReports.map((report, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{report.userName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{report.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{report.timetable || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{report.physicsTopics || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{report.chemistryTopics || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{report.mathTopics || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {report.fileUrl ? (
                        <a href={report.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                          View File
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">No daily reports available yet.</p>
        )}
      </div>
    </div>
  );
}

// --- Student Dashboard Component ---
function StudentPage({ userId, user, onLogout, onOpenTestResults }) {
  const [tests, setTests] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [userRecords, setUserRecords] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [isDailyReportSubmitted, setIsDailyReportSubmitted] = useState(false);
  const [showPendingReportWarning, setShowPendingReportWarning] = useState(false);
  const { register: reportRegister, handleSubmit: reportHandleSubmit, reset: reportReset, formState: { errors: reportErrors } } = useForm();
  const { register: queryRegister, handleSubmit: queryHandleSubmit, reset: queryReset, formState: { errors: queryErrors } } = useForm();
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSubmitMessage, setReportSubmitMessage] = useState('');
  const [activeTest, setActiveTest] = useState(null);
  
  const today = new Date().toISOString().slice(0, 10);
  const [showTestsModal, setShowTestsModal] = useState(false);

  const checkDailyReportStatus = async () => {
    if (!db) return;
    const reportRef = collection(db, `artifacts/${appId}/public/data/daily_reports`);
    const q = query(reportRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const todayReport = querySnapshot.docs.find(doc => doc.data().date === today);
    setIsDailyReportSubmitted(!!todayReport);
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

  useEffect(() => {
    const checkPendingReport = async () => {
      const now = new Date();
      const cutoffTime = new Date();
      cutoffTime.setHours(18, 0, 0, 0); // 6:00 PM
      if (now > cutoffTime && !isDailyReportSubmitted) {
        setShowPendingReportWarning(true);
      } else {
        setShowPendingReportWarning(false);
      }
    };
    
    checkDailyReportStatus().then(() => {
        checkPendingReport();
    });

    const interval = setInterval(checkPendingReport, 60000);
    return () => clearInterval(interval);
  }, [isDailyReportSubmitted]);
  
  useEffect(() => {
    if (!db || !userId) return;

    const qNotifications = query(collection(db, `artifacts/${appId}/public/data/notifications`), orderBy("createdAt", "desc"));
    const unsubscribeNotifications = onSnapshot(qNotifications, (snapshot) => {
      const nList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(nList);
    });

    const qTests = query(collection(db, `artifacts/${appId}/public/data/tests`), orderBy("testDate", "asc"));
    const unsubscribeTests = onSnapshot(qTests, (snapshot) => {
      const tList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTests(tList);
    });

    const qQuestions = query(collection(db, `artifacts/${appId}/public/data/questions`));
    const unsubscribeQuestions = onSnapshot(qQuestions, (snapshot) => {
        const qList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setQuestions(qList);
    });

    const qUserRecords = query(collection(db, `artifacts/${appId}/public/data/results`), where("userId", "==", userId));
    const unsubscribeUserRecords = onSnapshot(qUserRecords, (snapshot) => {
      const records = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }));
      setUserRecords(records);
    });

    const qDailyReports = query(collection(db, `artifacts/${appId}/public/data/daily_reports`), where("userId", "==", userId), orderBy("createdAt", "desc"));
    const unsubscribeDailyReports = onSnapshot(qDailyReports, (snapshot) => {
      const drList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDailyReports(drList);
    });
    
    checkDailyReportStatus();

    return () => {
      unsubscribeNotifications();
      unsubscribeTests();
      unsubscribeQuestions();
      unsubscribeUserRecords();
      unsubscribeDailyReports();
    };
  }, [userId]);

  const handleStartTest = (testId) => {
    const testQuestions = questions.filter(q => q.testId === testId);
    if (testQuestions.length > 0) {
      setActiveTest({
          id: testId,
          questions: testQuestions,
      });
    }
  };

  const handleTestEnd = () => {
    setActiveTest(null);
  };

  const handleDailyReportSubmit = async (data) => {
    if (!db || !userId) return;
    setIsSubmittingReport(true);
    setReportSubmitMessage('Submitting...');

    const file = data.file[0];
    const fileName = file ? file.name : null;
    const fileUrl = file ? `mock-url/${fileName}` : null;
    
    try {
      const dailyReportsCollection = collection(db, `artifacts/${appId}/public/data/daily_reports`);
      await addDoc(dailyReportsCollection, {
        userId,
        userName: user.displayName,
        date: today,
        timetable: data.timetable,
        physicsTopics: data.physicsTopics,
        chemistryTopics: data.chemistryTopics,
        mathTopics: data.mathTopics,
        fileName: fileName,
        fileUrl: fileUrl,
        createdAt: serverTimestamp(),
      });
      setIsDailyReportSubmitted(true);
      reportReset();
      setReportSubmitMessage('Submitted successfully!');
      setTimeout(() => setReportSubmitMessage(''), 3000);
    } catch (e) {
      console.error("Error submitting daily report:", e);
      setReportSubmitMessage('Submission failed. Please try again.');
      setTimeout(() => setReportSubmitMessage(''), 3000);
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const sortedUserRecords = userRecords.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
  const sortedDailyReports = dailyReports.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

  if (activeTest) {
    return <TestPage questions={activeTest.questions} testId={activeTest.id} userId={userId} userName={user.displayName} onTestEnd={handleTestEnd} />;
  }
  
  const hasAttemptedTest = (testId) => {
    return userRecords.some(record => record.testId === testId && record.status === 'completed');
  };

  return (
    <div className="p-8 bg-gray-800 min-h-screen rounded-2xl shadow-2xl text-white">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-700">
        <h1 className="text-4xl font-extrabold text-indigo-400 flex items-center">
          <User className="mr-3 h-10 w-10 text-indigo-400" />
          Welcome, {user.displayName}!
        </h1>
        <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowTestsModal(true)}
              className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-600 transition duration-300 transform hover:scale-105"
            >
                <Calendar className="mr-2" size={18} />
                Test Schedules
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
        {/* Daily Report Section */}
        <div className="bg-gray-700 p-6 rounded-2xl shadow-lg border border-gray-600">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-200">Daily Report ({today})</h2>
                {showPendingReportWarning && !isDailyReportSubmitted && (
                    <span className="text-sm text-red-400 font-bold bg-red-900 px-3 py-1 rounded-full">Pending</span>
                )}
            </div>
            <form onSubmit={reportHandleSubmit(handleDailyReportSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-200">Daily Timetable</label>
                    <textarea
                        className="w-full mt-1 p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows="4"
                        placeholder="e.g., 9:00 AM - 1:00 PM: Physics Lectures, 2:00 PM - 5:00 PM: Chemistry DPP"
                        disabled={isDailyReportSubmitted || isSubmittingReport}
                        {...reportRegister("timetable", { required: true })}
                    ></textarea>
                    {reportErrors.timetable && <span className="text-red-400 text-sm">Timetable is required</span>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-200">Physics Topics Completed</label>
                    <input
                        type="text"
                        className="w-full mt-1 p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Kinematics, Dynamics"
                        disabled={isDailyReportSubmitted || isSubmittingReport}
                        {...reportRegister("physicsTopics", { required: true })}
                    />
                    {reportErrors.physicsTopics && <span className="text-red-400 text-sm">Physics topics are required</span>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-200">Chemistry Topics Completed</label>
                    <input
                        type="text"
                        className="w-full mt-1 p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Stoichiometry, Chemical Bonding"
                        disabled={isDailyReportSubmitted || isSubmittingReport}
                        {...reportRegister("chemistryTopics", { required: true })}
                    />
                    {reportErrors.chemistryTopics && <span className="text-red-400 text-sm">Chemistry topics are required</span>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-200">Math Topics Completed</label>
                    <input
                        type="text"
                        className="w-full mt-1 p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Calculus, Algebra"
                        disabled={isDailyReportSubmitted || isSubmittingReport}
                        {...reportRegister("mathTopics", { required: true })}
                    />
                    {reportErrors.mathTopics && <span className="text-red-400 text-sm">Math topics are required</span>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-200">Upload PDF/Image</label>
                    <input
                        type="file"
                        className="w-full mt-1 text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500 file:text-white hover:file:bg-indigo-600"
                        accept=".pdf,image/*"
                        disabled={isDailyReportSubmitted || isSubmittingReport}
                        {...reportRegister("file")}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isDailyReportSubmitted || isSubmittingReport}
                    className={`w-full py-3 rounded-xl font-bold text-lg transition duration-300 transform
                        ${isSubmittingReport ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105'}
                    `}
                >
                    {isSubmittingReport ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="animate-spin mr-2" size={20} />
                        Submitting...
                      </span>
                    ) : 'Submit Daily Report'}
                </button>
            </form>
            {reportSubmitMessage && (
                <p className={`mt-4 text-center text-sm font-semibold ${reportSubmitMessage.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
                    {reportSubmitMessage}
                </p>
            )}
        </div>
        <div className="bg-gray-700 p-6 rounded-2xl shadow-lg border border-gray-600">
          <h2 className="text-2xl font-bold text-gray-200 mb-4">Notifications</h2>
          {notifications.length > 0 ? (
            <ul className="space-y-4">
              {notifications.map(n => (
                <li key={n.id} className="bg-gray-800 p-4 rounded-xl shadow border border-gray-700">
                  <h3 className="font-semibold text-lg text-indigo-400 flex items-center">
                    <CheckCircle className="mr-2 text-indigo-400" size={18} />
                    {n.title}
                  </h3>
                  <p className="text-gray-300 mt-1">{n.message}</p>
                  <p className="text-sm text-gray-500 mt-2">Date: {n.date}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No notifications at this time.</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
            <h2 className="text-2xl font-bold text-gray-200 mb-4">Your Daily Reports</h2>
            {sortedDailyReports.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Timetable</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Physics</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Chemistry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Math</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">File</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {sortedDailyReports.map((report, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{report.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{report.timetable || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{report.physicsTopics || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{report.chemistryTopics || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{report.mathTopics || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {report.fileUrl ? (
                            <a href={report.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                              View File
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No daily reports available yet.</p>
            )}
        </div>
        <div className="bg-gray-700 p-6 rounded-2xl shadow-lg border border-gray-600">
          <h2 className="text-2xl font-bold text-gray-200 mb-4">Raise a Query</h2>
          <p className="text-gray-400 mb-4">Have an issue with a question or a test? Let the admin know here.</p>
          <form onSubmit={queryHandleSubmit(handleQuerySubmit)} className="space-y-4">
              <div>
                  <label className="block text-sm font-medium text-gray-200">Your Query</label>
                  <textarea
                      className="w-full mt-1 p-3 border border-gray-600 bg-gray-800 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows="4"
                      placeholder="Describe your issue here..."
                      {...queryRegister("queryText", { required: true })}
                  ></textarea>
                  {queryErrors.queryText && <span className="text-red-400 text-sm">Query content is required</span>}
              </div>
              <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
              >
                  Submit Query
              </button>
          </form>
        </div>
      </div>
      
      <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-gray-200 mb-4">Your Past Records</h2>
        {sortedUserRecords.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Test Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time Taken</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {sortedUserRecords.map((result, index) => {
                  const test = tests.find(t => t.id === result.testId);
                  const testTitle = test ? test.testTitle : result.testId;
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{testTitle}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {result.score} / {result.totalQuestions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{result.timeTaken} seconds</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${result.status === 'completed' ? 'bg-green-700 text-green-100' : 'bg-red-700 text-red-100'}`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(result.timestamp?.seconds * 1000).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button onClick={() => onOpenTestResults(result)} className="text-indigo-400 hover:text-indigo-200">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">You have not taken any tests yet.</p>
        )}
      </div>

      <FloatingChatbox isDailyReportSubmitted={isDailyReportSubmitted} userId={userId} />
      
      {showTestsModal && (
        <TestsModal
          tests={tests}
          questions={questions}
          hasAttemptedTest={hasAttemptedTest}
          isDailyReportSubmitted={isDailyReportSubmitted}
          handleStartTest={(testId) => {
            handleStartTest(testId);
            setShowTestsModal(false);
          }}
          onClose={() => setShowTestsModal(false)}
        />
      )}
    </div>
  );
}

function TestsModal({ tests, questions, hasAttemptedTest, isDailyReportSubmitted, handleStartTest, onClose }) {
    const [testError, setTestError] = useState(null);

    const handleStartTestClick = (testId) => {
        const testQuestions = questions.filter(q => q.testId === testId);
        if (testQuestions.length === 0) {
            setTestError("No questions have been uploaded for this test yet. Please contact the admin.");
            setTimeout(() => setTestError(null), 5000);
            return;
        }
        handleStartTest(testId);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl text-center max-w-xl w-full text-white">
                <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-700">
                    <h3 className="text-2xl font-bold text-indigo-400">Test Schedules</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-200 transition">
                        <X size={24} />
                    </button>
                </div>
                {testError && (
                    <div className="bg-red-900 text-red-400 p-3 rounded-xl mb-4">
                        <p>{testError}</p>
                    </div>
                )}
                <p className="text-gray-400 text-left mb-4">You must submit your daily report to become eligible to start a test.</p>
                {tests.length > 0 ? (
                    <ul className="space-y-4 max-h-96 overflow-y-auto">
                        {tests.map(test => {
                          const testDate = test.testDate.toDate();
                          const now = new Date();
                          const hasAttempted = hasAttemptedTest(test.id);
                          const isPastTest = now > testDate;
                          const gracePeriodEnd = testDate.getTime() + (24 * 60 * 60 * 1000);
                          const isGracePeriodOver = now.getTime() >= gracePeriodEnd;
                          const canStartTest = isDailyReportSubmitted && !hasAttempted && (isPastTest || (now >= testDate && now < gracePeriodEnd));
                          
                          let statusText = 'Upcoming';
                          if (isPastTest && !isGracePeriodOver) {
                            statusText = 'Grace Period';
                          } else if (isPastTest && isGracePeriodOver) {
                            statusText = 'Late Attempt';
                          } else if (now >= testDate && now < gracePeriodEnd) {
                            statusText = 'Available';
                          }
                          
                          const statusClass = statusText === 'Available' || statusText === 'Late Attempt' ? 'bg-green-700 text-green-100' : 
                                                statusText === 'Completed' ? 'bg-green-900 text-green-100' :
                                                statusText === 'Missed' ? 'bg-red-900 text-red-100' :
                                                'bg-yellow-700 text-yellow-100';

                          return (
                            <li key={test.id} className="bg-gray-700 p-4 rounded-xl shadow border border-gray-600">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-semibold text-lg text-indigo-400">{test.testTitle}</h3>
                                    <span className={`px-3 py-1 rounded-full font-semibold text-sm ${statusClass}`}>
                                      {statusText}
                                    </span>
                                </div>
                                <p className="text-gray-400">Date: {testDate.toLocaleDateString()}</p>
                                <p className="text-gray-400">Time: {testDate.toLocaleTimeString()}</p>
                                <button
                                    onClick={() => handleStartTestClick(test.id)}
                                    disabled={!canStartTest}
                                    className={`w-full mt-4 py-3 rounded-xl font-bold text-lg transition duration-300 transform
                                    ${canStartTest ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-105' : 'bg-gray-400 text-gray-700 cursor-not-allowed'}
                                    `}
                                >
                                    {hasAttempted ? 'Test Already Completed' : 'Start Test Now'}
                                </button>
                                {!isDailyReportSubmitted && (
                                  <p className="text-sm text-red-400 mt-2 text-center">Submit your daily report to become eligible.</p>
                                )}
                            </li>
                          );
                        })}
                    </ul>
                ) : (
                    <p className="text-gray-400">No tests have been scheduled yet.</p>
                )}
            </div>
        </div>
    );
}

function QueryChatPage({ userId, user, query, onClose }) {
  const [messages, setMessages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (!db || !query?.id) return;
    const qMessages = query(collection(db, `artifacts/${appId}/public/data/test_queries/${query.id}/messages`), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(qMessages, (snapshot) => {
      const msgList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgList);
    });
    return () => unsubscribe();
  }, [query?.id]);

  const handleSendMessage = async (data) => {
    if (!db || !data.messageText) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/test_queries/${query.id}/messages`), {
        senderId: userId,
        senderName: user.displayName,
        messageText: data.messageText,
        createdAt: serverTimestamp(),
      });
      reset();
    } catch (e) {
      console.error("Error sending message:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsSatisfied = async () => {
    if (!db || !query?.id) return;
    try {
      const queryRef = doc(db, `artifacts/${appId}/public/data/test_queries`, query.id);
      await updateDoc(queryRef, {
        resolved: true,
        resolvedAt: serverTimestamp(),
      });
      onClose();
    } catch (e) {
      console.error("Error marking as satisfied:", e);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-white p-4 flex flex-col z-50">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
        <h3 className="text-2xl font-bold text-indigo-400">Chat with {query.userName}</h3>
        <div className="flex items-center space-x-2">
            {!query.resolved && user.uid === 'admin' && (
                <button
                    onClick={handleMarkAsSatisfied}
                    className="bg-green-500 text-white text-sm px-4 py-2 rounded-xl font-bold hover:bg-green-600 transition"
                >
                    Mark as Satisfied
                </button>
            )}
            <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200 transition bg-gray-700 p-2 rounded-full"
            >
                <X size={24} />
            </button>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto space-y-4 p-4 bg-gray-800 rounded-xl">
        <div className={`p-4 rounded-xl border border-gray-700 self-start`}>
          <p className="font-semibold text-gray-200">Initial Query from {query.userName}:</p>
          <p className="text-gray-400 mt-1">{query.queryText}</p>
          <p className="text-sm text-gray-500 mt-2">Date: {new Date(query.createdAt?.seconds * 1000).toLocaleString()}</p>
        </div>
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`p-4 rounded-xl shadow-md max-w-2/3 ${msg.senderId === userId ? 'ml-auto bg-blue-900 text-white' : 'mr-auto bg-gray-700 text-gray-200'}`}
          >
            <p className="font-semibold">{msg.senderName}</p>
            <p className="mt-1">{msg.messageText}</p>
            <p className="text-right text-xs text-gray-400 mt-2">{new Date(msg.createdAt?.seconds * 1000).toLocaleTimeString()}</p>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit(handleSendMessage)} className="mt-6 flex space-x-2">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-grow p-3 rounded-xl bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isSubmitting || query.resolved}
          {...register("messageText", { required: true })}
        />
        <button
          type="submit"
          disabled={isSubmitting || query.resolved}
          className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={24} />
        </button>
      </form>
    </div>
  );
}

function TestPage({ questions, testId, userId, userName, onTestEnd }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timePerQuestion, setTimePerQuestion] = useState({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionStatus, setQuestionStatus] = useState({});
  const [timer, setTimer] = useState(3600);
  const [isExamCancelled, setIsExamCancelled] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSubmittingTest, setIsSubmittingTest] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    document.documentElement.requestFullscreen();
    setQuestionStartTime(Date.now());

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' || event.keyCode === 27) {
        event.preventDefault();
        setShowExitModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          saveResult('completed');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      document.exitFullscreen();
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const updateTimePerQuestion = (index) => {
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    setTimePerQuestion(prev => ({
        ...prev,
        [index]: (prev[index] || 0) + timeTaken,
    }));
    setQuestionStartTime(Date.now());
  };

  const saveResult = async (status) => {
    if (!db) return;
    setIsSubmittingTest(true);
    setSubmitMessage('Submitting test data...');
    const score = questions.filter((q, i) => answers[i] === q.correctAnswer).length;

    try {
      const detailedAnswers = questions.map((q, i) => ({
        questionId: q.id,
        userAnswer: answers[i] || null,
        correctAnswer: q.correctAnswer,
        timeTaken: timePerQuestion[i] || 0,
      }));

      await addDoc(collection(db, `artifacts/${appId}/public/data/results`), {
        userId,
        userName,
        testId,
        score,
        totalQuestions: questions.length,
        timeTaken: 3600 - timer,
        status,
        detailedAnswers,
        timestamp: serverTimestamp(),
      });
      setSubmitMessage('Test submitted successfully!');
    } catch (e) {
      console.error("Error saving result:", e);
      setSubmitMessage('Submission failed. Please try again.');
    } finally {
      setTimeout(() => onTestEnd(), 3000);
    }
  };

  const handleOptionChange = (e) => {
    const newAnswers = { ...answers, [currentQuestionIndex]: e.target.value };
    setAnswers(newAnswers);
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
    if (answers[currentQuestionIndex]) {
        newStatus[currentQuestionIndex] = 'attempted_and_marked';
    } else {
        newStatus[currentQuestionIndex] = 'marked_for_review';
    }
    setQuestionStatus(newStatus);
  };

  const handleNext = () => {
    updateTimePerQuestion(currentQuestionIndex);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    updateTimePerQuestion(currentQuestionIndex);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitTest = () => {
    updateTimePerQuestion(currentQuestionIndex);
    saveResult('completed');
  };

  const handleCancelExam = () => {
    setIsExamCancelled(true);
    updateTimePerQuestion(currentQuestionIndex);
    saveResult('cancelled');
  };
  
  if (isSubmittingTest) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl text-center max-w-lg">
                <h2 className="text-3xl font-extrabold text-white mb-4">
                    <Loader2 className="animate-spin inline-block mr-2" size={32} />
                    {submitMessage}
                </h2>
                <p className="text-lg text-gray-300">Please wait, your test results are being saved.</p>
            </div>
        </div>
    );
  }

  if (isExamCancelled) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
        <div className="bg-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl text-center max-w-lg">
          <h2 className="text-3xl font-extrabold text-red-500 mb-4">Exam Cancelled!</h2>
          <p className="text-lg text-gray-300">You have exited the exam by pressing the Escape key. Your test has been submitted with the current progress.</p>
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
            <div className="bg-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl text-center max-w-md text-white">
                <h3 className="text-2xl font-bold text-red-500 mb-4">Warning: Exam Cancellation</h3>
                <p className="text-lg text-gray-300 mb-6">
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
                        className="bg-gray-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-700 transition duration-300 transform hover:scale-105"
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
    if (index === currentQuestionIndex) {
      return 'bg-indigo-400 text-white';
    }

    const status = questionStatus[index];
    switch (status) {
      case 'attempted':
        return 'bg-green-500 text-white';
      case 'marked_for_review':
        return 'bg-purple-500 text-white';
      case 'attempted_and_marked':
        return 'bg-pink-500 text-white';
      default:
        return 'bg-red-500 text-white';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-200">
      <div className="flex justify-between items-center p-4 bg-gray-900 text-white shadow-lg border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <img src="https://placehold.co/40x40/fff/000?text=Logo" alt="NTA Logo" className="h-10 w-10" />
          <div className="text-lg font-bold">राष्ट्रीय परीक्षा एजेंसी <br /> National Testing Agency</div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-gray-800 px-3 py-1 rounded-full text-sm">
            <Clock className="mr-2" size={16} />
            Remaining Time: {formattedTime}
          </div>
          <div className="flex items-center space-x-2">
            <img src="https://placehold.co/40x40/fff/000?text=P" alt="Profile" className="h-10 w-10 rounded-full" />
            <span className="font-semibold text-sm">{userName}</span>
          </div>
          <button onClick={() => window.location.reload()} className="bg-red-600 text-white px-3 py-1 rounded-xl text-sm hover:bg-red-700 transition">
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-grow bg-gray-900 text-gray-200">
        <div className="flex-grow p-8 flex flex-col">
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-2xl shadow-lg border border-gray-700 mb-4">
            <div className="flex items-center space-x-4">
              <img src="https://placehold.co/40x40/8e54e9/fff?text=P" alt="Candidate" className="h-12 w-12 rounded-full" />
              <div>
                <p className="font-semibold text-gray-200">Candidate Name: {userName}</p>
                <p className="text-sm text-gray-400">Exam Name: {testId}</p>
              </div>
            </div>
          </div>
          <div className="flex-grow bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 mb-4">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
              <h2 className="text-xl font-bold text-gray-200">Question {currentQuestionIndex + 1}:</h2>
              <button className="text-gray-400 hover:text-white transition">
                <FileText size={20} />
              </button>
            </div>
            <p className="text-lg text-gray-200 mb-6">{currentQuestion.questionText}</p>
            <div className="mt-6 space-y-4">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="flex items-center p-4 bg-gray-900 rounded-xl shadow-sm cursor-pointer hover:bg-gray-700 transition duration-200">
                  <input
                    type="radio"
                    name="currentQuestion"
                    value={option}
                    checked={answers[currentQuestionIndex] === option}
                    onChange={handleOptionChange}
                    className="form-radio h-5 w-5 text-indigo-400"
                  />
                  <span className="ml-3 text-lg text-gray-200">{option}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-start space-x-4 mt-4">
              <button onClick={() => { updateTimePerQuestion(currentQuestionIndex); handleNext(); }} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold transition duration-300 hover:bg-green-700">SAVE & NEXT</button>
              <button className="bg-gray-600 text-white px-6 py-3 rounded-xl font-bold transition duration-300 hover:bg-gray-700">CLEAR</button>
              <button onClick={() => { handleMarkForReview(); handleNext(); }} className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold transition duration-300 hover:bg-orange-600">SAVE & MARK FOR REVIEW</button>
          </div>
        </div>

        <div className="w-1/4 p-6 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
          <div className="bg-gray-700 p-4 rounded-xl shadow-md mb-6">
            <h3 className="font-bold text-lg mb-2">Question Status</h3>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
              <div className="flex items-center">
                <span className="w-4 h-4 bg-red-500 rounded-full mr-2"></span> Not Answered
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span> Answered
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 bg-purple-500 rounded-full mr-2"></span> Marked for Review
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 bg-pink-500 rounded-full mr-2"></span> Answered & Marked for Review
              </div>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-2xl shadow-lg text-center mb-6">
            <h3 className="font-bold text-xl mb-2 text-gray-200">Question Palette</h3>
            <div className="grid grid-cols-5 gap-3">
              {questions.map((q, index) => (
                <button
                  key={index}
                  onClick={() => {
                    updateTimePerQuestion(currentQuestionIndex);
                    setCurrentQuestionIndex(index);
                  }}
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
            onClick={handleSubmitTest}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-green-700 transition duration-300 transform hover:scale-105"
          >
            Submit Test
          </button>
        </div>
      </div>
      
      {isSubmittingTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl text-center max-w-lg">
                <h2 className="text-3xl font-extrabold text-white mb-4">
                    <Loader2 className="animate-spin inline-block mr-2" size={32} />
                    {submitMessage}
                </h2>
                <p className="text-lg text-gray-300">Please wait, your test results are being saved.</p>
            </div>
        </div>
      )}

      {isExamCancelled && (
        <div className="fixed inset-0 bg-gray-900 text-white p-4 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl text-center max-w-lg">
            <h2 className="text-3xl font-extrabold text-red-500 mb-4">Exam Cancelled!</h2>
            <p className="text-lg text-gray-300">You have exited the exam by pressing the Escape key. Your test has been submitted with the current progress.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition duration-300"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
      
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 p-8 md:p-12 rounded-2xl shadow-2xl text-center max-w-md text-white">
                <h3 className="text-2xl font-bold text-red-500 mb-4">Warning: Exam Cancellation</h3>
                <p className="text-lg text-gray-300 mb-6">
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
                        className="bg-gray-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-700 transition duration-300 transform hover:scale-105"
                    >
                        No, Continue Test
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

function TestResultPage({ result, onClose }) {
    const [questions, setQuestions] = useState([]);
    const [testTitle, setTestTitle] = useState('');

    useEffect(() => {
        if (!db || !result?.testId) return;

        const q = query(collection(db, `artifacts/${appId}/public/data/questions`), where("testId", "==", result.testId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const qList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setQuestions(qList);
        });

        const testDocRef = doc(db, `artifacts/${appId}/public/data/tests`, result.testId);
        getDoc(testDocRef).then((docSnap) => {
          if (docSnap.exists()) {
            setTestTitle(docSnap.data().testTitle);
          }
        });

        return () => unsubscribe();
    }, [result]);

    if (!result || questions.length === 0) return null;
    
    const subjectAnalysis = {};
    questions.forEach((q, index) => {
      const subject = q.subject || 'Uncategorized';
      if (!subjectAnalysis[subject]) {
        subjectAnalysis[subject] = { total: 0, correct: 0, incorrect: 0, unattempted: 0 };
      }
      subjectAnalysis[subject].total++;
      
      const userAnswer = result.detailedAnswers.find(a => a.questionId === q.id)?.userAnswer;
      if (userAnswer) {
          if (userAnswer === q.correctAnswer) {
              subjectAnalysis[subject].correct++;
          } else {
              subjectAnalysis[subject].incorrect++;
          }
      } else {
          subjectAnalysis[subject].unattempted++;
      }
    });

    return (
        <div className="fixed inset-0 bg-gray-900 text-white p-4 flex flex-col z-50">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
                <h3 className="text-2xl font-bold text-indigo-400">Test Result: {testTitle || result.testId}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-200 transition bg-gray-700 p-2 rounded-full">
                    <X size={24} />
                </button>
            </div>
            <div className="mb-4">
                <p className="text-lg">Overall Score: <span className="font-semibold text-green-400">{result.score}</span> / {result.totalQuestions}</p>
                <p className="text-lg">Total Time Taken: <span className="font-semibold text-indigo-400">{result.timeTaken}</span> seconds</p>
            </div>
            
            <div className="bg-gray-700 p-6 rounded-2xl border border-gray-600 mb-6">
                <h4 className="text-xl font-bold mb-4">Subject-wise Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(subjectAnalysis).map(([subject, data]) => (
                        <div key={subject} className="bg-gray-800 p-4 rounded-xl border border-gray-600">
                            <h5 className="font-semibold text-lg text-indigo-400">{subject}</h5>
                            <p className="text-sm">Total Questions: {data.total}</p>
                            <p className="text-sm text-green-400">Correct: {data.correct}</p>
                            <p className="text-sm text-red-400">Incorrect: {data.incorrect}</p>
                            <p className="text-sm text-gray-400">Unattempted: {data.unattempted}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-grow overflow-y-auto space-y-8 p-4 bg-gray-800 rounded-xl">
                {result.detailedAnswers.map((answer, index) => {
                    const question = questions.find(q => q.id === answer.questionId);
                    const isCorrect = answer.userAnswer === answer.correctAnswer;
                    
                    return (
                        <div key={index} className="bg-gray-700 p-6 rounded-2xl border border-gray-600">
                            <h4 className="text-xl font-bold mb-2">Question {index + 1} ({question?.subject})</h4>
                            <p className="text-gray-200">{question?.questionText || 'Question not found'}</p>
                            <ul className="mt-4 space-y-2">
                                <li className={`p-2 rounded-lg ${isCorrect ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                    Your Answer: <span className="font-semibold">{answer.userAnswer || 'Not answered'}</span>
                                </li>
                                <li className="p-2 rounded-lg bg-gray-900 text-green-300">
                                    Correct Answer: <span className="font-semibold">{question?.correctAnswer || 'N/A'}</span>
                                </li>
                            </ul>
                            <p className="text-sm text-gray-400 mt-4">Time taken on this question: {answer.timeTaken} seconds</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function FloatingChatbox({ isDailyReportSubmitted, userId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [unresolvedQueries, setUnresolvedQueries] = useState(0);

  useEffect(() => {
    if (!db) return;
    if (userId === 'admin') {
      const q = query(collection(db, `artifacts/${appId}/public/data/test_queries`), where("resolved", "==", false));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setUnresolvedQueries(snapshot.size);
      });
      return () => unsubscribe();
    }
  }, [userId]);

  const toggleChatbox = () => setIsOpen(!isOpen);

  const getMessage = () => {
    if (userId === 'admin') {
      return unresolvedQueries === 0 ? 'No new queries' : `${unresolvedQueries} pending queries`;
    }
    return isDailyReportSubmitted ? 'Daily report submitted' : 'Daily report pending';
  };
  
  const getTypeClass = () => {
      if (userId === 'admin') {
          return unresolvedQueries > 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700';
      }
      return !isDailyReportSubmitted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700';
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={toggleChatbox}
        className={`flex items-center px-4 py-3 rounded-full shadow-lg text-white transition duration-300 ${getTypeClass()}`}
      >
        <MessageCircle size={24} className="mr-2" />
        <span className="font-semibold">{getMessage()}</span>
      </button>
    </div>
  );
}
export default App;
