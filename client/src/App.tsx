import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Link, Route, BrowserRouter, Routes} from "react-router-dom";
import Fib from "./Fib";
import OtherPage from "./OtherPage";

function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>

                    <div>
                        <Routes>
                            <Route path={"/"} element={<Fib/>}></Route>
                            <Route path={"/otherpage"} element={<OtherPage/>}></Route>
                        </Routes>
                    </div>

                    <Link to={"/"}>Home</Link>
                    <Link to={"/otherpage"}>Other page</Link>


                </header>


            </div>

        </BrowserRouter>
    );
}

export default App;
