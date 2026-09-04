import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

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

    const isDev = process.env.NODE_ENV !== 'production' || 
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' || 
        window.location.hostname.includes('dev');

    // Add a mock login for development/local testing to make testing easier
    if (isDev) {
        const handleMockSignIn = () => {
            onSignIn({
                name: 'Mock Admin',
                email: 'harshbajpai1194@gmail.com',
                picture: 'https://i.pravatar.cc/150?u=mockadmin' 
            });
        };

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => console.log('Google Login Failed')}
                />
                <button onClick={handleMockSignIn} className="btn-secondary" style={{padding: '8px 12px'}}>
                    Sign In as Mock Admin
                </button>
            </div>
        );
    }

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => console.log('Google Login Failed')}
        />
    );
};

export default GoogleSignIn;