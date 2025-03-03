// Profile.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {

    const { user, updatedProfile } = useAuth();

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [facebook, setFacebook] = useState('');
    const [twitter, setTwitter] = useState('');
    const [instagram, setInstagram] = useState('');
    const [github, setGithub] = useState('');
    const [bio, setBio] = useState('');

    const handleSumbit = async (e) => {
        e.preventDefault()
        setError(null)

        const data = await updatedProfile({ facebook, twitter, instagram, github, bio, message })

        if (data.error) {
            setMessage(null)
            setError(data?.error)
        } else {
            setError(null)
            setMessage(data.message)
        }
    }

    useEffect(() => {
        setBio(user?.profile?.bio)
        setFacebook(user?.profile?.facebook)
        setTwitter(user?.profile?.twitter)
        setInstagram(user?.profile?.instagram)
        setGithub(user?.profile?.github)
    }, [])
    return (
        <div className="w-75 mx-auto my-5">
                   {
                !!error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        <strong>Error!</strong> {error}
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setError(null)}></button>
                    </div>
                )
            }

            {
                !!message && (
                    <div className="alert alert-success alert-dismissible fade show" role="alert">
                        <strong>Success!</strong> {message}
                        <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close" onClick={() => setMessage(null)}></button>
                    </div>
                )
            }
            <h3>Profile</h3>
            <form onSubmit={handleSumbit}>

                <div className="form-group mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input type="email" id="email" className="form-control" placeholder='email@domain.com'
                        defaultValue={user.email} disabled
                    />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="biography" className="form-label">Bio</label>
                    <textarea id="biography" className="form-control" placeholder='My biography' value={bio} onChange={e => setBio(e.target.value)}></textarea>
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="facebook" className="form-label">Facebook</label>
                    <input type="text" id="facebook" className="form-control" placeholder="Facebook" value={facebook} onChange={e => setFacebook(e.target.value)} />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="instagram" className="form-label">Instagram</label>
                    <input type="text" id="instagram" className="form-control" placeholder="Instagram" value={instagram} onChange={e => setInstagram(e.target.value)} />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="twitter" className="form-label">Twitter</label>
                    <input type="text" id="twitter" className="form-control" placeholder="Twitter" value={twitter} onChange={e => setTwitter(e.target.value)} />
                </div>

                <div className="form-group mb-3">
                    <label htmlFor="github" className="form-label">Github</label>
                    <input type="text" id="github" className="form-control" placeholder="Github" value={github} onChange={e => setGithub(e.target.value)} />
                </div>

                <button className="btn btn-warning btm-sm py-2 w-100">
                    Update
                </button>

            </form>
        </div>
    );
};

export default Dashboard;