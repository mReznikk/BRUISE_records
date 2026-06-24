// JSON file containing the carousel items. Each item supports:
// { "title": "...", "subtitle": "...", "image": "images/file.jpg" }.
let DATA_URL = "./carousel.json";

let EDGE_DEAD_ZONE = 10;

// Delay before switching from one hovered cover to another. This smooths movement
// across stacked/overlapping covers without making tap selection feel slow.
let SWITCH_DELAY_MS = 160;

// Container the carousel mounts into. Embedding into the BRUISE artists page means
// the widget lives inside this contained section instead of taking over <body>.
let root = document.querySelector(".carousel-section");

// Load and normalize the JSON data. The old "name" field is kept as a fallback so
// older carousel.json files still work.
let data = await fetch(DATA_URL).then((res) => res.json());
let albums = (data.albums || []).map((item) => ({
  title: item.title || item.name || "",
  subtitle: item.subtitle || "",
  image: item.image,
}));

// DOM nodes created by the script. The page only needs to include carousel.css, an
// empty .carousel-section, and this module; the stage, stack, label, and covers are
// generated here. The label is appended inside the sticky stage so it rides with the
// pinned carousel and clears once the section scrolls out of view.
let stage = root.appendChild(document.createElement("div"));
let stack = stage.appendChild(document.createElement("div"));
let label = stage.appendChild(document.createElement("div"));

stage.className = "cover-stage";
stack.className = "cover-stack";
label.className = "cover-label";

let covers = albums.map((album, index) => {
  let cover = stack.appendChild(document.createElement("div"));
  cover.className = "cover";
  cover.innerHTML = `<img src="${album.image}" alt="">`;
  // Expose the cover image to CSS so the fake 3D side faces can reuse the same
  // artwork instead of a flat color. JSON.stringify safely quotes the URL value.
  cover.style.setProperty("--cover-image", `url(${JSON.stringify(album.image)})`);
  cover.dataset.index = index;
  cover.dataset.title = album.title;
  cover.dataset.subtitle = album.subtitle;
  cover.lift = 0;
  return cover;
});

// Smoothed carousel progress. Desktop updates it from browser scroll; mobile touch
// drag can take over by setting hasTouchScrolled and touchScroll.
let scroll = 0;

// Currently pulled-out cover. Only this cover receives the horizontal lift target.
let active = null;

// Candidate cover waiting to become active after SWITCH_DELAY_MS.
let pending;
let pendingAt = 0;

// Last known pointer coordinate. Used for hit testing and for anchoring the
// selected cover while it slides right.
let lastX = -9999;
let lastY = -9999;

// Pointer coordinate where the current cover became active. A small hold radius
// around this point prevents the cover from deactivating just because it moved.
let holdX = -9999;
let holdY = -9999;

// Touch-controlled carousel progress and drag bookkeeping. These are only used
// after touch/pointer interaction; desktop keeps using normal page scroll.
let touchScroll = 0;
let touchStartY = 0;
let touchStartScroll = 0;
let touchDragging = false;
let hasTouchScrolled = false;

// Event setup is intentionally near the top so integration points are easy to audit:
// pointermove handles desktop hover and mobile drag, pointerdown handles touch/click
// selection, pointerup ends touch dragging, and leave/cancel clear interaction state.
addEventListener("pointermove", handlePointerMove, { passive: false });
addEventListener("pointerdown", handlePointerDown);
addEventListener("pointerup", handlePointerUp);
addEventListener("pointerleave", clearActiveCover);
addEventListener("pointercancel", handlePointerCancel);

render();

// Keeps a number inside a fixed range. The 3D-ish row uses this to stop far-away
// covers from getting extreme rotation values as the user scrolls.
function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Linear interpolation helper. This is what makes scroll and hover movement feel
// smooth instead of snapping directly to the latest target position.
function lerp(from, to, amount) {
  return from + (to - from) * amount;
}

// Detects touch-like input. Mouse users get hover + native browser scroll; touch
// users get tap selection + vertical drag progress because mobile has no hover.
function isTouchPointer(event) {
  return event.pointerType && event.pointerType !== "mouse";
}

