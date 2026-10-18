/*
  main.js
  - sync header height -> set --header-height and set section scroll-margin-top
  - mobile menu open/close with aria toggles, focus trap, escape to close, scroll lock
  - modal for detailed description with focus trap and escape to close
  - wire up "View Detailed Description" buttons
  - contact form -> mailto handoff
  - footer year
*/

(function () {
  'use strict';

  // Sync header height -> CSS var + section scroll-margin-top + hero inner sizing
  function syncHeaderHeight() {
    const header = document.getElementById('site-header');
    if (!header) return;

    const h = Math.ceil(header.getBoundingClientRect().height) + 'px';
    document.documentElement.style.setProperty('--header-height', h);

    // Ensure anchored sections aren't hidden under sticky header
    document.querySelectorAll('section[id]').forEach(sec => {
      sec.style.scrollMarginTop = h;
    });
  }

  window.addEventListener('load', syncHeaderHeight);
  window.addEventListener('resize', syncHeaderHeight);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncHeaderHeight);
  }

  // Utilities
  const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  function trapFocus(container) {
      const focusables = Array.from(container.querySelectorAll(focusableSelectors)).filter(el => el.offsetParent !== null);
      if (!focusables.length) return () => {};
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const keyHandler = (e) => {
          if (e.key === 'Tab') {
              if (e.shiftKey && document.activeElement === first) {
                  e.preventDefault();
                  last.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                  e.preventDefault();
                  first.focus();
              }
          }
      };
      container.addEventListener('keydown', keyHandler);
      first.focus();
      return () => container.removeEventListener('keydown', keyHandler);
  }

  // Mobile menu behaviour
  const mobileBtn = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeMobileBtn = document.getElementById('close-mobile-menu');
  let releaseMobileTrap = null;

  function openMobileMenu() {
      if (!mobileMenu) return;
      mobileMenu.classList.remove('hidden');
      mobileMenu.setAttribute('aria-hidden', 'false');
      mobileBtn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      releaseMobileTrap = trapFocus(mobileMenu);
      document.addEventListener('keydown', mobileGlobalKeydown);
  }
  function closeMobileMenu() {
      if (!mobileMenu) return;
      mobileMenu.classList.add('hidden');
      mobileMenu.setAttribute('aria-hidden', 'true');
      mobileBtn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (typeof releaseMobileTrap === 'function') releaseMobileTrap();
      document.removeEventListener('keydown', mobileGlobalKeydown);
      mobileBtn.focus();
  }
  function mobileGlobalKeydown(e) {
      if (e.key === 'Escape') closeMobileMenu();
  }

  if (mobileBtn && mobileMenu) {
      mobileBtn.addEventListener('click', () => {
          const expanded = mobileBtn.getAttribute('aria-expanded') === 'true';
          if (expanded) closeMobileMenu();
          else openMobileMenu();
      });
  }
  if (closeMobileBtn) closeMobileBtn.addEventListener('click', closeMobileMenu);

  // close mobile menu when a mobile nav link is clicked
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', () => {
          closeMobileMenu();
      });
  });

  // Modal behaviour for detailed descriptions
  const modal = document.getElementById('description-modal');
  const modalContent = modal ? modal.querySelector('.modal-content') : null;
  const modalTitle = document.getElementById('modal-project-title');
  const modalBody = document.getElementById('modal-description-content');
  const closeModalBtn = document.getElementById('close-modal-btn');
  let releaseModalTrap = null;

  function openModal(title, htmlContent) {
      if (!modal) return;
      modal.classList.remove('hidden');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      if (modalTitle) modalTitle.textContent = title || '';
      if (modalBody) modalBody.innerHTML = htmlContent || '';
      releaseModalTrap = trapFocus(modalContent || modal);
      document.addEventListener('keydown', modalGlobalKeydown);
  }
  function closeModal() {
      if (!modal) return;
      modal.classList.add('hidden');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (typeof releaseModalTrap === 'function') releaseModalTrap();
      document.removeEventListener('keydown', modalGlobalKeydown);
      // return focus to last focused element could be improved if needed
  }
  function modalGlobalKeydown(e) {
      if (e.key === 'Escape') closeModal();
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (modal) modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(); // click outside content closes
  });

  // Wire up "View Detailed Description" buttons
  document.querySelectorAll('.generate-desc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
          const card = btn.closest('.project-card');
          if (!card) return;
          const titleEl = card.querySelector('h3');
          const descEl = card.querySelector('.project-desc');
          const title = titleEl ? titleEl.textContent.trim() : 'Project';
          const desc = descEl ? descEl.outerHTML : '<p>No description available.</p>';
          openModal(title, desc);
      });
  });

  // Contact form: hand the message off to the visitor's email client
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const name = contactForm.elements.name.value.trim();
          const email = contactForm.elements.email.value.trim();
          const message = contactForm.elements.message.value.trim();
          const subject = encodeURIComponent(`Portfolio contact from ${name}`);
          const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
          window.location.href = `mailto:srivathsaan11@gmail.com?subject=${subject}&body=${body}`;
      });
  }

  // Footer year
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Ensure anchor links don't get hidden by header (for keyboard + programmatic navigation)
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(a => {
      a.addEventListener('click', (e) => {
          // allow normal navigation to anchor; but ensure header height applied (already done by syncHeaderHeight)
          // small delay to ensure focus lands and scrollMarginTop applied
          setTimeout(() => {
              const id = (a.getAttribute('href') || '').split('#')[1];
              if (id) {
                  const target = document.getElementById(id);
                  if (target) target.focus({ preventScroll: true });
              }
          }, 100);
      });
  });

  // Three.js Background Animation
  const canvas = document.getElementById('threejs-canvas');
  if (canvas && window.THREE) {
      const scene = new THREE.Scene();
      // Initial aspect ratio will be updated by resize function immediately
      const camera = new THREE.PerspectiveCamera(75, 1, 0.5, 100);
      const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
      
      const updateSize = () => {
          const container = canvas.parentElement;
          if (container) {
              renderer.setSize(container.clientWidth, container.clientHeight);
              camera.aspect = container.clientWidth / container.clientHeight;
              camera.updateProjectionMatrix();
          }
      };
      updateSize();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const geometry = new THREE.BoxGeometry();
      const edgesGeometry = new THREE.EdgesGeometry(geometry);

      // Invisible material for interaction (hit target)
      const material = new THREE.MeshBasicMaterial({ 
          transparent: true, 
          opacity: 0 
      });

      // Visible edges material (no diagonals)
      const edgesMaterial = new THREE.LineBasicMaterial({
          color: 0x4f46e5,
          transparent: true,
          opacity: 0.45
      });

      // Material for connections
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x4f46e5, transparent: true, opacity: 0.3 });
      const lineGeometry = new THREE.BufferGeometry();
      const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(lines);

      const cubes = [];
      for (let i = 0; i < 20; i++) {
          const cube = new THREE.Mesh(geometry, material);
          
          // Add edges as a child to the cube
          const edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
          cube.add(edges);

          cube.position.x = (Math.random() - 0.5) * 20;
          cube.position.y = (Math.random() - 0.5) * 20;
          cube.position.z = (Math.random() - 0.5) * 10;
          cube.rotation.x = Math.random() * Math.PI;
          cube.rotation.y = Math.random() * Math.PI;
          cube.scale.set(1, 1, 1);
          scene.add(cube);
          cubes.push(cube);
      }

      camera.position.z = 5;

      // Interaction Variables
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      let isDragging = false;
      let draggedObject = null;
      const dragPlane = new THREE.Plane();
      const dragOffset = new THREE.Vector3();
      const intersection = new THREE.Vector3();

      // Mouse Event Handlers
      function onMouseDown(event) {
          const rect = canvas.getBoundingClientRect();
          mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(cubes);

          if (intersects.length > 0) {
              isDragging = true;
              draggedObject = intersects[0].object;
              
              // Create a plane at the object's position facing the camera to drag along
              const normal = new THREE.Vector3();
              camera.getWorldDirection(normal);
              dragPlane.setFromNormalAndCoplanarPoint(normal, draggedObject.position);

              if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
                  dragOffset.copy(intersection).sub(draggedObject.position);
              }
              canvas.style.cursor = 'grabbing';
          }
      }

      function onMouseMove(event) {
          if (isDragging && draggedObject) {
              const rect = canvas.getBoundingClientRect();
              mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
              mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

              raycaster.setFromCamera(mouse, camera);
              if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
                  draggedObject.position.copy(intersection.sub(dragOffset));
              }
          }
      }

      function onMouseUp() {
          isDragging = false;
          draggedObject = null;
          canvas.style.cursor = 'default';
      }

      canvas.addEventListener('mousedown', onMouseDown);
      canvas.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp); // Listen on window to catch release outside canvas

      const animate = function () {
          requestAnimationFrame(animate);
          cubes.forEach(cube => {
              // Rotate cubes slightly
              cube.rotation.x += 0.002;
              cube.rotation.y += 0.002;
          });

          // Update connection lines
          const positions = [];
          for (let i = 0; i < cubes.length; i++) {
              for (let j = i + 1; j < cubes.length; j++) {
                  const dist = cubes[i].position.distanceTo(cubes[j].position);
                  // Connect if close enough
                  if (dist < 3.5) {
                      positions.push(
                          cubes[i].position.x, cubes[i].position.y, cubes[i].position.z,
                          cubes[j].position.x, cubes[j].position.y, cubes[j].position.z
                      );
                  }
              }
          }
          lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

          renderer.render(scene, camera);
      };
      animate();

      window.addEventListener('resize', updateSize);
  }

})();
