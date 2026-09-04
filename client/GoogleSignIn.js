import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const GoogleSignIn = ({ onSignIn }) => {
    const handleSuccess = async (credentialResponse) => {
        try {
            const token = credentialResponse.credential;

            // Send Google JWT to backend to verify signature cryptographically
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            // Only log in if the backend confirms valid Google credentials
            if (data.success && data.user) {
                onSignIn(data.user);
            } else {
                console.error('Backend Google Auth Failed:', data.message);
                alert('Authentication failed: Invalid Google token.');
            }
        } catch (error) {
            console.error('Error contacting authentication backend:', error);
            alert('Unable to contact authentication server. Please try again.');
        }
    };

    return (
        <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com"}>
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={() => console.log('Google Login Failed')}
            />
        </GoogleOAuthProvider>
    );
};

export default GoogleSignIn;