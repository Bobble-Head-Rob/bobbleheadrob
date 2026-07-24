(() => {
  "use strict";

  const mascot = document.querySelector("[data-mascot]");

  if (!mascot || !window.PointerEvent) {
    return;
  }

  const face = mascot.querySelector(".bobble-face");
  const spring = mascot.querySelector(".bobble-spring");
  const base = mascot.querySelector(".bobble-base");
  const hint = mascot.querySelector("[data-mascot-hint]");
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
    grabLeverX: 0,
    grabLeverY: 0,
    grabAngularScale: 1,
    lastMovementDirection: 0,
    groundTipDirection: 0,
    groundedAge: 0,
    settleAge: 0,
    squash: 0,
    transientScaleX: 0,
    transientScaleY: 0,
    headOffsetX: 0,
    headOffsetY: 0,
    headRotation: 0,
    headVelocityX: 0,
    headVelocityY: 0,
    headAngularVelocity: 0,
    baseTilt: 0,
    baseTiltVelocity: 0,
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
    pointerType: "mouse",
    releaseIntentScale: 0,
    scrollVelocity: 0,
    dockedScrollVelocity: 0,
    dockedScrollActiveUntil: 0,
    dockedScrollDirection: 0,
    dockedScrollIdleBlend: 1,
    lastScrollY: window.scrollY,
    lastScrollAt: performance.now(),
    lastFrameAt: 0,
    returnTimer: 0,
    returnAge: 0,
    returnRotationTarget: 0,
    animationFrame: 0,
    idleSeed: Math.random() * Math.PI * 2,
    idlePulseAt: performance.now() + 2800 + Math.random() * 3000,
    hidden: document.hidden,
    hostVisible: true
  };
  const hintPhrases = ["Fling me", "Shake me", "Drop me"];
  const hintDelays = [6000, 12000, 18000];
  const hintStorageKey = "bobbleheadrob:mascot-hints";
  const hintState = {
    index: 0,
    nextEligibleAt: performance.now() + hintDelays[0],
    visible: false,
    suppressed: false,
    timer: 0,
    hideTimer: 0
  };

  const tuning = {
    gravity: 1450,
    airDrag: 0.72,
    airborneAngularDamping: 0.24,
    restitution: 0.58,
    floorFriction: 0.76,
    flingAngularCoupling: 0.88,
    grabLeverageContribution: 0.72,
    curvedReleaseContribution: 0.34,
    maximumAngularVelocity: 900,
    wallTorqueCoupling: 0.3,
    ceilingTorqueCoupling: 0.34,
    groundTorqueCoupling: 0.4,
    angularRestitution: 0.94,
    groundLinearFriction: 1.25,
    groundAngularFriction: 2.4,
    groundSlipFriction: 4.8,
    groundRollCoupling: 0.42,
    groundStabilityStiffness: 8.5,
    groundStabilityDamping: 3.7,
    invertedTipAcceleration: 48,
    contactTorqueThreshold: 40,
    collisionBounceThreshold: 90,
    maxFling: 1900,
    flingHistoryWindow: 150,
    flingReleaseGrace: 50,
    flingSampleMinimumDistance: 0.75,
    flingMinimumSpeed: 35,
    flingShortWindow: 45,
    flingMediumWindow: 85,
    flingLongWindow: 135,
    flingAverageWeight: 0.7,
    flingPeakWeight: 0.3,
    flingPeakRatio: 1.35,
    mouseFlingMultiplier: 1.12,
    returnDelay: 2300,
    returnStiffness: 16,
    returnDamping: 6.2,
    lateralSpringStiffness: 66,
    verticalSpringStiffness: 84,
    headDamping: 6.8,
    maximumHeadDisplacement: 2.6,
    angularStiffness: 44,
    angularDamping: 7.4,
    trailingTiltStiffness: 55,
    trailingTiltDamping: 7,
    trailingTiltDisplacement: 6,
    trailingTiltVelocity: 2.4,
    trailingTiltLimit: 10,
    trailingTiltMaximumVelocity: 120,
    trailingTiltDriveVelocity: 54,
    trailingTiltDriveResponse: 32,
    trailingTiltReleaseTransfer: 0.045,
    idleImpulseStrength: 10.2,
    idleVerticalForceScale: 0.61,
    idleRotationAmplitude: 1.35,
    idlePulseLateralVelocity: 44,
    idlePulseVerticalVelocity: 24,
    idlePulseAngularVelocity: 32,
    dockedScrollDisplacement: 2.15,
    dockedScrollVelocityCoupling: 0.068,
    dockedScrollImpulseLimit: 112,
    dockedScrollVelocityLimit: 2400,
    dockedScrollDisplacementLimit: 14,
    dockedScrollMinimumUnit: 16,
    dockedScrollActivityThreshold: 0.012,
    dockedScrollActivityHold: 180,
    dockedScrollIdleFadeIn: 5.5,
    dockedScrollSampleWindow: 0.12,
    dragPositionCoupling: 0.96,
    dragVelocityCoupling: 0.19,
    bodyAccelerationCoupling: 0.74,
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
    bodyOriginX: 68,
    bodyOriginY: 204,
    headWidth: 136,
    headHeight: 120,
    springWidth: 25.6,
    springPivotY: 168,
    baseWidth: 128,
    baseHeight: 72,
    collisionPadding: 2,
    springRestLength: 48,
    maximumHeadDisplacement: 36,
    maximumVerticalDisplacement: 27,
    dockDocumentX: 0,
    dockDocumentY: 0
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const degreesToRadians = Math.PI / 180;
  const radiansToDegrees = 180 / Math.PI;
  const signedAngle = (degrees) => {
    const wrapped = (degrees + 180) % 360;
    return (wrapped < 0 ? wrapped + 360 : wrapped) - 180;
  };
  const nearestEquivalentAngle = (target, reference) =>
    target + Math.round((reference - target) / 360) * 360;
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

  const scheduleIdlePulse = (now) => {
    state.idlePulseAt = now + 2800 + Math.random() * 3000;
  };

  const readHintSession = () => {
    try {
      return window.sessionStorage.getItem(hintStorageKey);
    } catch {
      return null;
    }
  };

  const writeHintSession = (value) => {
    try {
      window.sessionStorage.setItem(hintStorageKey, value);
    } catch {
      // The in-memory state still suppresses hints when storage is unavailable.
    }
  };

  const clearHintTimer = () => {
    if (hintState.timer) {
      window.clearTimeout(hintState.timer);
      hintState.timer = 0;
    }
  };

  const clearHintHideTimer = () => {
    if (hintState.hideTimer) {
      window.clearTimeout(hintState.hideTimer);
      hintState.hideTimer = 0;
    }
  };

  const hideHint = () => {
    clearHintHideTimer();
    hintState.visible = false;
    mascot.classList.remove("is-hint-visible");
  };

  const hintsAreEligible = () =>
    Boolean(hint) &&
    !hintState.suppressed &&
    hintState.index < hintPhrases.length &&
    state.mode === "docked" &&
    state.hostVisible &&
    !state.hidden;

  const scheduleHint = () => {
    clearHintTimer();

    if (!hintsAreEligible()) {
      return;
    }

    hintState.timer = window.setTimeout(
      showHint,
      Math.max(hintState.nextEligibleAt - performance.now(), 0)
    );
  };

  function showHint() {
    hintState.timer = 0;

    if (!hintsAreEligible()) {
      return;
    }

    const now = performance.now();
    hint.textContent = hintPhrases[hintState.index];
    hintState.index += 1;
    hintState.visible = true;
    mascot.classList.add("is-hint-visible");

    if (hintState.index < hintPhrases.length) {
      hintState.nextEligibleAt = now + hintDelays[hintState.index];
    }

    hintState.hideTimer = window.setTimeout(() => {
      hideHint();

      if (hintState.index >= hintPhrases.length) {
        hintState.suppressed = true;
        writeHintSession("completed");
        return;
      }

      scheduleHint();
    }, 3000);
  }

  const pauseHints = () => {
    clearHintTimer();
    hideHint();

    if (hintState.index >= hintPhrases.length) {
      hintState.suppressed = true;
      writeHintSession("completed");
    }
  };

  const suppressHints = () => {
    hintState.suppressed = true;
    clearHintTimer();
    hideHint();
    writeHintSession("interacted");
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
    geometry.bodyOriginX = geometry.bodyWidth * 0.5;
    geometry.bodyOriginY = geometry.bodyHeight * 0.85;
    geometry.headWidth = face.offsetWidth;
    geometry.headHeight = face.offsetHeight;
    geometry.springWidth = spring.offsetWidth;
    geometry.springPivotY = geometry.unit * 10.5;
    geometry.baseWidth = base.offsetWidth;
    geometry.baseHeight = base.offsetHeight;
    geometry.collisionPadding = clamp(geometry.unit * 0.14, 1.4, 2.4);
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

  const currentSpringGeometry = () => {
    const dx = state.headOffsetX;
    const dy = state.headOffsetY - geometry.springRestLength;

    return {
      angle: Math.atan2(dx, -dy) * radiansToDegrees,
      length: clamp(
        Math.hypot(dx, dy),
        geometry.springRestLength * 0.55,
        geometry.springRestLength * 1.55
      )
    };
  };

  const currentBaseTransform = () => {
    const verticalSpeed = clamp(Math.abs(state.vy) / 1800, 0, 0.07);
    const squash = reducedMotion.matches ? 0 : state.squash;

    return {
      y: squash * geometry.unit * 0.3,
      scaleX:
        1 +
        squash -
        verticalSpeed * 0.35 +
        state.transientScaleX,
      scaleY:
        1 -
        squash +
        verticalSpeed +
        state.transientScaleY
    };
  };

  const transformedBoxPoints = (
    pivotX,
    pivotY,
    width,
    height,
    rotation,
    scaleX = 1,
    scaleY = 1
  ) => {
    const padding = geometry.collisionPadding;
    const halfWidth = width * 0.5 + padding;
    const top = -height - padding;
    const bottom = padding;
    const radians = rotation * degreesToRadians;
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    return [
      { x: -halfWidth, y: top },
      { x: halfWidth, y: top },
      { x: halfWidth, y: bottom },
      { x: -halfWidth, y: bottom }
    ].map((point) => {
      const scaledX = point.x * scaleX;
      const scaledY = point.y * scaleY;

      return {
        x: pivotX + scaledX * cosine - scaledY * sine,
        y: pivotY + scaledX * sine + scaledY * cosine
      };
    });
  };

  const localVisualEnvelope = () => {
    const springGeometry = currentSpringGeometry();
    const baseTransform = currentBaseTransform();
    const headPivotX = geometry.bodyOriginX + state.headOffsetX;
    const headPivotY = geometry.headHeight + state.headOffsetY;
    const basePivotY = geometry.bodyHeight + baseTransform.y;

    return [
      ...transformedBoxPoints(
        headPivotX,
        headPivotY,
        geometry.headWidth,
        geometry.headHeight,
        -4 + state.headRotation
      ),
      ...transformedBoxPoints(
        geometry.bodyOriginX,
        geometry.springPivotY,
        geometry.springWidth,
        springGeometry.length,
        springGeometry.angle
      ),
      ...transformedBoxPoints(
        geometry.bodyOriginX,
        basePivotY,
        geometry.baseWidth,
        geometry.baseHeight,
        state.baseTilt,
        baseTransform.scaleX,
        baseTransform.scaleY
      )
    ];
  };

  const rotatedGeometry = (rotation = state.rotation) => {
    const pivotX = geometry.bodyOriginX;
    const pivotY = geometry.bodyOriginY;
    const centerX = geometry.bodyWidth * 0.5;
    const centerY = geometry.bodyHeight * 0.5;
    const radians = rotation * degreesToRadians;
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);
    const points = localVisualEnvelope().map((point) => {
      const localX = point.x - pivotX;
      const localY = point.y - pivotY;

      return {
        x: pivotX + localX * cosine - localY * sine,
        y: pivotY + localX * sine + localY * cosine
      };
    });
    const worldCenter = {
      x:
        pivotX +
        (centerX - pivotX) * cosine -
        (centerY - pivotY) * sine,
      y:
        pivotY +
        (centerX - pivotX) * sine +
        (centerY - pivotY) * cosine
    };
    const support = (axis, direction) => {
      const extreme = Math.max(
        ...points.map((point) => point[axis] * direction)
      );
      const contacts = points.filter(
        (point) => Math.abs(point[axis] * direction - extreme) < 0.01
      );

      return {
        x:
          contacts.reduce((total, point) => total + point.x, 0) /
          contacts.length,
        y:
          contacts.reduce((total, point) => total + point.y, 0) /
          contacts.length
      };
    };

    return {
      minX: Math.min(...points.map((point) => point.x)),
      maxX: Math.max(...points.map((point) => point.x)),
      minY: Math.min(...points.map((point) => point.y)),
      maxY: Math.max(...points.map((point) => point.y)),
      center: worldCenter,
      left: support("x", -1),
      right: support("x", 1),
      top: support("y", -1),
      bottom: support("y", 1)
    };
  };

  const viewportBounds = (rotation = state.rotation) => {
    const extents = rotatedGeometry(rotation);

    return {
      minX: edge - extents.minX,
      maxX: Math.max(edge - extents.minX, window.innerWidth - edge - extents.maxX),
      minY: edge - extents.minY,
      maxY: Math.max(edge - extents.minY, window.innerHeight - edge - extents.maxY),
      extents
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
      state.returnRotationTarget = nearestEquivalentAngle(0, state.rotation);
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
    state.baseTilt = 0;
    state.baseTiltVelocity = 0;
    state.groundedAge = 0;
    state.settleAge = 0;
    state.groundTipDirection = 0;
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
    scheduleHint();
    requestFrame();
  };

  const addSample = (event, force = false, now = performance.now()) => {
    if (
      !Number.isFinite(event.clientX) ||
      !Number.isFinite(event.clientY) ||
      !Number.isFinite(now)
    ) {
      return;
    }

    const last = state.samples[state.samples.length - 1];
    const distance = last
      ? Math.hypot(event.clientX - last.x, event.clientY - last.y)
      : Infinity;

    if (force || distance >= tuning.flingSampleMinimumDistance) {
      state.samples.push({ x: event.clientX, y: event.clientY, time: now });
    }

    state.samples = state.samples
      .filter((sample) => now - sample.time <= tuning.flingHistoryWindow)
      .slice(-18);
  };

  const velocityBetween = (first, last) => {
    const elapsed = (last.time - first.time) / 1000;

    if (elapsed < 0.012) {
      return null;
    }

    const x = (last.x - first.x) / elapsed;
    const y = (last.y - first.y) / elapsed;
    return { x, y, speed: Math.hypot(x, y) };
  };

  const estimateFlingVelocity = (samples, releaseAt, pointerType) => {
    const cleanSamples = [];

    samples.forEach((sample) => {
      if (
        !Number.isFinite(sample.x) ||
        !Number.isFinite(sample.y) ||
        !Number.isFinite(sample.time) ||
        releaseAt - sample.time > tuning.flingHistoryWindow
      ) {
        return;
      }

      const previous = cleanSamples[cleanSamples.length - 1];
      if (
        previous &&
        Math.hypot(sample.x - previous.x, sample.y - previous.y) <
          tuning.flingSampleMinimumDistance
      ) {
        return;
      }

      cleanSamples.push(sample);
    });

    if (cleanSamples.length < 2) {
      return { x: 0, y: 0, intentScale: 0 };
    }

    const last = cleanSamples[cleanSamples.length - 1];
    const releaseAge = Math.max(releaseAt - last.time, 0);
    const graceProgress = clamp(
      1 -
        (releaseAge - tuning.flingReleaseGrace) /
          (tuning.flingHistoryWindow - tuning.flingReleaseGrace),
      0,
      1
    );
    const intentScale =
      releaseAge <= tuning.flingReleaseGrace
        ? 1
        : graceProgress * graceProgress;
    const windows = [
      { duration: tuning.flingShortWindow, weight: 0.5 },
      { duration: tuning.flingMediumWindow, weight: 0.32 },
      { duration: tuning.flingLongWindow, weight: 0.18 }
    ];
    const candidates = [];

    windows.forEach(({ duration, weight }) => {
      const cutoff = last.time - duration;
      let first = cleanSamples[0];

      for (let index = cleanSamples.length - 2; index >= 0; index -= 1) {
        first = cleanSamples[index];
        if (first.time <= cutoff) {
          break;
        }
      }

      const velocity = velocityBetween(first, last);
      if (velocity) {
        candidates.push({ ...velocity, weight });
      }
    });

    if (!candidates.length || intentScale <= 0) {
      return { x: 0, y: 0, intentScale: 0 };
    }

    const directionVelocity = candidates[0];
    if (directionVelocity.speed < tuning.flingMinimumSpeed) {
      return { x: 0, y: 0, intentScale };
    }

    const directionX = directionVelocity.x / directionVelocity.speed;
    const directionY = directionVelocity.y / directionVelocity.speed;
    let averageX = 0;
    let averageY = 0;
    let averageWeight = 0;

    candidates.forEach((candidate) => {
      const coherence =
        candidate.speed > 0
          ? (candidate.x * directionX + candidate.y * directionY) /
            candidate.speed
          : 0;

      if (coherence <= 0.35) {
        return;
      }

      const weight = candidate.weight * coherence;
      averageX += candidate.x * weight;
      averageY += candidate.y * weight;
      averageWeight += weight;
    });

    if (!averageWeight) {
      return { x: 0, y: 0, intentScale };
    }

    averageX /= averageWeight;
    averageY /= averageWeight;
    const averageSpeed = Math.hypot(averageX, averageY);
    let peak = { x: averageX, y: averageY, speed: averageSpeed };

    for (let lastIndex = 1; lastIndex < cleanSamples.length; lastIndex += 1) {
      for (let firstIndex = 0; firstIndex < lastIndex; firstIndex += 1) {
        const elapsed =
          cleanSamples[lastIndex].time - cleanSamples[firstIndex].time;
        if (
          elapsed < 24 ||
          elapsed > 65 ||
          last.time - cleanSamples[lastIndex].time > 95
        ) {
          continue;
        }

        const velocity = velocityBetween(
          cleanSamples[firstIndex],
          cleanSamples[lastIndex]
        );
        if (!velocity || velocity.speed <= peak.speed) {
          continue;
        }

        const coherence =
          (velocity.x * directionX + velocity.y * directionY) / velocity.speed;
        if (coherence > 0.55) {
          peak = velocity;
        }
      }
    }

    const peakLimit = Math.max(
      averageSpeed * tuning.flingPeakRatio,
      directionVelocity.speed * 1.15
    );
    if (peak.speed > peakLimit) {
      const peakScale = peakLimit / peak.speed;
      peak = {
        x: peak.x * peakScale,
        y: peak.y * peakScale,
        speed: peakLimit
      };
    }

    const pointerMultiplier =
      pointerType === "mouse" ? tuning.mouseFlingMultiplier : 1;
    let x =
      (
        averageX * tuning.flingAverageWeight +
        peak.x * tuning.flingPeakWeight
      ) *
      intentScale *
      pointerMultiplier;
    let y =
      (
        averageY * tuning.flingAverageWeight +
        peak.y * tuning.flingPeakWeight
      ) *
      intentScale *
      pointerMultiplier;
    const speed = Math.hypot(x, y);

    if (speed < tuning.flingMinimumSpeed) {
      return { x: 0, y: 0, intentScale };
    }

    if (speed > tuning.maxFling) {
      const scale = tuning.maxFling / speed;
      x *= scale;
      y *= scale;
    }

    return { x, y, intentScale };
  };

  const flingVelocity = (releaseAt) => {
    const fling = estimateFlingVelocity(
      state.samples,
      releaseAt,
      state.pointerType
    );
    state.releaseIntentScale = fling.intentScale;
    return { x: fling.x, y: fling.y };
  };

  const curvedReleaseVelocity = () => {
    if (state.samples.length < 3) {
      return 0;
    }

    let weightedTurn = 0;
    let totalWeight = 0;

    for (let index = 2; index < state.samples.length; index += 1) {
      const first = state.samples[index - 2];
      const middle = state.samples[index - 1];
      const last = state.samples[index];
      const firstElapsed = Math.max((middle.time - first.time) / 1000, 0.008);
      const lastElapsed = Math.max((last.time - middle.time) / 1000, 0.008);
      const firstVelocity = {
        x: (middle.x - first.x) / firstElapsed,
        y: (middle.y - first.y) / firstElapsed
      };
      const lastVelocity = {
        x: (last.x - middle.x) / lastElapsed,
        y: (last.y - middle.y) / lastElapsed
      };
      const firstSpeed = Math.hypot(firstVelocity.x, firstVelocity.y);
      const lastSpeed = Math.hypot(lastVelocity.x, lastVelocity.y);

      if (firstSpeed < 40 || lastSpeed < 40) {
        continue;
      }

      const cross =
        firstVelocity.x * lastVelocity.y -
        firstVelocity.y * lastVelocity.x;
      const dot =
        firstVelocity.x * lastVelocity.x +
        firstVelocity.y * lastVelocity.y;
      const turn = Math.atan2(cross, dot);
      const elapsed = Math.max((last.time - first.time) / 2000, 0.012);
      const weight = clamp((firstSpeed + lastSpeed) / (2 * tuning.maxFling), 0, 1);

      weightedTurn += turn / elapsed * radiansToDegrees * weight;
      totalWeight += weight;
    }

    return totalWeight ? weightedTurn / totalWeight : 0;
  };

  const releaseAngularVelocity = (fling) => {
    const localFling = toBaseLocal(fling.x, fling.y);
    const radiusSquared = Math.max(
      state.grabLeverX * state.grabLeverX +
        state.grabLeverY * state.grabLeverY,
      geometry.unit * geometry.unit * 0.8
    );
    const leverageVelocity =
      (
        state.grabLeverX * localFling.y -
        state.grabLeverY * localFling.x
      ) /
      radiusSquared *
      radiansToDegrees;
    const curvedVelocity = curvedReleaseVelocity() * state.releaseIntentScale;

    return clamp(
      (
        leverageVelocity *
          tuning.grabLeverageContribution *
          state.grabAngularScale +
        curvedVelocity * tuning.curvedReleaseContribution
      ) * tuning.flingAngularCoupling,
      -tuning.maximumAngularVelocity,
      tuning.maximumAngularVelocity
    );
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

    suppressHints();
    event.preventDefault();
    clearReturnTimer();
    const grabMode = grabModeForPointer(event);

    if (state.mode === "docked") {
      enterLooseMode();
    }

    const styles = getComputedStyle(mascot);
    const baseScaleX = numericProperty(styles, "--base-scale-x", 1);
    const baseScaleY = numericProperty(styles, "--base-scale-y", 1);
    const bodyGeometry = rotatedGeometry();
    const bodyCenterX = state.x + bodyGeometry.center.x;
    const bodyCenterY = state.y + bodyGeometry.center.y;
    const grabLever = toBaseLocal(
      event.clientX - bodyCenterX,
      event.clientY - bodyCenterY
    );

    state.mode = "dragging";
    state.grabMode = grabMode;
    state.pointerId = event.pointerId;
    state.pointerType = event.pointerType || "mouse";
    state.releaseIntentScale = 0;
    state.dragOriginX = state.x;
    state.dragOriginY = state.y;
    state.dragPointerX = event.clientX;
    state.dragPointerY = event.clientY;
    state.transientScaleX = baseScaleX - 1;
    state.transientScaleY = baseScaleY - 1;
    state.grabLeverX = grabLever.x;
    state.grabLeverY = grabLever.y;
    state.grabAngularScale = grabMode === "head" ? 1.12 : 0.84;
    state.groundedAge = 0;
    state.settleAge = 0;
    state.groundTipDirection = 0;
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
    addSample(event, true);
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
      if (Math.abs(state.dragVelocityX) > 4) {
        state.lastMovementDirection = Math.sign(state.dragVelocityX);
      }

      if (!reducedMotion.matches) {
        const localVelocity = toBaseLocal(
          state.dragVelocityX,
          state.dragVelocityY
        );
        const targetTiltVelocity =
          clamp(
            localVelocity.x / (geometry.unit * 18),
            -1,
            1
          ) * tuning.trailingTiltDriveVelocity;
        const tiltBlend =
          1 - Math.exp(-tuning.trailingTiltDriveResponse * elapsed);

        state.baseTiltVelocity +=
          (targetTiltVelocity - state.baseTiltVelocity) * tiltBlend;
      }

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
      if (Math.abs(nextX - previousX) > 0.1) {
        state.lastMovementDirection = Math.sign(nextX - previousX);
      }
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

    const releaseAt = performance.now();

    if (!cancelled) {
      addSample(event, false, releaseAt);
    }

    state.releaseIntentScale = 0;
    const fling = cancelled ? { x: 0, y: 0 } : flingVelocity(releaseAt);
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
      const localFling = toBaseLocal(fling.x, fling.y);

      state.headVelocityX = relativeVelocity.x;
      state.headVelocityY = relativeVelocity.y;
      state.baseTiltVelocity += clamp(
        localFling.x * tuning.trailingTiltReleaseTransfer,
        -tuning.trailingTiltMaximumVelocity * 0.65,
        tuning.trailingTiltMaximumVelocity * 0.65
      );
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
    state.angularVelocity =
      reducedMotion.matches || cancelled ? 0 : releaseAngularVelocity(fling);
    if (Math.abs(nextVX) > 4) {
      state.lastMovementDirection = Math.sign(nextVX);
    }
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

  const applyContactTorque = (
    normalX,
    normalY,
    contact,
    geometryAtImpact,
    coupling
  ) => {
    if (reducedMotion.matches) {
      state.angularVelocity = 0;
      return 0;
    }

    const radius = Math.max(
      Math.hypot(
        contact.x - geometryAtImpact.center.x,
        contact.y - geometryAtImpact.center.y
      ),
      geometry.unit * 2
    );
    const leverX = contact.x - geometryAtImpact.center.x;
    const leverY = contact.y - geometryAtImpact.center.y;
    const angularRadians = state.angularVelocity * degreesToRadians;
    const contactVelocityX = state.vx - angularRadians * leverY;
    const contactVelocityY = state.vy + angularRadians * leverX;
    const normalSpeed = Math.max(
      0,
      -(contactVelocityX * normalX + contactVelocityY * normalY)
    );
    if (normalSpeed < tuning.contactTorqueThreshold) {
      return normalSpeed;
    }

    const tangentX = -normalY;
    const tangentY = normalX;
    const tangentialSpeed =
      contactVelocityX * tangentX + contactVelocityY * tangentY;
    const normalizedLever =
      (leverX * normalY - leverY * normalX) / radius;
    const angularImpulse =
      (
        normalSpeed * normalizedLever +
        tangentialSpeed * 0.28
      ) * coupling;

    state.angularVelocity = clamp(
      state.angularVelocity * tuning.angularRestitution + angularImpulse,
      -tuning.maximumAngularVelocity,
      tuning.maximumAngularVelocity
    );

    return normalSpeed;
  };

  const collideWithViewport = () => {
    const bounds = viewportBounds();
    const extents = bounds.extents;
    let impact = 0;
    let grounded = false;

    if (state.x <= bounds.minX) {
      state.x = bounds.minX;
      const contactImpact = applyContactTorque(
        1,
        0,
        extents.left,
        extents,
        tuning.wallTorqueCoupling
      );
      impact = Math.max(impact, contactImpact);
      if (state.vx < 0) {
        state.vx *= -tuning.restitution;
      }
    } else if (state.x >= bounds.maxX) {
      state.x = bounds.maxX;
      const contactImpact = applyContactTorque(
        -1,
        0,
        extents.right,
        extents,
        tuning.wallTorqueCoupling
      );
      impact = Math.max(impact, contactImpact);
      if (state.vx > 0) {
        state.vx *= -tuning.restitution;
      }
    }

    if (state.y <= bounds.minY) {
      state.y = bounds.minY;
      const contactImpact = applyContactTorque(
        0,
        1,
        extents.top,
        extents,
        tuning.ceilingTorqueCoupling
      );
      impact = Math.max(impact, contactImpact);
      if (state.vy < 0) {
        state.vy *= -tuning.restitution;
      }
    } else if (state.y >= bounds.maxY - 1.5) {
      state.y = bounds.maxY;
      const contactImpact = applyContactTorque(
        0,
        -1,
        extents.bottom,
        extents,
        tuning.groundTorqueCoupling
      );
      impact = Math.max(impact, contactImpact);

      if (state.vy > tuning.collisionBounceThreshold) {
        state.vy *= -tuning.restitution;
        state.vx *= tuning.floorFriction;
      } else if (state.vy >= 0) {
        grounded = true;
        state.vy = 0;
      }
    }

    if (impact > 80 && !reducedMotion.matches) {
      state.squash = clamp(impact / 1560, 0.05, 0.245);
      state.headAngularVelocity += clamp(state.vx * 0.03, -42, 42);
    }

    return { grounded, impact };
  };

  const chooseGroundTipDirection = () => {
    if (Math.abs(state.angularVelocity) > 2) {
      return Math.sign(state.angularVelocity);
    }

    if (Math.abs(state.vx) > 3) {
      return Math.sign(state.vx);
    }

    if (state.lastMovementDirection) {
      return state.lastMovementDirection;
    }

    return 1;
  };

  const groundRestTarget = () => {
    const orientation = signedAngle(state.rotation);

    if (Math.abs(orientation) > 135) {
      if (!state.groundTipDirection) {
        state.groundTipDirection = chooseGroundTipDirection();
      }

      const sideTarget = state.groundTipDirection > 0 ? 270 : 90;
      return nearestEquivalentAngle(sideTarget, state.rotation);
    }

    state.groundTipDirection = 0;
    const candidates = [-90, 0, 90].map((target) =>
      nearestEquivalentAngle(target, state.rotation)
    );

    return candidates.reduce((nearest, target) =>
      Math.abs(target - state.rotation) < Math.abs(nearest - state.rotation)
        ? target
        : nearest
    );
  };

  const integrateGroundContact = (dt) => {
    const target = groundRestTarget();
    const orientation = signedAngle(state.rotation);
    const inverted = Math.abs(orientation) > 135;
    const angularAcceleration =
      (target - state.rotation) * tuning.groundStabilityStiffness -
      state.angularVelocity * tuning.groundStabilityDamping +
      (inverted ? state.groundTipDirection * tuning.invertedTipAcceleration : 0);
    const rollRadius = Math.max(geometry.unit * 3.2, 32);
    const rollingSpeed =
      state.angularVelocity * degreesToRadians * rollRadius;
    const slip = state.vx - rollingSpeed;
    const slipTransfer =
      slip * (1 - Math.exp(-tuning.groundSlipFriction * dt));

    state.vx -= slipTransfer * 0.58;
    state.angularVelocity +=
      slipTransfer /
      rollRadius *
      radiansToDegrees *
      tuning.groundRollCoupling;
    state.angularVelocity += angularAcceleration * dt;
    state.vx *= Math.exp(-tuning.groundLinearFriction * dt);
    state.angularVelocity *= Math.exp(-tuning.groundAngularFriction * dt);
    state.angularVelocity = clamp(
      state.angularVelocity,
      -tuning.maximumAngularVelocity,
      tuning.maximumAngularVelocity
    );

    if (Math.abs(state.vx) > 3) {
      state.lastMovementDirection = Math.sign(state.vx);
    }

    return target;
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
      const rotationError = state.returnRotationTarget - state.rotation;
      state.vx += ax * dt;
      state.vy += ay * dt;
      state.x += state.vx * dt;
      state.y += state.vy * dt;
      state.angularVelocity +=
        (rotationError * 18 - state.angularVelocity * 7) * dt;
      state.rotation += state.angularVelocity * dt;
      state.returnAge += dt;

      const distance = Math.hypot(target.x - state.x, target.y - state.y);
      const speed = Math.hypot(state.vx, state.vy);
      const angularDistance = Math.abs(
        state.returnRotationTarget - state.rotation
      );

      if (
        state.returnAge > 0.5 &&
        distance < 0.8 &&
        speed < 8 &&
        angularDistance < 1.2 &&
        Math.abs(state.angularVelocity) < 7
      ) {
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
    state.angularVelocity *= Math.exp(-tuning.airborneAngularDamping * dt);
    state.x += state.vx * dt;
    state.y += state.vy * dt;
    state.rotation += state.angularVelocity * dt;

    if (Math.abs(state.rotation) > 36000) {
      state.rotation = signedAngle(state.rotation);
    }

    const collision = collideWithViewport();
    let restTarget = null;

    if (collision.grounded) {
      state.groundedAge += dt;
      restTarget = integrateGroundContact(dt);
      const restError = Math.abs(restTarget - state.rotation);
      const stable =
        state.groundedAge > 0.24 &&
        restError < 3 &&
        Math.abs(state.vx) < 7 &&
        Math.abs(state.vy) < 8 &&
        Math.abs(state.angularVelocity) < 3;

      state.settleAge = stable ? state.settleAge + dt : 0;

      if (state.settleAge > 0.32) {
        state.vx = 0;
        state.vy = 0;
        state.angularVelocity = 0;
        state.rotation = restTarget;

        if (!state.returnTimer) {
          scheduleReturn();
        }
      }
    } else {
      state.groundedAge = 0;
      state.settleAge = 0;
      state.groundTipDirection = 0;
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

  const integrateBaseTilt = (dt) => {
    if (reducedMotion.matches) {
      state.baseTilt = 0;
      state.baseTiltVelocity = 0;
      return;
    }

    if (state.mode === "dragging" && state.grabMode === "base") {
      return;
    }

    let targetTilt = 0;

    if (state.mode === "dragging" && state.grabMode === "head") {
      const displacement = clamp(
        state.headOffsetX / geometry.maximumHeadDisplacement,
        -1,
        1
      );
      const relativeVelocity = clamp(
        state.headVelocityX / (geometry.unit * 18),
        -1,
        1
      );

      targetTilt = clamp(
        displacement * tuning.trailingTiltDisplacement +
          relativeVelocity * tuning.trailingTiltVelocity,
        -tuning.trailingTiltLimit,
        tuning.trailingTiltLimit
      );
    }

    const acceleration =
      (targetTilt - state.baseTilt) * tuning.trailingTiltStiffness -
      state.baseTiltVelocity * tuning.trailingTiltDamping;

    state.baseTiltVelocity = clamp(
      state.baseTiltVelocity + acceleration * dt,
      -tuning.trailingTiltMaximumVelocity,
      tuning.trailingTiltMaximumVelocity
    );
    state.baseTilt += state.baseTiltVelocity * dt;

    if (Math.abs(state.baseTilt) > tuning.trailingTiltLimit) {
      state.baseTilt = clamp(
        state.baseTilt,
        -tuning.trailingTiltLimit,
        tuning.trailingTiltLimit
      );

      if (Math.sign(state.baseTiltVelocity) === Math.sign(state.baseTilt)) {
        state.baseTiltVelocity *= -0.18;
      }
    }
  };

  const integrateHead = (dt, now) => {
    const pointer = pointerTargets();

    if (state.mode === "dragging" && state.grabMode === "head") {
      integrateHeadGrab(dt);
      integrateBaseTilt(dt);
      return pointer;
    }

    integrateBaseTilt(dt);

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
    const dockedScroll =
      state.mode === "docked"
        ? clamp(state.dockedScrollVelocity / 1400, -1, 1)
        : 0;
    const dockedScrollActive =
      state.mode === "docked" &&
      now < state.dockedScrollActiveUntil;

    if (dockedScrollActive) {
      state.dockedScrollIdleBlend = 0;
    } else {
      state.dockedScrollIdleBlend +=
        (1 - state.dockedScrollIdleBlend) *
        (1 - Math.exp(-tuning.dockedScrollIdleFadeIn * dt));
    }

    const scrollIdleBlend = state.dockedScrollIdleBlend;
    const motion = reducedMotion.matches ? 0.16 : 1;
    const dockedIdle = state.mode === "docked" && !reducedMotion.matches;

    if (dockedIdle && now >= state.idlePulseAt) {
      if (dockedScrollActive) {
        scheduleIdlePulse(now);
      } else {
        const direction = Math.sin(now * 0.0017 + state.idleSeed) >= 0 ? 1 : -1;
        const emphasis = 0.84 + Math.random() * 0.32;

        state.headVelocityX += direction * tuning.idlePulseLateralVelocity * emphasis;
        state.headVelocityY -=
          tuning.idlePulseVerticalVelocity * (0.8 + Math.random() * 0.4);
        state.headAngularVelocity +=
          direction * tuning.idlePulseAngularVelocity * emphasis;
        scheduleIdlePulse(now);
      }
    }

    const idleForceX = dockedIdle
      ? (
          Math.sin(now * 0.00073 + state.idleSeed) +
          Math.sin(now * 0.00119 + state.idleSeed * 0.61) * 0.47 +
          Math.sin(now * 0.00031 + state.idleSeed * 1.83) * 0.22
        ) * tuning.idleImpulseStrength * geometry.unit * scrollIdleBlend
      : 0;
    const idleForceY = dockedIdle
      ? (
          Math.sin(now * 0.00091 + state.idleSeed * 1.27) +
          Math.sin(now * 0.00143 + state.idleSeed * 0.42) * 0.35 +
          Math.sin(now * 0.00047 + state.idleSeed * 1.61) * 0.18
        ) *
          tuning.idleImpulseStrength *
          geometry.unit *
          tuning.idleVerticalForceScale *
          scrollIdleBlend
      : 0;
    const targetX = pointer.x * geometry.unit * 0.32 * looseInfluence * motion;
    const dockedScrollUnit = Math.max(
      geometry.unit,
      tuning.dockedScrollMinimumUnit
    );
    const targetY =
      pointer.y * geometry.unit * 0.16 * looseInfluence * motion +
      (
        state.mode === "docked"
          ? dockedScroll * dockedScrollUnit * tuning.dockedScrollDisplacement
          : scroll * geometry.unit * 0.22
      ) * motion;
    const trailingHeadTilt =
      state.mode === "dragging" && state.grabMode === "base" && !reducedMotion.matches
        ? clamp(
            state.headVelocityX / (geometry.unit * 18),
            -1,
            1
          ) * tuning.trailingTiltVelocity
        : 0;
    const targetRotation =
      clamp(
        pointer.x * 4.5 * looseInfluence * motion +
          state.headOffsetX / geometry.maximumHeadDisplacement * 7 * motion +
          trailingHeadTilt -
          scroll * 4 +
          (
            dockedIdle
              ? (
                  Math.sin(now * 0.00067 + state.idleSeed * 0.9) +
                  Math.sin(now * 0.00107 + state.idleSeed * 1.37) * 0.24
                ) * tuning.idleRotationAmplitude
              : 0
          ),
        -tuning.trailingTiltLimit,
        tuning.trailingTiltLimit
      );

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

    if (dockedScrollActive) {
      const scrollDisplacementLimit = tuning.dockedScrollDisplacementLimit;

      if (state.dockedScrollDirection < 0 && state.headOffsetY > 0) {
        state.headOffsetY = 0;
        state.headVelocityY = Math.min(state.headVelocityY, 0);
      } else if (
        state.dockedScrollDirection < 0 &&
        state.headOffsetY < -scrollDisplacementLimit
      ) {
        state.headOffsetY = -scrollDisplacementLimit;
        state.headVelocityY = Math.max(state.headVelocityY, 0);
      } else if (state.dockedScrollDirection > 0 && state.headOffsetY < 0) {
        state.headOffsetY = 0;
        state.headVelocityY = Math.max(state.headVelocityY, 0);
      } else if (
        state.dockedScrollDirection > 0 &&
        state.headOffsetY > scrollDisplacementLimit
      ) {
        state.headOffsetY = scrollDisplacementLimit;
        state.headVelocityY = Math.min(state.headVelocityY, 0);
      }
    } else {
      state.dockedScrollDirection = 0;
    }

    clampHeadState();

    return pointer;
  };

  const resolvePostHeadCollision = () => {
    if (state.mode !== "loose" || reducedMotion.matches) {
      return;
    }

    const bounds = viewportBounds();
    const outside =
      state.x < bounds.minX - 0.05 ||
      state.x > bounds.maxX + 0.05 ||
      state.y < bounds.minY - 0.05 ||
      state.y > bounds.maxY + 0.05;

    if (!outside) {
      return;
    }

    const previousVX = state.vx;
    const previousVY = state.vy;
    collideWithViewport();
    applyBodyVelocityChange(previousVX, previousVY);
  };

  const render = (now, pointer, dt) => {
    const docked = state.mode === "docked";
    const bodyX = docked ? 0 : state.x;
    const bodyY = docked ? 0 : state.y;
    const bodyRotation = docked ? 0 : state.rotation;
    const squash = reducedMotion.matches ? 0 : state.squash;
    const baseTransform = currentBaseTransform();
    const springGeometry = currentSpringGeometry();
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
      "--spring-angle": `${springGeometry.angle.toFixed(2)}deg`,
      "--spring-length": `${springGeometry.length.toFixed(2)}px`,
      "--base-y": `${baseTransform.y.toFixed(2)}px`,
      "--base-rotation": `${state.baseTilt.toFixed(2)}deg`,
      "--base-scale-x": baseTransform.scaleX.toFixed(4),
      "--base-scale-y": baseTransform.scaleY.toFixed(4),
      "--shadow-x": `${clamp(state.vx * -0.008, -12, 12).toFixed(2)}px`,
      "--shadow-y": `${(12 + speedLift * 12).toFixed(2)}px`,
      "--shadow-blur": `${(18 + speedLift * 14).toFixed(2)}px`,
      "--eye-x": `${eyeX.toFixed(2)}px`,
      "--eye-y": `${eyeY.toFixed(2)}px`
    });
    state.squash *= Math.exp(-7.4 * dt);

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
    state.dockedScrollVelocity *= Math.exp(-6 * dt);

    integrateLooseBody(dt);
    const pointer = integrateHead(dt, now);
    resolvePostHeadCollision();
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
        Math.abs(state.headAngularVelocity) > 0.1 ||
        Math.abs(state.baseTilt) > 0.05 ||
        Math.abs(state.baseTiltVelocity) > 0.1);

    if (state.mode !== "loose" || looseStillMoving || !state.returnTimer) {
      requestFrame();
    }
  }

  const onScroll = () => {
    const now = performance.now();
    const elapsed = Math.max((now - state.lastScrollAt) / 1000, 0.016);
    const nextY = window.scrollY;
    const scrollDelta = nextY - state.lastScrollY;
    state.scrollVelocity = clamp(scrollDelta / elapsed, -2400, 2400);

    if (state.mode === "docked" && state.hostVisible && !state.hidden) {
      const previousDockedVelocity = state.dockedScrollVelocity;
      const sampleElapsed = Math.min(elapsed, tuning.dockedScrollSampleWindow);
      state.dockedScrollVelocity = clamp(
        scrollDelta / sampleElapsed,
        -tuning.dockedScrollVelocityLimit,
        tuning.dockedScrollVelocityLimit
      );
      const scrollActivity =
        Math.abs(state.dockedScrollVelocity) / 1400;

      if (scrollActivity >= tuning.dockedScrollActivityThreshold) {
        state.dockedScrollActiveUntil =
          now + tuning.dockedScrollActivityHold;
        state.dockedScrollDirection = Math.sign(scrollDelta);
        state.dockedScrollIdleBlend = 0;
        scheduleIdlePulse(now);
      }

      const motion = reducedMotion.matches ? 0.08 : 1;
      const impulse = clamp(
        (
          state.dockedScrollVelocity -
          previousDockedVelocity
        ) * tuning.dockedScrollVelocityCoupling,
        -tuning.dockedScrollImpulseLimit,
        tuning.dockedScrollImpulseLimit
      );

      state.headVelocityY += impulse * motion;
      clampHeadState();
    } else {
      state.dockedScrollVelocity = 0;
      state.dockedScrollActiveUntil = 0;
      state.dockedScrollDirection = 0;
    }

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

    if (state.hidden) {
      pauseHints();
    } else {
      scheduleHint();
      requestFrame();
    }
  };

  const onMotionPreferenceChange = () => {
    if (reducedMotion.matches && state.mode === "loose") {
      state.vx = 0;
      state.vy = 0;
      state.angularVelocity = 0;
      state.baseTilt = 0;
      state.baseTiltVelocity = 0;
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
        scheduleHint();
        requestFrame();
      } else {
        pauseHints();
      }
    });

    hostObserver.observe(mascot.closest(".hero-object"));
  }

  updateGeometry();
  hintState.suppressed = Boolean(readHintSession());
  scheduleHint();
  requestFrame();
})();