// Returns the layout constants for the current viewport size. These values define
// the pseudo-3D diagonal row, plus the horizontal-only hover offset.
function getTrack() {
  return innerWidth < 760
    ? { start: 0.25, x: -230, y: 270, z: 210, dx: 96, dy: -92, dz: -115, hx: 145, scale: 0.9 }
    : { start: 0.55, x: -560, y: 270, z: 260, dx: 205, dy: -118, dz: -145, hx: 390, scale: 1 };
}

// Reads how far the user has scrolled through the carousel section as a 0..1 value.
// Progress is 0 when the section top reaches the viewport top (the stage pins) and 1
// once the section has been scrolled all the way through. This replaces the original
// whole-page scroll so the corridor is driven only while this section is in view.
function getBrowserScrollProgress() {
  let rect = root.getBoundingClientRect();
  let total = root.offsetHeight - innerHeight;
  return total > 0 ? clamp(-rect.top, 0, total) / total : 0;
}

// Chooses the animation progress source. Once a touch user drags, touchScroll
// becomes the source of truth; before that, the page scroll value is used.
function getScrollTarget() {
  return hasTouchScrolled ? touchScroll : getBrowserScrollProgress();
}

// Starts mobile drag control. The drag starts from the current progress so a user
// can repeatedly drag without the row jumping back to the beginning.
function startTouchDrag(event) {
  touchDragging = true;
  hasTouchScrolled = true;
  touchStartY = event.clientY;
  touchStartScroll = touchScroll || getBrowserScrollProgress();
  try {
    event.target.setPointerCapture?.(event.pointerId);
  } catch {
    // Some synthetic/browser-cancelled pointer events cannot be captured. The drag
    // still works because the window-level listeners continue receiving movement.
  }
  event.preventDefault();
}

// Converts vertical finger movement into carousel progress. Dragging up advances
// through the cover row; dragging down reverses it. The divisor controls speed.
function updateTouchDrag(event) {
  let delta = touchStartY - event.clientY;
  touchScroll = clamp(touchStartScroll + delta / (innerHeight * 2.2), 0, 1);
  event.preventDefault();
}

// Ends mobile dragging while keeping the selected cover active. This matches tap
// selection expectations: the chosen cover remains pulled right after the finger lifts.
function endTouchDrag() {
  touchDragging = false;
}

// Checks whether a pointer coordinate is inside a cover rectangle. The inset is
// used as a small edge dead zone so the cover does not flicker when the cursor is
// exactly on an overlapping border.
function isInsideCover(cover, x, y, inset = EDGE_DEAD_ZONE) {
  let rect = cover.getBoundingClientRect();
  return x > rect.left + inset && x < rect.right - inset && y > rect.top + inset && y < rect.bottom - inset;
}

// Sets the currently selected cover and updates the top-left text. The hold
// point stores where selection happened so a cover can slide right without
// immediately losing hover because it moved away from the cursor.
function setActiveCover(cover) {
  active?.classList.remove("is-active");
  active = cover;
  holdX = lastX;
  holdY = lastY;
  active?.classList.add("is-active");
  label.innerHTML = active ? `<b>${active.dataset.title}</b>${active.dataset.subtitle}` : "";
  label.style.opacity = active ? "1" : "0";
  label.style.transform = active ? "translateY(0)" : "translateY(-8px)";
}

// Clears the current selected cover and hides the label. This is used when the
// pointer leaves/cancels so a stale cover does not remain pulled out forever.
function clearActiveCover() {
  pending = undefined;
  endTouchDrag();
  setActiveCover(null);
}

// Finds the best cover for a pointer coordinate using browser hit testing. This
// replaced WebGL raycasting so the selected cover matches what the user sees.
// The top-cover edge band returns the current cover instead of selecting the
// cover behind it, which avoids edge-hover jerking.
function getCoverAtPoint(x, y) {
  if (active && Math.hypot(x - holdX, y - holdY) < (innerWidth < 760 ? 52 : 90)) return active;

  let hits = [
    ...new Set(document.elementsFromPoint(x, y).map((el) => el.closest?.(".cover")).filter(Boolean)),
  ];
  let top = hits[0];

  if (top && isInsideCover(top, x, y, -2) && !isInsideCover(top, x, y, EDGE_DEAD_ZONE)) return active;

  return (
    hits.find((cover) => cover !== active && isInsideCover(cover, x, y)) ||
    (active && isInsideCover(active, x, y, -6) ? active : null) ||
    hits.find((cover) => isInsideCover(cover, x, y)) ||
    null
  );
}

