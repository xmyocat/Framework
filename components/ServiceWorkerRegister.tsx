'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('/sw.js').then(
                    function (registration) {
                        // ServiceWorker registration successful
                    },
                    function (err) {
                        // ServiceWorker registration failed
                    }
                );
            });
        }
    }, []);

    return null;
}
