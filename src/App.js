import './App.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import WritingPage from "./WritingPage";
import PastStory from "./PastStory";
import Login from './Login.js'
import PastStoryDisplay from './PastStoryDisplay.js'

function App() {

    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<Login/>}/>
                    <Route path="/writingpage" element={<WritingPage/>}/>
                    <Route path="/paststory/:uid" element={<PastStory/>}/>
                    <Route path="/paststoryviewer/:documentId" element={<PastStoryDisplay/>}/>
                </Routes>

            </Router>
            
            
        </>
    );
}

export default App;