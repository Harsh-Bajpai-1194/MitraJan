import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

const GoogleSignIn = ({ onSignIn }) => {
    const handleSuccess = async (credentialResponse) => {
        try {
            const token = credentialResponse.credential;

            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            // Guard against HTML error pages / non-JSON responses from proxies or crashes
            const contentType = response.headers.get('content-type');
            let data = null;
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            }

            // Distinguish server/network errors (5xx/4xx) from invalid tokens
            if (!response.ok) {
                const errorMsg = data?.message || `Server responded with HTTP ${response.status}`;
                console.error('Authentication request failed:', errorMsg);
                alert(`Authentication error: ${errorMsg}`);
                return;
            }

            if (data?.success && data?.user) {
                onSignIn(data.user);
            } else {
                console.error('Backend Google Auth Failed:', data?.message);
                alert('Authentication failed: Invalid Google token.');
            }
        } catch (error) {
            console.error('Network or parsing error contacting authentication backend:', error);
            alert('Unable to contact authentication server. Please check your connection.');
        }
    };

    // Strictly gate mock login behind an explicit environment variable that defaults to off
    const showMockLogin = process.env.REACT_APP_ENABLE_MOCK_LOGIN === 'true';

    if (showMockLogin) {
        const handleMockSignIn = () => {
            onSignIn({
                name: 'Mock Admin',
                email: 'mockadmin@example.com', // Safe placeholder, non-personal
                picture: 'https://i.pravatar.cc/150?u=mockadmin'
            });
        };

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={() => console.log('Google Login Failed')}
                />
                <button onClick={handleMockSignIn} className="btn-secondary" style={{ padding: '8px 12px' }}>
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