import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Menu from './components/Menu'
import Home from './views/Home'
import Profile from './views/Profile'
import Register from './views/Register'
import Login from './views/Login'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './views/PrivateRoute'



const Layout = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Menu />
                <Routes>
                    <Route path='login' element={<Login />} />
                    <Route path='register' element={<Register />} />
                    <Route path='profile' element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    } />
                    <Route path='/' element={<Home />} />
                    <Route path='*' element={<h1>Page Not Foun (404</h1>} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default Layout