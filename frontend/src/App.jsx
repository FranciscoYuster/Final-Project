// src/App.jsx
import React, { useState, useEffect } from 'react';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { getRefreshToken, getNewAccessToken } from './utils';
import Layout from './Layout';

function App() {
  const initialUserProperties = {
    access_token: '',
    expires_in: 0,
    id_token: '',
    refresh_token: '',
    scope: '',
    token_type: '',
  };

  const emailUserProfile = {
    email: '',
    family_name: '',
    given_name: '',
    hd: '',
    id: '',
    locale: '',
    name: '',
    picture: '',
    verified_email: false,
  };

  const [emailUser, setEmailUser] = useState(initialUserProperties);
  const [emailProfile, setEmailProfile] = useState(emailUserProfile);

  const SCOPE = 'https://mail.google.com/';

  const login = useGoogleLogin({
    scope: SCOPE,
    flow: 'auth-code',
    onSuccess: (codeResponse) => {
      if (codeResponse.scope.includes('https://mail.google.com/')) {
        new Promise((resolve, reject) => {
          getRefreshToken(codeResponse, setEmailUser);
          if (!!emailUser.refresh_token) {
            resolve();
          }
        }).then(() => {
          setTimeout(() => {
            getNewAccessToken(emailUser);
          }, 10000);
        });
      } else {
        console.log('Please give required permission to read emails!');
      }
    },
    onError: (error) => {
      console.log('Login Failed:', error);
    },
  });

  useEffect(() => {
    if (!!emailUser.access_token) {
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${emailUser.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${emailUser.access_token}`,
              Accept: 'application/json',
            },
          }
        )
        .then((res) => {
          setEmailProfile(res.data);
        })
        .catch((err) => console.log('Error fetching profile:', err));
    }
  }, [emailUser]);

  const logOut = () => {
    googleLogout();
    setEmailProfile(null);
    setEmailUser(initialUserProperties);
  };

  return emailProfile ? (
    <Layout userProfile={emailProfile} logOut={logOut} />
  ) : (
    <div className="container text-center my-5">
      <h2>React Google Login</h2>
      <br />
      <button className="btn btn-primary" onClick={() => login()}>
        Sign in with Google 🚀
      </button>
    </div>
  );
}

export default App;
