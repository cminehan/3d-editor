// Debug logging
console.log('Debug.js loaded');

// Override console.log to include timestamps
const originalConsoleLog = console.log;
console.log = function() {
    const timestamp = new Date().toISOString();
    originalConsoleLog.apply(console, [`[${timestamp}]`, ...arguments]);
};

// Add error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
    return false;
};

// Check if Three.js is loaded
window.addEventListener('load', function() {
    console.log('Window loaded');
    if (typeof THREE === 'undefined') {
        console.error('THREE is not defined!');
    } else {
        console.log('THREE is loaded:', THREE.REVISION);
    }
}); 