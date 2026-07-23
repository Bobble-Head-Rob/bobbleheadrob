(() => {
  "use strict";

  const mascot = document.querySelector("[data-mascot]");

  if (!mascot || !window.PointerEvent) {
    return;
  }

  const face = mascot.querySelector(".bobble-face");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const renderedProperties = new Map();
  const edge = 6;
  const state = {
    mode: "docked",
    pointerId: null,
    dragOriginX: 0,
    dragOriginY: 0,
    dragPointerX: 0,
    dragPointerY: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    rotation: 0,
    angularVelocity: 0,
    squash: 0,
    transientScaleX: 0,
    transientScaleY: 0,
    headX: 0,
    headY: 0,
    headRotation: 0,
    headVX: 0,
    headVY: 0,
    headVR: 0,
    pointerX: -10000,
    pointerY: -10000,
    pointerSpeed: 0,
    pointerDistance: Infinity,
    pointerSeenAt: 0,
    startleAt: 0,
    samples: [],
    scrollVelocity: 0,
    lastScrollY: window.scrollY,
    lastScrollAt: performance.now(),
    lastFrameAt: 0,
    returnTimer: 0,
    returnAge: 0,
    animationFrame: 0,
    idleSeed: Math.random() * Math.PI * 2,
    hidden: document.hidden,
    hostVisible: true
  };

  const tuning = {
    gravity: 1450,
    airDrag: 0.72,
    angularDrag: 1.6,
    restitution: 0.58,
    floorFriction: 0.76,
    maxFling: 1900,
    returnDelay: 2300,
    returnStiffness: 16,
    returnDamping: 6.2,
    headStiffness: 42,
    headDamping: 10
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const numericProperty = (styles, name, fallback) => {
    const value = Number.parseFloat(styles.getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  };

  const dimensions = () => ({
    width: mascot.offsetWidth,
    height: mascot.offsetHeight
  });

  const viewportBounds = () => {
    const { width, height } = dimensions();
    const rotationInset = clamp(Math.max(width, height) * 0.1, 12, 24);

    return {
      minX: edge + rotationInset,
      maxX: Math.max(edge + rotationInset, window.innerWidth - width - edge - rotationInset),
      minY: edge + rotationInset,
      maxY: Math.max(edge + rotationInset, window.innerHeight - height - edge - rotationInset)
    };
  };

  const dockTarget = () => {
    const host = mascot.closest(".hero-object");
    const hostRect = host.getBoundingClientRect();
    const { width, height } = dimensions();

    return {
      x: hostRect.left + (hostRect.width - width) / 2,
      y: hostRect.top + (hostRect.height - height) / 2
    };
  };

  const dockIsReachable = () => {
    const target = dockTarget();
    const bounds = viewportBounds();

    return (
      target.x >= bounds.minX - 1 &&
      target.x <= bounds.maxX + 1 &&
      target.y >= bounds.minY - 1 &&
      target.y <= bounds.maxY + 1
    );
  };

  const setProperties = (values) => {
    for (const [name, value] of Object.entries(values)) {
      if (renderedProperties.get(name) !== value) {
        mascot.style.setProperty(name, value);
        renderedProperties.set(name, value);
      }
    }
  };

  const clearReturnTimer = () => {
    if (state.returnTimer) {
      window.clearTimeout(state.returnTimer);
      state.returnTimer = 0;
    }
  };

  const scheduleReturn = () => {
    clearReturnTimer();

    state.returnTimer = window.setTimeout(() => {
      state.returnTimer = 0;

      if (state.mode !== "loose" || !dockIsReachable()) {
        scheduleReturn();
        return;
      }

      state.mode = "returning";
      state.returnAge = 0;
      state.vx = 0;
      state.vy = -28;
      state.angularVelocity *= 0.2;
      requestFrame();
    }, reducedMotion.matches ? 700 : tuning.returnDelay);
  };

  const requestFrame = () => {
    if (!state.animationFrame && !state.hidden) {
      state.animationFrame = window.requestAnimationFrame(tick);
    }
  };

  const enterLooseMode = () => {
    const styles = getComputedStyle(mascot);
    const bodyX = numericProperty(styles, "--body-x", 0);
    const bodyY = numericProperty(styles, "--body-y", 0);
    const bodyRotation = numericProperty(styles, "--body-rotation", 0);
    const bodyScaleX = numericProperty(styles, "--body-scale-x", 1);
    const bodyScaleY = numericProperty(styles, "--body-scale-y", 1);
    const inlineTransform = mascot.style.transform;

    mascot.style.transform = "none";
    const neutralRect = mascot.getBoundingClientRect();
    mascot.style.transform = inlineTransform;

    state.x = neutralRect.left + bodyX;
    state.y = neutralRect.top + bodyY;
    state.rotation = bodyRotation;
    state.transientScaleX = bodyScaleX - 1;
    state.transientScaleY = bodyScaleY - 1;
    mascot.classList.add("is-loose");
  };

  const returnToDock = () => {
    clearReturnTimer();
    state.mode = "docked";
    state.vx = 0;
    state.vy = 0;
    state.rotation = 0;
    state.angularVelocity = 0;
    state.squash = 0;
    state.transientScaleX = 0;
    state.transientScaleY = 0;
    mascot.classList.remove("is-loose", "is-dragging");
    setProperties({
      "--body-x": "0px",
      "--body-y": "0px",
      "--body-rotation": "0deg",
      "--body-scale-x": "1",
      "--body-scale-y": "1"
    });
    requestFrame();
  };

  const addSample = (event) => {
    const now = performance.now();
    state.samples.push({ x: event.clientX, y: event.clientY, time: now });
    state.samples = state.samples.filter((sample) => now - sample.time <= 130).slice(-7);
  };

  const flingVelocity = () => {
    if (state.samples.length < 2) {
      return { x: 0, y: 0 };
    }

    const first = state.samples[0];
    const last = state.samples[state.samples.length - 1];
    const elapsed = Math.max((last.time - first.time) / 1000, 0.016);
    let x = (last.x - first.x) / elapsed;
    let y = (last.y - first.y) / elapsed;
    const speed = Math.hypot(x, y);

    if (speed > tuning.maxFling) {
      const scale = tuning.maxFling / speed;
      x *= scale;
      y *= scale;
    }

    return { x, y };
  };

  const updatePointerAwareness = (event) => {
    const now = performance.now();
    const hadPointerSample = state.pointerSeenAt > 0;
    const elapsed = Math.max((now - state.pointerSeenAt) / 1000, 0.008);
    const dx = event.clientX - state.pointerX;
    const dy = event.clientY - state.pointerY;
    const previousDistance = state.pointerDistance;
    state.pointerSpeed = Math.hypot(dx, dy) / elapsed;
    state.pointerX = event.clientX;
    state.pointerY = event.clientY;
    state.pointerSeenAt = now;

    const rect = face.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    state.pointerDistance = Math.hypot(event.clientX - centerX, event.clientY - centerY);

    const approaching = hadPointerSample && previousDistance - state.pointerDistance > 8;
    const mayStartle = now - state.startleAt > 850;

    if (
      state.mode === "docked" &&
      approaching &&
      mayStartle &&
      state.pointerDistance < 210 &&
      state.pointerSpeed > 850 &&
      !reducedMotion.matches
    ) {
      const awayX = clamp((centerX - event.clientX) / Math.max(state.pointerDistance, 1), -1, 1);
      const awayY = clamp((centerY - event.clientY) / Math.max(state.pointerDistance, 1), -1, 1);
      state.headVX += awayX * 135;
      state.headVY += awayY * 95 - 25;
      state.headVR += awayX * 115;
      state.startleAt = now;
    }

    requestFrame();
  };

  const onPointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) {
      return;
    }

    if (state.mode === "dragging" && event.pointerId !== state.pointerId) {
      return;
    }

    event.preventDefault();
    clearReturnTimer();

    if (state.mode === "docked") {
      enterLooseMode();
    }

    const styles = getComputedStyle(mascot);
    const bodyScaleX = numericProperty(styles, "--body-scale-x", 1);
    const bodyScaleY = numericProperty(styles, "--body-scale-y", 1);

    state.mode = "dragging";
    state.pointerId = event.pointerId;
    state.dragOriginX = state.x;
    state.dragOriginY = state.y;
    state.dragPointerX = event.clientX;
    state.dragPointerY = event.clientY;
    state.transientScaleX = bodyScaleX - 1;
    state.transientScaleY = bodyScaleY - 1;
    state.squash = 0;
    state.vx = 0;
    state.vy = 0;
    state.angularVelocity = 0;
    state.samples = [];
    addSample(event);
    mascot.classList.add("is-dragging");
    mascot.setPointerCapture(event.pointerId);
    requestFrame();
  };

  const onPointerMove = (event) => {
    updatePointerAwareness(event);

    if (state.mode !== "dragging" || event.pointerId !== state.pointerId) {
      return;
    }

    event.preventDefault();
    const bounds = viewportBounds();
    state.x = clamp(
      state.dragOriginX + event.clientX - state.dragPointerX,
      bounds.minX,
      bounds.maxX
    );
    state.y = clamp(
      state.dragOriginY + event.clientY - state.dragPointerY,
      bounds.minY,
      bounds.maxY
    );
    addSample(event);
    requestFrame();
  };

  const releasePointer = (event, cancelled = false) => {
    if (state.mode !== "dragging" || event.pointerId !== state.pointerId) {
      return;
    }

    if (!cancelled) {
      addSample(event);
    }

    const fling = cancelled ? { x: 0, y: 0 } : flingVelocity();
    state.mode = "loose";
    state.pointerId = null;
    state.vx = reducedMotion.matches ? 0 : fling.x;
    state.vy = reducedMotion.matches ? 0 : fling.y;
    state.angularVelocity = reducedMotion.matches ? 0 : clamp(fling.x * 0.075, -120, 120);
    mascot.classList.remove("is-dragging");

    if (mascot.hasPointerCapture(event.pointerId)) {
      mascot.releasePointerCapture(event.pointerId);
    }

    if (reducedMotion.matches) {
      scheduleReturn();
    }

    requestFrame();
  };

  const collideWithViewport = () => {
    const bounds = viewportBounds();
    let impact = 0;

    if (state.x <= bounds.minX && state.vx < 0) {
      state.x = bounds.minX;
      impact = Math.max(impact, Math.abs(state.vx));
      state.vx *= -tuning.restitution;
      state.angularVelocity += state.vy * 0.025;
    } else if (state.x >= bounds.maxX && state.vx > 0) {
      state.x = bounds.maxX;
      impact = Math.max(impact, Math.abs(state.vx));
      state.vx *= -tuning.restitution;
      state.angularVelocity -= state.vy * 0.025;
    }

    if (state.y <= bounds.minY && state.vy < 0) {
      state.y = bounds.minY;
      impact = Math.max(impact, Math.abs(state.vy));
      state.vy *= -tuning.restitution;
    } else if (state.y >= bounds.maxY && state.vy > 0) {
      state.y = bounds.maxY;
      impact = Math.max(impact, Math.abs(state.vy));
      state.vy *= -tuning.restitution;
      state.vx *= tuning.floorFriction;
      state.angularVelocity *= 0.76;
    }

    if (impact > 80 && !reducedMotion.matches) {
      state.squash = clamp(impact / 1800, 0.045, 0.22);
      state.headVY -= clamp(impact * 0.13, 10, 105);
      state.headVR += clamp(state.vx * 0.025, -35, 35);
    }
  };

  const integrateLooseBody = (dt) => {
    if (state.mode === "returning") {
      if (!dockIsReachable()) {
        state.mode = "loose";
        state.vx = 0;
        state.vy = 0;
        state.angularVelocity = 0;
        scheduleReturn();
        return;
      }

      const target = dockTarget();
      const stiffness = reducedMotion.matches ? 10 : tuning.returnStiffness;
      const damping = reducedMotion.matches ? 7.5 : tuning.returnDamping;
      const ax = (target.x - state.x) * stiffness - state.vx * damping;
      const ay = (target.y - state.y) * stiffness - state.vy * damping;
      state.vx += ax * dt;
      state.vy += ay * dt;
      state.x += state.vx * dt;
      state.y += state.vy * dt;
      state.angularVelocity += (-state.rotation * 18 - state.angularVelocity * 7) * dt;
      state.rotation += state.angularVelocity * dt;
      state.returnAge += dt;

      const distance = Math.hypot(target.x - state.x, target.y - state.y);
      const speed = Math.hypot(state.vx, state.vy);

      if (state.returnAge > 0.5 && distance < 0.8 && speed < 8) {
        returnToDock();
      }

      return;
    }

    if (state.mode !== "loose" || reducedMotion.matches) {
      return;
    }

    const air = Math.exp(-tuning.airDrag * dt);
    state.vy += tuning.gravity * dt;
    state.vx *= air;
    state.vy *= Math.exp(-0.08 * dt);
    state.angularVelocity *= Math.exp(-tuning.angularDrag * dt);
    state.x += state.vx * dt;
    state.y += state.vy * dt;
    state.rotation += state.angularVelocity * dt;

    if (Math.abs(state.rotation) > 18) {
      state.rotation = clamp(state.rotation, -18, 18);
      state.angularVelocity *= -0.28;
    }

    collideWithViewport();

    const bounds = viewportBounds();
    const onFloor = state.y >= bounds.maxY - 0.5;
    const settled =
      onFloor &&
      Math.abs(state.vx) < 9 &&
      Math.abs(state.vy) < 28 &&
      Math.abs(state.angularVelocity) < 4;

    if (settled) {
      state.vx = 0;
      state.vy = 0;
      state.angularVelocity = 0;
      state.rotation *= 0.92;

      if (!state.returnTimer) {
        scheduleReturn();
      }
    }
  };

  const pointerTargets = () => {
    const rect = face.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = Math.max(170, Math.min(300, window.innerWidth * 0.28));
    const dx = state.pointerX - centerX;
    const dy = state.pointerY - centerY;
    const distance = Math.hypot(dx, dy);
    const strength = clamp(1 - distance / radius, 0, 1);

    return {
      x: clamp(dx / radius, -1, 1) * strength,
      y: clamp(dy / radius, -1, 1) * strength,
      strength
    };
  };

  const integrateHead = (dt, now) => {
    const pointer = pointerTargets();
    const looseInfluence = state.mode === "docked" ? 1 : 0.35;
    const scrollInfluence = state.mode === "docked" ? 1 : 0.18;
    const scroll = clamp(state.scrollVelocity / 1400, -1, 1) * scrollInfluence;
    const motion = reducedMotion.matches ? 0.22 : 1;
    const idle = state.mode === "docked" && !reducedMotion.matches
      ? Math.sin(now * 0.00072 + state.idleSeed) * 1.4 +
        Math.sin(now * 0.00113 + state.idleSeed * 0.7) * 0.65
      : 0;
    const targetX =
      pointer.x * 5.5 * looseInfluence * motion -
      clamp(state.vx / 420, -5, 5) * motion +
      idle * 0.25;
    const targetY =
      pointer.y * 2.8 * looseInfluence * motion +
      clamp(state.vy / 700, -3, 4) * motion +
      scroll * 4.5;
    const targetRotation =
      pointer.x * 4.5 * looseInfluence * motion -
      clamp(state.vx / 180, -7, 7) * motion -
      scroll * 4 +
      idle;

    state.headVX += (targetX - state.headX) * tuning.headStiffness * dt;
    state.headVY += (targetY - state.headY) * tuning.headStiffness * dt;
    state.headVR += (targetRotation - state.headRotation) * tuning.headStiffness * dt;

    const damping = Math.exp(-tuning.headDamping * dt);
    state.headVX *= damping;
    state.headVY *= damping;
    state.headVR *= damping;
    state.headX += state.headVX * dt;
    state.headY += state.headVY * dt;
    state.headRotation += state.headVR * dt;

    return pointer;
  };

  const render = (now, pointer, dt) => {
    const docked = state.mode === "docked";
    const idleX = docked && !reducedMotion.matches
      ? Math.sin(now * 0.00049 + state.idleSeed) * 1.2
      : 0;
    const idleY = docked && !reducedMotion.matches
      ? Math.sin(now * 0.00077 + state.idleSeed * 1.3) * -2.1
      : 0;
    const idleRotation = docked && !reducedMotion.matches
      ? Math.sin(now * 0.00061 + state.idleSeed) * 1.25
      : 0;
    const bodyX = docked ? idleX + pointer.x * 1.6 : state.x;
    const bodyY = docked ? idleY + pointer.y * 0.8 : state.y;
    const bodyRotation = docked ? idleRotation + pointer.x * 1.4 : state.rotation;
    const verticalSpeed = clamp(Math.abs(state.vy) / 1800, 0, 0.07);
    const squash = reducedMotion.matches ? 0 : state.squash;
    const scaleX = 1 + squash - verticalSpeed * 0.35 + state.transientScaleX;
    const scaleY = 1 - squash + verticalSpeed + state.transientScaleY;
    const eyeX = pointer.x * 3.2;
    const eyeY = pointer.y * 2.4;
    const speedLift = docked ? 0 : clamp((window.innerHeight - state.y) / window.innerHeight, 0, 1);

    setProperties({
      "--body-x": `${bodyX.toFixed(2)}px`,
      "--body-y": `${bodyY.toFixed(2)}px`,
      "--body-rotation": `${bodyRotation.toFixed(2)}deg`,
      "--body-scale-x": scaleX.toFixed(4),
      "--body-scale-y": scaleY.toFixed(4),
      "--head-x": `${state.headX.toFixed(2)}px`,
      "--head-y": `${state.headY.toFixed(2)}px`,
      "--head-rotation": `${state.headRotation.toFixed(2)}deg`,
      "--spring-lean": `${(state.headRotation * 0.52).toFixed(2)}deg`,
      "--spring-scale": clamp(1 + state.headY * 0.012 - verticalSpeed * 0.35, 0.82, 1.16).toFixed(3),
      "--base-x": `${(-state.headX * 0.09).toFixed(2)}px`,
      "--base-y": `${(squash * 5).toFixed(2)}px`,
      "--base-rotation": `${(-state.headRotation * 0.08).toFixed(2)}deg`,
      "--shadow-x": `${clamp(state.vx * -0.008, -12, 12).toFixed(2)}px`,
      "--shadow-y": `${(12 + speedLift * 12).toFixed(2)}px`,
      "--shadow-blur": `${(18 + speedLift * 14).toFixed(2)}px`,
      "--eye-x": `${eyeX.toFixed(2)}px`,
      "--eye-y": `${eyeY.toFixed(2)}px`
    });

    state.squash *= Math.exp(-8 * dt);

    if (state.mode !== "dragging") {
      state.transientScaleX *= Math.exp(-8 * dt);
      state.transientScaleY *= Math.exp(-8 * dt);
    }
  };

  function tick(now) {
    state.animationFrame = 0;

    if (state.hidden || (state.mode === "docked" && !state.hostVisible)) {
      return;
    }

    if (
      state.mode === "docked" &&
      state.lastFrameAt &&
      now - state.lastFrameAt < 28
    ) {
      requestFrame();
      return;
    }

    const dt = state.lastFrameAt ? Math.min((now - state.lastFrameAt) / 1000, 1 / 30) : 1 / 60;
    state.lastFrameAt = now;
    state.scrollVelocity *= Math.exp(-6 * dt);

    integrateLooseBody(dt);
    const pointer = integrateHead(dt, now);
    render(now, pointer, dt);

    const looseStillMoving =
      state.mode === "loose" &&
      (Math.abs(state.vx) > 0.1 ||
        Math.abs(state.vy) > 0.1 ||
        Math.abs(state.angularVelocity) > 0.1 ||
        state.squash > 0.001);

    if (state.mode !== "loose" || looseStillMoving || !state.returnTimer) {
      requestFrame();
    }
  }

  const onScroll = () => {
    const now = performance.now();
    const elapsed = Math.max((now - state.lastScrollAt) / 1000, 0.016);
    const nextY = window.scrollY;
    state.scrollVelocity = clamp((nextY - state.lastScrollY) / elapsed, -2400, 2400);
    state.lastScrollY = nextY;
    state.lastScrollAt = now;
    requestFrame();
  };

  const onResize = () => {
    if (state.mode !== "docked") {
      const bounds = viewportBounds();
      state.x = clamp(state.x, bounds.minX, bounds.maxX);
      state.y = clamp(state.y, bounds.minY, bounds.maxY);

      if (state.mode === "returning" && !dockIsReachable()) {
        state.mode = "loose";
        state.vx = 0;
        state.vy = 0;
        state.angularVelocity = 0;
        scheduleReturn();
      }
    }

    requestFrame();
  };

  const onVisibilityChange = () => {
    state.hidden = document.hidden;
    state.lastFrameAt = 0;

    if (!state.hidden) {
      requestFrame();
    }
  };

  const onMotionPreferenceChange = () => {
    if (reducedMotion.matches && state.mode === "loose") {
      state.vx = 0;
      state.vy = 0;
      state.angularVelocity = 0;
      scheduleReturn();
    }

    requestFrame();
  };

  mascot.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove, { passive: false });
  window.addEventListener("pointerup", releasePointer);
  window.addEventListener("pointercancel", (event) => releasePointer(event, true));
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });
  window.addEventListener("orientationchange", onResize, { passive: true });
  document.addEventListener("visibilitychange", onVisibilityChange);
  reducedMotion.addEventListener("change", onMotionPreferenceChange);

  if ("IntersectionObserver" in window) {
    const hostObserver = new IntersectionObserver(([entry]) => {
      state.hostVisible = entry.isIntersecting;

      if (state.hostVisible) {
        state.lastFrameAt = 0;
        requestFrame();
      }
    });

    hostObserver.observe(mascot.closest(".hero-object"));
  }

  requestFrame();
})();
