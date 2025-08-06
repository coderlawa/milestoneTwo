/**
 * This file is part of Milestone Two.
 * It contains the Ubiquitous JavaScript functionality for the application.
 * 
 * @file main.js
 * @description This file contains the main logic for the application.
 */

document.addEventListener('DOMContentLoaded', function() {
    // current year in footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
        document.getElementById('last-updated').textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });
        
        // Smooth page transitions
        document.querySelectorAll('a').forEach(link => {
            if (link.href && !link.hash && link.hostname === window.location.hostname) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    document.body.classList.add('page-transition');
                    setTimeout(() => {
                        window.location.href = link.href;
                    }, 300);
                });
            }
        });
});