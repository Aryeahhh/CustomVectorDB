import React, { useState, useEffect } from 'react';

export default function LoadingScreen() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Render.com Free Tier limits pause the Python server after 15 minutes of inactivity.
        // It takes roughly 40 seconds to cold boot back up. 
        // This artificial interval algorithmically climbs to 90% and waits for the actual API response.
        const interval = setInterval(() => {
            setProgress(prev => {
                const step = Math.random() * 3.5;
                if (prev + step >= 90) return 90; // Hold at 90% until backend intercepts
                return prev + step;
            });
        }, 1000);
        
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="loading-screen">
            <div className="loading-content">
                <h2 className="glitch" data-text="WAKING UP HNSW NEURAL CLUSTER...">
                    WAKING UP GRAPH CLUSTER...
                </h2>
                
                <p>Establishing $O(\log N)$ structural connection to the backend topology...</p>
                
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
                
                <div className="loading-status">
                    <span>SYSTEM BOOT SEQUENCE... </span>
                    <span className="percentage">[{progress.toFixed(1)}%]</span>
                </div>
                
                <div className="cold-boot-warning">
                    ⚠️ <b>Cold Boot Triggered:</b> Because this architecture is running on zero-cost free-tier infrastructure, Render.com is spinning the Python server up from sleep. This may take up to <b>45 seconds</b>.
                </div>
            </div>
        </div>
    );
}
