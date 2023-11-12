import React from 'react'
import { Link } from 'react-router-dom';
import './myNav.css'

function MyNav(props) {
    return (
        <div className="nav">
            <input type="checkbox" id="nav-check" />
            <div className="nav-header">
                <Link className="nav-title" to="/">
                {props.title}
                </Link>
            </div>
            <div className="nav-btn">
                <label htmlFor="nav-check">
                <span></span>
                <span></span>
                <span></span>
                </label>
            </div>
            <div className="nav-links">
            <Link aria-current="page" to="/local">Local</Link>
            <Link aria-current="page" to="/online">Online</Link>
            <Link aria-current="page" to="/ai">AI</Link>
            {/* <a href="//github.io/jo_geek" target="_blank">Github</a>
            <a href="http://stackoverflow.com/users/4084003/" target="_blank">Stackoverflow</a>
            <a href="https://in.linkedin.com/in/jonesvinothjoseph" target="_blank">LinkedIn</a>
            <a href="https://codepen.io/jo_Geek/" target="_blank">Codepen</a>
            <a href="https://jsfiddle.net/user/jo_Geek/" target="_blank">JsFiddle</a> */}
            </div>
        </div>

        // <div className='nav'>
        //     <nav className="navbar navbar-expand-lg navbar-dark bg-dark" >
        //         <div className="container-fluid">
        //             <Link className="navbar-brand" to="/">{props.title}</Link>
        //             <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        //                 <span className="navbar-toggler-icon"></span>
        //             </button>
        //             <div className="collapse navbar-collapse" id="navbarSupportedContent">
        //                 <ul className="navbar-nav me-auto mb-2 mb-lg-0">
        //                     <li className="nav-item">
        //                         <Link className="nav-link" aria-current="page" to="/local">Local</Link>
        //                     </li>
        //                     <li className="nav-item">
        //                         <Link className="nav-link disabled" aria-current="page" to="/PvP2">Online</Link>
        //                     </li>
        //                     <li className="nav-item">
        //                         <Link className="nav-link" to="/ai">AI</Link>
        //                     </li>
        //                 </ul>
        //             </div>
        //         </div>

        //     </nav>
        // </div>
    )
}

export default MyNav
