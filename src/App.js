import './App.css';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AiBoard from './Components/AIBoard/AiBoard';
import Header from './Components/Header';
import LocalBoard from './Components/LocalBoard/LocalBoard';
import MyNav from './Components/Navbar/MyNav';
import Join from './Components/Join/Join';
import OnlineBoard from './Components/OnlineBoard/OnlineBoard';
import Home from './Components/Home/Home';
import TempBoard from './Components/TempBoard/TempBoard';

function App() {
  return (

     <Router>
      <MyNav title="Checkers" />
      <Routes>
        <Route
          exact path="/"
          element={<Home></Home>}
        />
        <Route
          exact path="/local"
          element={<LocalBoard></LocalBoard>}
        />
        <Route
          exact path="/online"
          element={<Join></Join>}
        />
        <Route
          exact path="/ai"
          element={<AiBoard></AiBoard>}
        />
        <Route
          exact path="/1v1"
          element={<OnlineBoard></OnlineBoard>}
        />
        <Route
          exact path="/online/game/:gameId"
          element={<Header></Header>}
        />
        <Route
          exact path="/temp"
          element={<TempBoard></TempBoard>}
        />
      </Routes>
    </Router> 
  )
}

export default App;