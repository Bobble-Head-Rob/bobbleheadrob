(() => {
  "use strict";

  const mascot = document.querySelector("[data-mascot]");

  if (!mascot || !window.PointerEvent) {
    return;
  }

  const face = mascot.querySelector(".bobble-face");
  const base = mascot.querySelector(".bobble-base");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const renderedProperties = new Map();
  const edge = 6;
  const state = {
    mode: "docked",
    grabMode: null,
    pointerId: null,
    dragOriginX: 0,
    dragOriginY: 0,
    dragPointerX: 0,
    dragPointerY: 0,
    dragVelocityX: 0,
    dragVelocityY: 0,
    dragUpdatedAt: 0,
    headAnchorOriginX: 0,
    headAnchorOriginY: 0,
    headAnchorX: 0,
    headAnchorY: 0,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    rotation: 0,
    angularVelocity: 0,
    squash: 0,
    transientScaleX: 0,
    transientScaleY: 0,
    headOffsetX: 0,
    headOffsetY: 0,
    headRotation: 0,
    headVelocityX: 0,
    headVelocityY: 0,
    headAngularVelocity: 0,
    pointerX: -10000,
    pointerY: -10000,
    pointerSpeed: 0,
    pointerDistance: Infinity,
    pointerSeenAt: 0,
    pointerInfluenceX: 0,
    pointerInfluenceY: 0,
    pointerStrength: 0,
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
    lateralSpringStiffness: 54,
    verticalSpringStiffness: 68,
    headDamping: 6.8,
    maximumHeadDisplacement: 2.25,
    angularStiffness: 38,
    angularDamping: 7.5,
    idleImpulseStrength: 8,
    dragPositionCoupling: 0.82,
    dragVelocityCoupling: 0.16,
    bodyAccelerationCoupling: 0.62,
    headGrabBaseStiffness: 44,
    headGrabBaseDamping: 13.5,
    headGrabMaximumAcceleration: 5200,
    headGrabMaximumVelocity: 680,
    headReleaseTransfer: 0.72
  };

  const geometry = {
    unit: 16,
    bodyWidth: 136,
    bodyHeight: 240,
    springRestLength: 48,
    maximumHeadDisplacement: 36,
    maximumVerticalDisplacement: 27,
    dockDocumentX: 0,
    dockDocumentY: 0
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const clampVectorMagnitude = (x, y, maximum) => {
    const magnitude = Math.hypot(x, y);

    if (magnitude <= maximum) {
      return { x, y };
    }

    const scale = maximum / magnitude;
    return { x: x * scale, y: y * scale };
  };
  const numericProperty = (styles, name, fallback) => {
    const value = Number.parseFloat(styles.getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  };

  const updateDockDocumentTarget = () => {
    const hostRect = mascot.closest(".hero-object").getBoundingClientRect();
    geometry.dockDocumentX =
      hostRect.left + window.scrollX + (hostRect.width - geometry.bodyWidth) / 2;
    geometry.dockDocumentY =
      hostRect.top + window.scrollY + (hostRect.height - geometry.bodyHeight) / 2;
  };

  const updateGeometry = () => {
    geometry.unit = Number.parseFloat(getComputedStyle(mascot).fontSize) || 16;
    geometry.bodyWidth = mascot.offsetWidth;
    geometry.bodyHeight = mascot.offsetHeight;
    geometry.springRestLength = geometry.unit * 3;
    geometry.maximumHeadDisplacement = geometry.unit * tuning.maximumHeadDisplacement;
    geometry.maximumVerticalDisplacement = geometry.maximumHeadDisplacement * 0.75;
    updateDockDocumentTarget();
  };

  const toBaseLocal = (x, y) => {
    const radians = state.rotation * Math.PI / 180;
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    return {
      x: x * cosine + y * sine,
      y: -x * sine + y * cosine
    };
  };

  const toWorldVector = (x, y) => {
    const radians = state.rotation * Math.PI / 180;
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    return {
      x: x * cosine - y * sine,
      y: x * sine + y * cosine
    };
  };

  const headAttachmentWorld = (
    offsetX = state.headOffsetX,
    offsetY = state.headOffsetY
  ) => {
    const originX = geometry.bodyWidth * 0.5;
    const originY = geometry.bodyHeight * 0.85;
    const attachmentY = geometry.unit * 7.5;
    const fromOrigin = toWorldVector(offsetX, attachmentY + offsetY - originY);

    return {
      x: state.x + originX + fromOrigin.x,
      y: state.y + originY + fromOrigin.y
    };
  };

  const basePositionForHeadAnchor = (anchorX, anchorY, offsetX = 0, offsetY = 0) => {
    const originX = geometry.bodyWidth * 0.5;
    const originY = geometry.bodyHeight * 0.85;
    const attachmentY = geometry.unit * 7.5;
    const fromOrigin = toWorldVector(offsetX, attachmentY + offsetY - originY);

    return {
      x: anchorX - originX - fromOrigin.x,
      y: anchorY - originY - fromOrigin.y
    };
  };

  const headOffsetForAnchor = (anchorX, anchorY) => {
    const originX = geometry.bodyWidth * 0.5;
    const originY = geometry.bodyHeight * 0.85;
    const attachmentY = geometry.unit * 7.5;
    const fromOrigin = toBaseLocal(
      anchorX - state.x - originX,
      anchorY - state.y - originY
    );

    return {
      x: fromOrigin.x,
      y: fromOrigin.y + originY - attachmentY
    };
  };

  const boundedHeadOffset = (x, y, limitScale = 1) => {
    const maximumX = geometry.maximumHeadDisplacement * limitScale;
    const maximumY = geometry.maximumVerticalDisplacement * limitScale;
    const magnitude = Math.hypot(x / maximumX, y / maximumY);

    if (magnitude <= 1) {
      return { x, y, clamped: false };
    }

    return {
      x: x / magnitude,
      y: y / magnitude,
      clamped: true
    };
  };

  const clampHeadState = () => {
    const bounded = boundedHeadOffset(state.headOffsetX, state.headOffsetY);

    if (bounded.clamped) {
      state.headOffsetX = bounded.x;
      state.headOffsetY = bounded.y;
      state.headVelocityX *= 0.55;
      state.headVelocityY *= 0.55;
    }

    const maximumVelocity = geometry.unit * 32;
    state.headVelocityX = clamp(state.headVelocityX, -maximumVelocity, maximumVelocity);
    state.headVelocityY = clamp(state.headVelocityY, -maximumVelocity, maximumVelocity);
  };

  const applyBodyVelocityChange = (previousVX, previousVY) => {
    const change = toBaseLocal(state.vx - previousVX, state.vy - previousVY);
    const coupling = reducedMotion.matches ? 0.12 : tuning.bodyAccelerationCoupling;

    state.headVelocityX -= change.x * coupling;
    state.headVelocityY -= change.y * coupling;
    clampHeadState();
  };

  const dimensions = () => ({
    width: geometry.bodyWidth,
    height: geometry.bodyHeight
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
    return {
      x: geometry.dockDocumentX - window.scrollX,
      y: geometry.dockDocumentY - window.scrollY
    };
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

      if (state.mode !== "loose") {
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
    const baseScaleX = numericProperty(styles, "--base-scale-x", 1);
    const baseScaleY = numericProperty(styles, "--base-scale-y", 1);
    const inlineTransform = mascot.style.transform;

    mascot.style.transform = "none";
    const neutralRect = mascot.getBoundingClientRect();
    mascot.style.transform = inlineTransform;

    state.x = neutralRect.left + bodyX;
    state.y = neutralRect.top + bodyY;
    state.rotation = bodyRotation;
    state.transientScaleX = baseScaleX - 1;
    state.transientScaleY = baseScaleY - 1;
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
      "--base-scale-x": "1",
      "--base-scale-y": "1"
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
    const pointerDX = event.clientX - centerX;
    const pointerDY = event.clientY - centerY;
    const radius = Math.max(170, Math.min(300, window.innerWidth * 0.28));
    state.pointerDistance = Math.hypot(pointerDX, pointerDY);
    state.pointerStrength = clamp(1 - state.pointerDistance / radius, 0, 1);
    state.pointerInfluenceX =
      clamp(pointerDX / radius, -1, 1) * state.pointerStrength;
    state.pointerInfluenceY =
      clamp(pointerDY / radius, -1, 1) * state.pointerStrength;

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
      state.headVelocityX += awayX * 135;
      state.headVelocityY += awayY * 95 - 25;
      state.headAngularVelocity += awayX * 115;
      clampHeadState();
      state.startleAt = now;
    }

    requestFrame();
  };

  const distanceToRect = (x, y, rect) => {
    const dx = Math.max(rect.left - x, 0, x - rect.right);
    const dy = Math.max(rect.top - y, 0, y - rect.bottom);
    return Math.hypot(dx, dy);
  };

  const grabModeForPointer = (event) => {
    const target = event.target instanceof Element ? event.target : null;

    if (target?.closest(".bobble-face")) {
      return "head";
    }

    if (target?.closest(".bobble-base")) {
      return "base";
    }

    const faceRect = face.getBoundingClientRect();
    const baseRect = base.getBoundingClientRect();
    const faceDistance = distanceToRect(event.clientX, event.clientY, faceRect);
    const baseDistance = distanceToRect(event.clientX, event.clientY, baseRect);

    return faceDistance <= baseDistance ? "head" : "base";
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
    const grabMode = grabModeForPointer(event);

    if (state.mode === "docked") {
      enterLooseMode();
    }

    const styles = getComputedStyle(mascot);
    const baseScaleX = numericProperty(styles, "--base-scale-x", 1);
    const baseScaleY = numericProperty(styles, "--base-scale-y", 1);

    state.mode = "dragging";
    state.grabMode = grabMode;
    state.pointerId = event.pointerId;
    state.dragOriginX = state.x;
    state.dragOriginY = state.y;
    state.dragPointerX = event.clientX;
    state.dragPointerY = event.clientY;
    state.transientScaleX = baseScaleX - 1;
    state.transientScaleY = baseScaleY - 1;
    state.squash = 0;
    state.vx = 0;
    state.vy = 0;
    state.angularVelocity = 0;
    state.dragVelocityX = 0;
    state.dragVelocityY = 0;
    state.dragUpdatedAt = performance.now();
    const headAnchor = headAttachmentWorld();
    state.headAnchorOriginX = headAnchor.x;
    state.headAnchorOriginY = headAnchor.y;
    state.headAnchorX = headAnchor.x;
    state.headAnchorY = headAnchor.y;
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
    const now = performance.now();
    const elapsed = Math.max((now - state.dragUpdatedAt) / 1000, 0.008);

    if (state.grabMode === "head") {
      const nextAnchorX =
        state.headAnchorOriginX + event.clientX - state.dragPointerX;
      const nextAnchorY =
        state.headAnchorOriginY + event.clientY - state.dragPointerY;
      state.dragVelocityX = (nextAnchorX - state.headAnchorX) / elapsed;
      state.dragVelocityY = (nextAnchorY - state.headAnchorY) / elapsed;
      state.headAnchorX = nextAnchorX;
      state.headAnchorY = nextAnchorY;
    } else {
      const bounds = viewportBounds();
      const previousX = state.x;
      const previousY = state.y;
      const nextX = clamp(
        state.dragOriginX + event.clientX - state.dragPointerX,
        bounds.minX,
        bounds.maxX
      );
      const nextY = clamp(
        state.dragOriginY + event.clientY - state.dragPointerY,
        bounds.minY,
        bounds.maxY
      );
      const movement = toBaseLocal(nextX - previousX, nextY - previousY);
      const velocityX = movement.x / elapsed;
      const velocityY = movement.y / elapsed;
      const motion = reducedMotion.matches ? 0.18 : 1;

      state.x = nextX;
      state.y = nextY;
      state.headOffsetX -= movement.x * tuning.dragPositionCoupling * motion;
      state.headOffsetY -= movement.y * tuning.dragPositionCoupling * motion;
      state.headVelocityX -=
        (velocityX - state.dragVelocityX) * tuning.dragVelocityCoupling * motion;
      state.headVelocityY -=
        (velocityY - state.dragVelocityY) * tuning.dragVelocityCoupling * motion;
      state.dragVelocityX = velocityX;
      state.dragVelocityY = velocityY;
      clampHeadState();
    }

    state.dragUpdatedAt = now;
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
    let nextVX = 0;
    let nextVY = 0;

    if (cancelled && state.grabMode === "head") {
      state.headVelocityX = 0;
      state.headVelocityY = 0;
    } else if (!reducedMotion.matches && state.grabMode === "head") {
      const retainedBaseX = clamp(state.vx, -tuning.maxFling, tuning.maxFling);
      const retainedBaseY = clamp(state.vy, -tuning.maxFling, tuning.maxFling);
      nextVX =
        fling.x * tuning.headReleaseTransfer +
        retainedBaseX * (1 - tuning.headReleaseTransfer);
      nextVY =
        fling.y * tuning.headReleaseTransfer +
        retainedBaseY * (1 - tuning.headReleaseTransfer);
      const relativeVelocity = toBaseLocal(fling.x - nextVX, fling.y - nextVY);
      state.headVelocityX = relativeVelocity.x;
      state.headVelocityY = relativeVelocity.y;
    } else {
      nextVX = reducedMotion.matches ? 0 : fling.x;
      nextVY = reducedMotion.matches ? 0 : fling.y;
      const localVelocity = toBaseLocal(nextVX, nextVY);
      const releaseMotion = reducedMotion.matches ? 0.12 : tuning.dragVelocityCoupling;
      state.headVelocityX -=
        (localVelocity.x - state.dragVelocityX) * releaseMotion;
      state.headVelocityY -=
        (localVelocity.y - state.dragVelocityY) * releaseMotion;
    }

    state.mode = "loose";
    state.pointerId = null;
    state.vx = nextVX;
    state.vy = nextVY;
    state.angularVelocity = reducedMotion.matches ? 0 : clamp(fling.x * 0.075, -120, 120);
    state.dragVelocityX = 0;
    state.dragVelocityY = 0;
    state.grabMode = null;
    clampHeadState();
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
      state.headAngularVelocity += clamp(state.vx * 0.025, -35, 35);
    }
  };

  const integrateLooseBody = (dt) => {
    const previousVX = state.vx;
    const previousVY = state.vy;

    if (state.mode === "returning") {
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
        applyBodyVelocityChange(previousVX, previousVY);
        returnToDock();
        return;
      }

      applyBodyVelocityChange(previousVX, previousVY);
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

    applyBodyVelocityChange(previousVX, previousVY);
  };

  const pointerTargets = () => {
    return {
      x: state.pointerInfluenceX,
      y: state.pointerInfluenceY,
      strength: state.pointerStrength
    };
  };

  const integrateHeadGrab = (dt) => {
    const previousHeadX = state.headOffsetX;
    const previousHeadY = state.headOffsetY;
    const targetBase = basePositionForHeadAnchor(
      state.headAnchorX,
      state.headAnchorY
    );
    const stiffness = reducedMotion.matches
      ? tuning.headGrabBaseStiffness * 2.2
      : tuning.headGrabBaseStiffness;
    const damping = reducedMotion.matches
      ? tuning.headGrabBaseDamping * 1.65
      : tuning.headGrabBaseDamping;
    const maximumAcceleration = reducedMotion.matches
      ? tuning.headGrabMaximumAcceleration * 0.75
      : tuning.headGrabMaximumAcceleration;
    const maximumVelocity = reducedMotion.matches
      ? tuning.headGrabMaximumVelocity * 0.55
      : tuning.headGrabMaximumVelocity;
    const limitScale = reducedMotion.matches ? 0.35 : 1;
    const maximumX = geometry.maximumHeadDisplacement * limitScale;
    const maximumY = geometry.maximumVerticalDisplacement * limitScale;
    const stepCount = Math.max(1, Math.ceil(dt / (1 / 120)));
    const step = dt / stepCount;
    let bounded = boundedHeadOffset(
      state.headOffsetX,
      state.headOffsetY,
      limitScale
    );

    for (let index = 0; index < stepCount; index += 1) {
      const acceleration = clampVectorMagnitude(
        (targetBase.x - state.x) * stiffness - state.vx * damping,
        (targetBase.y - state.y) * stiffness - state.vy * damping,
        maximumAcceleration
      );
      const velocity = clampVectorMagnitude(
        state.vx + acceleration.x * step,
        state.vy + acceleration.y * step,
        maximumVelocity
      );

      state.vx = velocity.x;
      state.vy = velocity.y;
      state.x += state.vx * step;
      state.y += state.vy * step;

      const rawOffset = headOffsetForAnchor(
        state.headAnchorX,
        state.headAnchorY
      );
      bounded = boundedHeadOffset(rawOffset.x, rawOffset.y, limitScale);

      if (bounded.clamped) {
        const constrainedBase = basePositionForHeadAnchor(
          state.headAnchorX,
          state.headAnchorY,
          bounded.x,
          bounded.y
        );
        state.x = constrainedBase.x;
        state.y = constrainedBase.y;

        const gradientX = bounded.x / (maximumX * maximumX);
        const gradientY = bounded.y / (maximumY * maximumY);
        const gradientLength = Math.hypot(gradientX, gradientY);

        if (gradientLength > 0) {
          const normal = toWorldVector(
            gradientX / gradientLength,
            gradientY / gradientLength
          );
          const followerOutwardVelocity =
            -(state.vx * normal.x + state.vy * normal.y);

          if (followerOutwardVelocity > 0) {
            state.vx += normal.x * followerOutwardVelocity;
            state.vy += normal.y * followerOutwardVelocity;
          }
        }
      }
    }

    state.headOffsetX = bounded.x;
    state.headOffsetY = bounded.y;
    state.headVelocityX = (state.headOffsetX - previousHeadX) / dt;
    state.headVelocityY = (state.headOffsetY - previousHeadY) / dt;
    state.headAngularVelocity = 0;
    clampHeadState();
  };

  const integrateHead = (dt, now) => {
    const pointer = pointerTargets();

    if (state.mode === "dragging" && state.grabMode === "head") {
      integrateHeadGrab(dt);
      return pointer;
    }

    if (
      state.mode === "dragging" &&
      state.dragUpdatedAt &&
      now - state.dragUpdatedAt > 48 &&
      (state.dragVelocityX || state.dragVelocityY)
    ) {
      const coupling = reducedMotion.matches ? 0.08 : tuning.dragVelocityCoupling;
      state.headVelocityX += state.dragVelocityX * coupling;
      state.headVelocityY += state.dragVelocityY * coupling;
      state.dragVelocityX = 0;
      state.dragVelocityY = 0;
    }

    const looseInfluence = state.mode === "docked" ? 1 : 0.35;
    const scrollInfluence = state.mode === "docked" ? 1 : 0.18;
    const scroll = clamp(state.scrollVelocity / 1400, -1, 1) * scrollInfluence;
    const motion = reducedMotion.matches ? 0.16 : 1;
    const dockedIdle = state.mode === "docked" && !reducedMotion.matches;
    const idleForceX = dockedIdle
      ? (
          Math.sin(now * 0.00073 + state.idleSeed) +
          Math.sin(now * 0.00119 + state.idleSeed * 0.61) * 0.47
        ) * tuning.idleImpulseStrength * geometry.unit
      : 0;
    const idleForceY = dockedIdle
      ? (
          Math.sin(now * 0.00091 + state.idleSeed * 1.27) +
          Math.sin(now * 0.00143 + state.idleSeed * 0.42) * 0.35
        ) * tuning.idleImpulseStrength * geometry.unit * 0.52
      : 0;
    const targetX = pointer.x * geometry.unit * 0.32 * looseInfluence * motion;
    const targetY =
      pointer.y * geometry.unit * 0.16 * looseInfluence * motion +
      scroll * geometry.unit * 0.22 * motion;
    const targetRotation =
      pointer.x * 4.5 * looseInfluence * motion +
      state.headOffsetX / geometry.maximumHeadDisplacement * 7 * motion -
      scroll * 4 +
      (dockedIdle ? Math.sin(now * 0.00067 + state.idleSeed * 0.9) * 1.1 : 0);

    const accelerationX =
      (targetX - state.headOffsetX) * tuning.lateralSpringStiffness -
      state.headVelocityX * tuning.headDamping +
      idleForceX;
    const accelerationY =
      (targetY - state.headOffsetY) * tuning.verticalSpringStiffness -
      state.headVelocityY * tuning.headDamping +
      idleForceY;
    const angularAcceleration =
      (targetRotation - state.headRotation) * tuning.angularStiffness -
      state.headAngularVelocity * tuning.angularDamping;

    state.headVelocityX += accelerationX * dt;
    state.headVelocityY += accelerationY * dt;
    state.headAngularVelocity += angularAcceleration * dt;
    state.headOffsetX += state.headVelocityX * dt;
    state.headOffsetY += state.headVelocityY * dt;
    state.headRotation += state.headAngularVelocity * dt;
    clampHeadState();

    return pointer;
  };

  const render = (now, pointer, dt) => {
    const docked = state.mode === "docked";
    const bodyX = docked ? 0 : state.x;
    const bodyY = docked ? 0 : state.y;
    const bodyRotation = docked ? 0 : state.rotation;
    const verticalSpeed = clamp(Math.abs(state.vy) / 1800, 0, 0.07);
    const squash = reducedMotion.matches ? 0 : state.squash;
    const baseScaleX = 1 + squash - verticalSpeed * 0.35 + state.transientScaleX;
    const baseScaleY = 1 - squash + verticalSpeed + state.transientScaleY;
    const springDX = state.headOffsetX;
    const springDY = state.headOffsetY - geometry.springRestLength;
    const springLength = clamp(
      Math.hypot(springDX, springDY),
      geometry.springRestLength * 0.55,
      geometry.springRestLength * 1.55
    );
    const springAngle = Math.atan2(springDX, -springDY) * 180 / Math.PI;
    const eyeX = pointer.x * 3.2;
    const eyeY = pointer.y * 2.4;
    const speedLift = docked ? 0 : clamp((window.innerHeight - state.y) / window.innerHeight, 0, 1);

    setProperties({
      "--body-x": `${bodyX.toFixed(2)}px`,
      "--body-y": `${bodyY.toFixed(2)}px`,
      "--body-rotation": `${bodyRotation.toFixed(2)}deg`,
      "--head-x": `${state.headOffsetX.toFixed(2)}px`,
      "--head-y": `${state.headOffsetY.toFixed(2)}px`,
      "--head-rotation": `${state.headRotation.toFixed(2)}deg`,
      "--spring-angle": `${springAngle.toFixed(2)}deg`,
      "--spring-length": `${springLength.toFixed(2)}px`,
      "--base-y": `${(squash * geometry.unit * 0.3).toFixed(2)}px`,
      "--base-rotation": "0deg",
      "--base-scale-x": baseScaleX.toFixed(4),
      "--base-scale-y": baseScaleY.toFixed(4),
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
        state.squash > 0.001 ||
        Math.abs(state.headOffsetX) > 0.05 ||
        Math.abs(state.headOffsetY) > 0.05 ||
        Math.abs(state.headVelocityX) > 0.1 ||
        Math.abs(state.headVelocityY) > 0.1 ||
        Math.abs(state.headAngularVelocity) > 0.1);

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
    updateGeometry();
    clampHeadState();

    if (state.mode !== "docked" && state.mode !== "returning") {
      const bounds = viewportBounds();
      state.x = clamp(state.x, bounds.minX, bounds.maxX);
      state.y = clamp(state.y, bounds.minY, bounds.maxY);
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

  updateGeometry();
  requestFrame();
})();
