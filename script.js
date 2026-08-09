(() => {
  const page = document.documentElement;
  const carton = document.querySelector('.fall-carton');
  const routeLayer = document.querySelector('.milk-route-layer');
  const route = document.querySelector('.milk-route-base');
  const routeShadow = document.querySelector('.milk-route-shadow');
  const routeShine = document.querySelector('.milk-route-shine');
  const milkLevel = document.querySelector('.milk-level');
  const funnelFlow = document.querySelector('.funnel-flow');
  const funnelExitFlow = document.querySelector('.funnel-exit-flow');
  const glassClaim = document.querySelector('.glass-claim');
  const signs = [...document.querySelectorAll('.prop-sign')];
  const riverStart = document.querySelector('.river-start');
  const funnelSection = document.querySelector('.funnel');
  const funnelGraphic = document.querySelector('.funnel-graphic');
  const cartonOpening = document.querySelector('.carton-opening');

  let ticking = false;

  const clamp = (value, min = 0, max = 1) => Math.min(Math.max(value, min), max);
  const sectionProgress = (element, start = 0, end = 1) => {
    const bounds = element.getBoundingClientRect();
    const viewport = window.innerHeight;
    return clamp((viewport - bounds.top - viewport * start) / (bounds.height - viewport * (start + end)));
  };
  const riverReveal = (masterProgress) => clamp((masterProgress - 0.04) / 0.9);

  function setRouteGeometry() {
    const routeStart = riverStart.offsetTop;
    const routeEnd = funnelSection.offsetTop + funnelSection.offsetHeight * 0.2;
    routeLayer.style.top = `${routeStart}px`;
    const routeHeight = Math.max((routeEnd - routeStart) / 0.895, 1);
    routeLayer.style.height = `${routeHeight}px`;
    const opening = cartonOpening.getBoundingClientRect();
    const startX = clamp((opening.left + opening.width / 2) / window.innerWidth, 0.2, 0.8) * 1000;
    const startY = clamp((opening.top + opening.height / 2 + window.scrollY - routeStart) / routeHeight, 0.02, 0.25) * 3900;
    const funnelCenter = funnelGraphic.getBoundingClientRect().left + funnelGraphic.offsetWidth / 2;
    const endX = clamp(funnelCenter / window.innerWidth, 0.2, 0.8) * 1000;
    const path = `M ${startX.toFixed(0)} ${startY.toFixed(0)} C 670 500, 500 620, 520 850 S 900 1060, 760 1310 S 290 1600, 390 1880 S 760 2200, 625 2470 S 330 2740, 430 3010 S 710 3260, ${endX.toFixed(0)} 3490`;
    [route, routeShadow, routeShine].forEach((pathElement) => pathElement.setAttribute('d', path));
  }

  function updateCarton(progress, masterProgress) {
    const fall = clamp((progress - 0.12) / 0.68);
    carton.style.transform = `rotate(${fall * 78}deg) translate(${fall * 24}px, ${fall * 72}px)`;
    const routeLength = route.getTotalLength();
    const reveal = riverReveal(masterProgress);
    [route, routeShadow, routeShine].forEach((pathElement) => {
      pathElement.style.strokeDasharray = routeLength;
      pathElement.style.strokeDashoffset = routeLength * (1 - reveal);
    });
  }

  function updateFunnel(masterProgress) {
    const fill = clamp((masterProgress - 0.95) / 0.05);
    const flow = clamp((riverReveal(masterProgress) - 0.94) / 0.06);
    milkLevel.style.height = `${fill * 100}%`;
    funnelFlow.style.transform = `scaleY(${flow})`;
    funnelFlow.style.opacity = `${flow}`;
    funnelExitFlow.style.transform = `scaleY(${flow})`;
    funnelExitFlow.style.opacity = `${flow}`;
    glassClaim.style.clipPath = `inset(${(1 - fill) * 100}% 0 0)`;
    glassClaim.style.opacity = `${clamp(fill * 1.7)}`;
  }

  function revealSigns() {
    signs.forEach((sign) => {
      const trigger = window.innerHeight * 0.78;
      sign.classList.toggle('is-visible', sign.getBoundingClientRect().top < trigger);
    });
  }

  function updatePage() {
    const sequenceStart = riverStart.offsetTop;
    const sequenceEnd = funnelSection.offsetTop + funnelSection.offsetHeight * 0.55;
    const masterProgress = clamp((window.scrollY + window.innerHeight * 0.42 - sequenceStart) / (sequenceEnd - sequenceStart));
    updateCarton(sectionProgress(riverStart, 0.1, 0.1), masterProgress);
    updateFunnel(masterProgress);
    revealSigns();
    page.style.setProperty('--scroll-y', `${window.scrollY}px`);
    ticking = false;
  }

  function requestUpdate() {
    if (!ticking) {
      window.requestAnimationFrame(updatePage);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', () => { setRouteGeometry(); requestUpdate(); });
  setRouteGeometry();
  updatePage();
})();
