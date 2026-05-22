// =========================================================================
// 🌐 GEN-AI WORKSTATION: 3D STORYTELLING SCROLLING ENGINE
// =========================================================================

const scrollViewport = document.getElementById('scroll-viewport');
const storyLayers = document.querySelectorAll('.story-layer');

function render3DStorytelling() {
    // Get the bounding boundaries of our view panel window
    const viewportHeight = scrollViewport.clientHeight;

    storyLayers.forEach((layer) => {
        // Find where the element sits relative to the viewport window top boundary
        const layerBounds = layer.getBoundingClientRect();
        
        // Calculate the relative central midpoint of the element
        const elementCenter = layerBounds.top + (layerBounds.height / 2);
        
        // Normalize the position: 0 means dead center of screen, -1 is top, 1 is bottom
        const normalizedPosition = (elementCenter / viewportHeight) - 0.5;

        // --- THE 3D MATHS MATRIX ---
        // As the element approaches center from bottom, it flies toward the camera (Z increases)
        // It also rotates slightly backward on the X-axis for extreme movie depth
        const translateZ = Math.max(-400, Math.min(100, -normalizedPosition * 500)); 
        const rotateX = normalizedPosition * 35; // Tilts forward/backward based on scroll position
        const translateY = normalizedPosition * -50; // Dynamic parralax shift effect
        
        // Opacity management: fade clean out if it scrolls too far past or below center
        const opacity = 1 - Math.abs(normalizedPosition * 1.8);

        // --- COMMIT TRANSFORMATIONS ON THE DOM NODE ---
        layer.style.transform = `
            translate3d(0, ${translateY}px, ${translateZ}px) 
            rotateX(${rotateX}deg)
        `;
        layer.style.opacity = Math.max(0, Math.min(1, opacity));
    });
}

// Bind active scroll listeners to the viewport panel container
scrollViewport.addEventListener('scroll', () => {
    // RequestAnimationFrame smooths out the calculation loops to run at display refresh rate
    requestAnimationFrame(render3DStorytelling);
});

// Run an initial initialization pass to position items beautifully on page load
requestAnimationFrame(render3DStorytelling);