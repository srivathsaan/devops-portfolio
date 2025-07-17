// JavaScript for mobile menu toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const closeMobileMenuButton = document.getElementById('close-mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.remove('hidden');
});

closeMobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
});

// Close mobile menu when a link is clicked
document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
});

// --- Three.js Integration for Hero Section (Customized for DevOps) ---
let scene, camera, renderer, cubes = [];
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

function initThreeJS() {
    const canvas = document.getElementById('threejs-canvas');

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 7; // Adjusted camera position to see more cubes

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create multiple small cubes
    const numCubes = 100; // Number of cubes to represent interconnected services
    const geometry = new THREE.BoxGeometry(0.3, 0.3, 0.3); // Small cubes
    const material = new THREE.MeshPhongMaterial({
        color: 0x4299e1, // A blue-ish color for tech/cloud
        flatShading: true,
        transparent: true,
        opacity: 0.3, // Semi-transparent
        emissive: 0x2b6cb0, // Subtle blue glow
        emissiveIntensity: 0.5
    });

    for (let i = 0; i < numCubes; i++) {
        const cube = new THREE.Mesh(geometry, material);

        // Randomly position cubes within a certain range
        cube.position.x = (Math.random() - 0.5) * 30;
        cube.position.y = (Math.random() - 0.5) * 30;
        cube.position.z = (Math.random() - 0.5) * 20;

        // Random initial rotation
        cube.rotation.x = Math.random() * Math.PI;
        cube.rotation.y = Math.random() * Math.PI;
        cube.rotation.z = Math.random() * Math.PI;

        scene.add(cube);
        cubes.push(cube);

        // Add edges for a wireframe look to each cube
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0x63b3ed, linewidth: 1 }); // Lighter blue edges
        const wireframe = new THREE.LineSegments(edges, lineMaterial);
        cube.add(wireframe);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Soft white light
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight1.position.set(5, 5, 5).normalize();
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, -5, -5).normalize();
    scene.add(directionalLight2);

    // Event Listeners for responsiveness and interactivity
    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('touchmove', onDocumentTouchMove, { passive: false });
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - windowHalfX) * 0.0005; // Reduced sensitivity
    mouseY = (event.clientY - windowHalfY) * 0.0005; // Reduced sensitivity
}

function onDocumentTouchMove(event) {
    if (event.touches.length === 1) {
        event.preventDefault(); // Prevent scrolling
        mouseX = (event.touches[0].pageX - windowHalfX) * 0.0005;
        mouseY = (event.touches[0].pageY - windowHalfY) * 0.0005;
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Apply subtle rotation and movement to each cube
    cubes.forEach((cube, index) => {
        cube.rotation.x += 0.001 + (Math.sin(Date.now() * 0.0001 + index) * 0.0005);
        cube.rotation.y += 0.0015 + (Math.cos(Date.now() * 0.0001 + index) * 0.0005);

        // Subtle floating/pulsing motion
        cube.position.y += Math.sin(Date.now() * 0.0005 + index) * 0.001;
        cube.position.x += Math.cos(Date.now() * 0.0005 + index) * 0.001;
    });

    // Rotate the entire group of cubes based on mouse position
    if (cubes.length > 0) {
        // Apply rotation to the camera or a parent group if you want the whole scene to react
        // For now, let's keep the individual cube rotation and just subtly adjust camera
        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position); // Make camera look at the center of the scene
    }

    renderer.render(scene, camera);
}

// Initialize Three.js when the window loads
window.onload = function() {
    initThreeJS();
    animate();
};

// --- Gemini API Integration for Project Descriptions ---
const descriptionModal = document.getElementById('description-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalProjectTitle = document.getElementById('modal-project-title');
const modalDescriptionContent = document.getElementById('modal-description-content');
const generateButtons = document.querySelectorAll('.generate-desc-btn');

generateButtons.forEach(button => {
    button.addEventListener('click', async (event) => {
        const projectCard = event.target.closest('.group');
        const projectTitle = projectCard.querySelector('h3').textContent;
        const projectShortDesc = projectCard.querySelector('p').textContent;
        const projectTechTags = Array.from(projectCard.querySelectorAll('.flex.flex-wrap.gap-2 span')).map(span => span.textContent).join(', ');

        // Show modal and loading spinner
        modalProjectTitle.textContent = projectTitle;
        modalDescriptionContent.innerHTML = '<div class="loading-spinner"></div><p class="text-center text-gray-500 mt-4">Generating detailed description...</p>';
        descriptionModal.classList.add('open');

        const prompt = `As a highly experienced DevOps Engineer, write a detailed and professional project description for the following project. Focus on the DevOps aspects, challenges, solutions, and impact.
        Project Title: "${projectTitle}"
        Short Description: "${projectShortDesc}"
        Technologies Used: ${projectTechTags}

        Please provide a comprehensive explanation (around 300-400 words), covering:
        1.  **Problem Statement/Challenge:** What problem did this project aim to solve from a DevOps perspective?
        2.  **Solution Implemented:** Detail the DevOps tools, practices, and architecture used.
        3.  **Key Responsibilities/Contributions:** Your specific role and contributions.
        4.  **Impact/Results:** Quantifiable achievements (e.g., reduced deployment time, improved reliability, cost savings).
        5.  **Lessons Learned/Future Improvements:** Any insights gained or potential next steps.`;

        try {
            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            const apiKey = ""; // Leave as-is, Canvas will provide at runtime
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const detailedDescription = result.candidates[0].content.parts[0].text;
                modalDescriptionContent.innerHTML = `<p>${detailedDescription.replace(/\n/g, '<br>')}</p>`; // Replace newlines with <br> for HTML display
            } else {
                modalDescriptionContent.innerHTML = '<p class="text-red-500">Failed to generate description. Please try again.</p>';
                console.error('Gemini API response structure unexpected:', result);
            }
        } catch (error) {
            modalDescriptionContent.innerHTML = '<p class="text-red-500">An error occurred while fetching the description. Please check your network connection or try again later.</p>';
            console.error('Error calling Gemini API:', error);
        }
    });
});

closeModalBtn.addEventListener('click', () => {
    descriptionModal.classList.remove('open');
});

// Close modal if clicked outside content
descriptionModal.addEventListener('click', (event) => {
    if (event.target === descriptionModal) {
        descriptionModal.classList.remove('open');
    }
});

