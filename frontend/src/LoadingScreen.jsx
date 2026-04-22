import React, { useState, useEffect } from 'react';

export default function LoadingScreen() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let currentProgress = 0;
        const intervalId = setInterval(() => {
            const jump = Math.random() * 15 + 5;
            currentProgress += jump;

            if (currentProgress > 98) {
                currentProgress = 99.9;
            }
            
            setProgress(currentProgress);
        }, 300);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="bg-background text-on-background min-h-[100vh] w-full flex flex-col justify-center items-center relative overflow-hidden selection:bg-tertiary-container selection:text-background absolute top-0 left-0 z-50">
            <div className="absolute inset-0 pointer-events-none flex justify-center opacity-10">
                <div className="w-full max-w-[1200px] h-full border-x border-outline-variant flex justify-between">
                    <div className="w-[1px] h-full bg-outline-variant"></div>
                    <div className="w-[1px] h-full bg-outline-variant"></div>
                    <div className="w-[1px] h-full bg-outline-variant"></div>
                    <div className="w-[1px] h-full bg-outline-variant"></div>
                </div>
            </div>
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-center opacity-10">
                <div className="w-full h-[1px] bg-outline-variant mb-[204px]"></div>
                <div className="w-full h-[1px] bg-outline-variant mt-[204px]"></div>
            </div>

            <main className="w-full max-w-4xl px-container-padding relative z-10 flex flex-col gap-margin-md">
                <div className="flex justify-between items-end border-b border-surface-variant pb-margin-sm mb-margin-lg">
                    <div className="font-data-sm text-data-sm text-outline uppercase tracking-widest">
                        Vector_OS_V1.0
                    </div>
                    <div className="font-data-sm text-data-sm text-outline tracking-widest">
                        SEQ: INIT_0xFF
                    </div>
                </div>

                <div className="flex flex-col gap-margin-sm w-full">
                    <div className="flex justify-end w-full">
                        <span className="font-data-lg text-data-lg text-tertiary-container animate-pulse tracking-widest" style={{ color: '#00f2ff' }}>
                            [ {progress.toFixed(2)}% ]
                        </span>
                    </div>

                    <div className="w-full h-[2px] bg-surface-variant relative overflow-hidden">
                        <div 
                            className="absolute top-0 left-0 h-full transition-all duration-300 ease-out shadow-[0_0_10px_#00f2ff]" 
                            style={{ width: `${progress}%`, backgroundColor: '#00f2ff' }}
                        ></div>
                        
                        <div className="absolute top-full mt-unit left-0 w-[1px] h-unit bg-outline-variant"></div>
                        <div className="absolute top-full mt-unit left-[25%] w-[1px] h-unit bg-outline-variant"></div>
                        <div className="absolute top-full mt-unit left-[50%] w-[1px] h-unit bg-outline-variant"></div>
                        <div className="absolute top-full mt-unit left-[75%] w-[1px] h-unit bg-outline-variant"></div>
                        <div className="absolute top-full mt-unit left-full w-[1px] h-unit bg-outline-variant"></div>
                    </div>
                </div>

                <div className="mt-margin-lg font-data-sm text-data-sm text-outline flex flex-col gap-unit w-full">
                    <div className="opacity-50">&gt; Boot sequence initiated... OK</div>
                    {progress > 20 && <div className="opacity-75">&gt; Memory allocation verified... OK</div>}
                    {progress > 50 && <div className="text-on-surface-variant">&gt; Connecting HNSW graph layers...</div>}
                    {progress > 80 && <div className="text-on-surface-variant">&gt; Indexing vector clusters...</div>}
                    
                    <div className="text-on-surface flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 bg-on-surface inline-block animate-pulse"></span>
                        Awakening HNSW Topology (Waiting for backend API)...
                    </div>
                </div>
            </main>

            <div className="absolute bottom-10 w-full max-w-4xl px-container-padding z-10">
                <div className="border-l border-[#d97707] bg-[#d97707]/10 p-4 flex gap-4 items-start">
                    <div className="font-body text-body text-[#d97707] flex-1">
                        <strong className="block mb-1">⚠️ COLD BOOT:</strong>
                        Free-tier Server Infrastructure waking from sleep (&lt; 45s)
                    </div>
                    <div className="font-data-sm text-data-sm text-[#d97707] opacity-50 tracking-widest">
                        SYS_MSG_02
                    </div>
                </div>
            </div>
        </div>
    );
}
