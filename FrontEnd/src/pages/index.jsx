import Layout from "./Layout.jsx";

import Signin from "./Signin";

import Home from "./Home";

import Subjects from "./Subjects";

import AddQuestion from "./AddQuestion";

import Profile from "./Profile";

import ChangePassword from "./ChangePassword";

import RecoverPassword from "./RecoverPassword";

import ChangeEmail from "./ChangeEmail";

import UserRegistration from "./UserRegistration";

import QuestionsApproval from "./QuestionsApproval";

import Unauthorized from "./Unauthorized";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Signin: Signin,
    
    Home: Home,
    
    Subjects: Subjects,
    
    AddQuestion: AddQuestion,
    
    Profile: Profile,
    
    ChangePassword: ChangePassword,
    
    RecoverPassword: RecoverPassword,
    
    ChangeEmail: ChangeEmail,
    
    UserRegistration: UserRegistration,
    
    QuestionsApproval: QuestionsApproval,
    
    Unauthorized: Unauthorized,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Signin />} />
                
                
                <Route path="/Signin" element={<Signin />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/Subjects" element={<Subjects />} />
                
                <Route path="/AddQuestion" element={<AddQuestion />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/ChangePassword" element={<ChangePassword />} />
                
                <Route path="/RecoverPassword" element={<RecoverPassword />} />
                
                <Route path="/ChangeEmail" element={<ChangeEmail />} />
                
                <Route path="/UserRegistration" element={<UserRegistration />} />
                
                <Route path="/QuestionsApproval" element={<QuestionsApproval />} />
                
                <Route path="/Unauthorized" element={<Unauthorized />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}