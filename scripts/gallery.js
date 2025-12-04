(function() {
  const galleryBg = document.getElementById('galleryBg');
  const deckPrompt = document.getElementById('deckPrompt');
  const polaroids = Array.from(document.querySelectorAll('.gallery .polaroid-link'));
  let zCounter = polaroids.length + 5;

  function randomizeStartPositions() {
    polaroids.forEach((card, index) => {
      const spread = 220;
      const x = (Math.random() - 0.5) * spread;
      const y = (Math.random() - 0.5) * spread;
      const rotate = (Math.random() - 0.5) * 16;
      card.style.top = `50%`;
      card.style.left = `50%`;
      card.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rotate}deg)`;
      zCounter = Math.max(zCounter, 2 + index);
      card.style.zIndex = 2 + index;
    });
  }

  function enableDragging(card) {
    const polaroid = card.querySelector('.polaroid');
    let offsetX = 0;
    let offsetY = 0;
    let isDragging = false;
    let moved = false;
    let startX = 0;
    let startY = 0;
    let activePointerId = null;

    function onPointerDown(e) {
      isDragging = true;
      moved = false;
      const rect = card.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      polaroid.style.cursor = 'grabbing';
      polaroid.style.filter = 'drop-shadow(0 20px 32px rgba(0,0,0,0.45))';
      polaroid.style.transition = 'none';
      zCounter += 1;
      card.style.zIndex = zCounter;
      activePointerId = e.pointerId;
      if (polaroid.setPointerCapture) {
        polaroid.setPointerCapture(activePointerId);
      }
      if (galleryBg) {
        const img = polaroid.querySelector('img');
        if (img && img.src) {
          galleryBg.style.backgroundImage = `url(${img.src})`;
          galleryBg.style.opacity = '1';
        }
      }
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!isDragging || (activePointerId !== null && e.pointerId !== activePointerId)) return;
      const deltaX = Math.abs(e.clientX - startX);
      const deltaY = Math.abs(e.clientY - startY);
      if (deltaX > 3 || deltaY > 3) moved = true;
      const galleryRect = card.parentElement.getBoundingClientRect();
      const x = e.clientX - galleryRect.left - offsetX;
      const y = e.clientY - galleryRect.top - offsetY;
      card.style.left = `${x}px`;
      card.style.top = `${y}px`;
      card.style.transform = `translate(0, 0)`;
    }

    function onPointerUp(e) {
      if (activePointerId !== null && e.pointerId !== activePointerId) return;
      isDragging = false;
      polaroid.style.cursor = 'grab';
      polaroid.style.filter = '';
      polaroid.style.transition = '';
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      if (polaroid.releasePointerCapture && activePointerId !== null) {
        polaroid.releasePointerCapture(activePointerId);
      }
      activePointerId = null;
      if (moved) {
        card.dataset.wasDragging = 'true';
        setTimeout(() => delete card.dataset.wasDragging, 0);
      }
      if (galleryBg) {
        galleryBg.style.opacity = '0';
      }
    }

    polaroid.addEventListener('pointerdown', onPointerDown);
    card.addEventListener('click', (e) => {
      if (card.dataset.wasDragging === 'true') {
        e.preventDefault();
        e.stopPropagation();
      }
    });
  }

  randomizeStartPositions();
  if (deckPrompt) {
    const hidePrompt = () => {
      deckPrompt.style.opacity = '0';
      deckPrompt.style.transition = 'opacity 0.25s ease';
      setTimeout(() => {
        deckPrompt.style.display = 'none';
      }, 250);
      document.removeEventListener('pointerdown', hidePrompt, true);
    };
    document.addEventListener('pointerdown', hidePrompt, true);
  }

  polaroids.forEach(enableDragging);
})();