// Schedules or applies a cover selection. Touch/click selection is instant, while
// hover switching has a short delay so passing across overlapped covers does not
// rapidly swap active covers.
function chooseCover(cover, instant = false) {
  if (cover === active) {
    pending = undefined;
    return;
  }

  if (instant || !active) {
    setActiveCover(cover);
    return;
  }

  if (cover !== pending) {
    pending = cover;
    pendingAt = performance.now();
  }
}

// Shared pointer hit-selection handler. It records the latest pointer position,
// finds the visually hit cover, then asks chooseCover() to apply hover/tap behavior.
function handlePointer(event, instant = false) {
  lastX = event.clientX;
  lastY = event.clientY;
  chooseCover(getCoverAtPoint(event.clientX, event.clientY), instant);
}

// Desktop hover entry point and mobile drag entry point. On touch, movement changes
// carousel progress instead of repeatedly changing hover targets under the finger.
function handlePointerMove(event) {
  if (touchDragging && isTouchPointer(event)) {
    updateTouchDrag(event);
    return;
  }

  if (isTouchPointer(event)) return;

  handlePointer(event);
}

// Touch/click entry point. Touch starts drag tracking and also selects the touched
// cover immediately; mouse clicks behave like instant hover selection.
function handlePointerDown(event) {
  handlePointer(event, true);
}

// Ends touch drag without clearing selection.
function handlePointerUp(event) {
  if (isTouchPointer(event)) endTouchDrag();
}

// Handles interrupted pointer sequences, for example if the browser cancels a
// gesture. In this case we clear the selected state.
function handlePointerCancel() {
  clearActiveCover();
}

// Main animation loop. It updates scroll progress, applies delayed hover switches,
// computes every cover's pseudo-3D position, and eases the selected cover's
// right-only pull-out / return motion.
function render() {
  scroll = lerp(scroll, getScrollTarget(), 0.08);

  let track = getTrack();
  let travel = scroll * Math.max(covers.length - 1, 1);

  if (pending !== undefined && performance.now() - pendingAt > SWITCH_DELAY_MS) {
    setActiveCover(pending);
    pending = undefined;
  }

  // Whole-row transform: moves the stack slightly as progress changes so the user
  // feels like they are walking beside the diagonal cover corridor.
  stack.style.transform = `translate3d(${-scroll * 70}px, ${scroll * 30}px, 0) rotateX(1deg) rotateY(${
    -4 + scroll * 2
  }deg)`;

  covers.forEach((cover, index) => {
    // slot is this cover's virtual position in the diagonal row. As scroll/touch
    // progress changes, travel advances and each cover moves through these slots.
    let slot = index - travel + track.start;

    // Small sinusoidal offset prevents the row from looking like a mechanical grid.
    let curve = Math.sin(slot * 0.75) * 14;

    // lift eases from 0 to 1 for the active cover and back to 0 afterwards. It only
    // affects x, so hover/touch pulls the cover to the right, outside the row.
    let targetLift = cover === active ? 1 : 0;
    let lift = (cover.lift = lerp(cover.lift, targetLift, targetLift ? 0.085 : 0.04));

    // Pseudo-3D position: x/y/z place the cover in a diagonal corridor. The hover
    // offset is horizontal only: lift * track.hx.
    let x = track.x + slot * track.dx + curve + lift * track.hx;
    let y = track.y + slot * track.dy;
    let z = track.z + slot * track.dz;

    // Pseudo-3D angle: the cover keeps its row orientation even when pulled right.
    let rotateY = -13 + clamp(slot, -2, 8) * 0.38;
    let rotateX = -3.5 + clamp(slot, -2, 8) * 0.08;

    // While a cover is pulled out or returning, keep it visually above the row so
    // it does not snap behind adjacent covers mid-animation.
    cover.style.zIndex = cover === active ? 10000 : lift > 0.02 ? 9000 + Math.round(lift * 999) : Math.round(5000 + z);
    cover.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), ${z}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(-.35deg) scale(${track.scale})`;
  });

  requestAnimationFrame(render);
}
