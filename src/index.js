/**
 * Wheel of Names – Adobe Express Addon
 * Version 1.0.1
 *
 * Features:
 *  - Import names (one per line)
 *  - Spin the wheel with smooth CSS-based animation
 *  - Animated winner display
 *  - Customisable segment colors (add / remove)
 *  - Optional center graphic (uploaded image)
 */

(function () {
  "use strict";

  // ── Default palette ──────────────────────────────────────────────────────────
  const DEFAULT_COLORS = [
    "#e06000", // orange
    "#0266d6", // blue
    "#00a859", // green
    "#d62b2b", // red
    "#8b2be2", // purple
    "#e6c200", // yellow
    "#00b4c8", // cyan
    "#e2007a", // pink
  ];

  // ── Layout constants ─────────────────────────────────────────────────────────
  const MIN_FONT_SIZE = 11;
  const FONT_SIZE_RATIO = 0.13;
  const MAX_FONT_SIZE = 15;
  const TEXT_WIDTH_RATIO = 0.72;
  const TEXT_PADDING = 10;
  const VERTICAL_OFFSET_DIVISOR = 3;
  const HUB_RADIUS_RATIO = 0.18;

  // ── State ────────────────────────────────────────────────────────────────────
  let names = [];
  let colors = [...DEFAULT_COLORS];
  let centerImage = null; // HTMLImageElement | null
  let isSpinning = false;
  let currentRotation = 0; // radians
  let animationId = null;

  // ── DOM refs ─────────────────────────────────────────────────────────────────
  const canvas = document.getElementById("wheel-canvas");
  const ctx = canvas.getContext("2d");
  const spinBtn = document.getElementById("spin-btn");
  const loadNamesBtn = document.getElementById("load-names-btn");
  const namesInput = document.getElementById("names-input");
  const winnerDisplay = document.getElementById("winner-display");
  const winnerName = document.getElementById("winner-name");
  const colorSwatchesEl = document.getElementById("color-swatches");
  const addColorBtn = document.getElementById("add-color-btn");
  const colorPicker = document.getElementById("color-picker");
  const uploadImageBtn = document.getElementById("upload-image-btn");
  const centerImageInput = document.getElementById("center-image-input");
  const clearImageBtn = document.getElementById("clear-image-btn");
  const centerImagePreview = document.getElementById("center-image-preview");

  // ── Wheel drawing ────────────────────────────────────────────────────────────

  /**
   * Draw the full wheel onto the canvas.
   * @param {number} rotation - Current rotation offset in radians.
   */
  function drawWheel(rotation) {
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(cx, cy) - 4;

    ctx.clearRect(0, 0, W, H);

    if (names.length === 0) {
      drawEmptyWheel(cx, cy, radius);
      return;
    }

    const sliceAngle = (2 * Math.PI) / names.length;

    names.forEach(function (name, i) {
      const startAngle = rotation + i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const color = colors[i % colors.length];

      // Segment fill
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Segment border
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = getContrastColor(color);
      const fontSize = clamp(MIN_FONT_SIZE, Math.floor(radius * FONT_SIZE_RATIO), MAX_FONT_SIZE);
      ctx.font = "bold " + fontSize + "px 'Adobe Clean', 'Segoe UI', Arial, sans-serif";
      const maxTextWidth = radius * TEXT_WIDTH_RATIO;
      const label = truncateText(ctx, name, maxTextWidth);
      ctx.fillText(label, radius - TEXT_PADDING, fontSize / VERTICAL_OFFSET_DIVISOR);
      ctx.restore();
    });

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center hub
    drawCenterHub(cx, cy, radius);
  }

  /** Draw an empty placeholder wheel. */
  function drawEmptyWheel(cx, cy, radius) {
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "#e0e0e0";
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#9e9e9e";
    ctx.font = "bold 13px 'Adobe Clean', 'Segoe UI', Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Enter names above", cx, cy);
  }

  /** Draw the center hub (with optional image). */
  function drawCenterHub(cx, cy, radius) {
    const hubRadius = radius * HUB_RADIUS_RATIO;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, hubRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.2)";
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();

    if (centerImage) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, hubRadius - 2, 0, 2 * Math.PI);
      ctx.clip();
      ctx.drawImage(
        centerImage,
        cx - hubRadius + 2,
        cy - hubRadius + 2,
        (hubRadius - 2) * 2,
        (hubRadius - 2) * 2
      );
      ctx.restore();
    }
  }

  // ── Spin logic ───────────────────────────────────────────────────────────────

  /** Start spinning the wheel. */
  function spin() {
    if (isSpinning || names.length === 0) return;

    isSpinning = true;
    spinBtn.disabled = true;
    winnerDisplay.classList.add("hidden");

    // Random spin: 5–10 full rotations plus a random extra angle
    const totalRotation =
      2 * Math.PI * (5 + Math.random() * 5) + Math.random() * 2 * Math.PI;
    const duration = 4000 + Math.random() * 2000; // 4–6 seconds
    const startRotation = currentRotation;
    let startTime = null;

    function easeOut(t) {
      // Cubic ease-out
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOut(progress);

      currentRotation = startRotation + totalRotation * easedProgress;
      drawWheel(currentRotation);

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      } else {
        isSpinning = false;
        spinBtn.disabled = false;
        showWinner();
      }
    }

    animationId = requestAnimationFrame(animate);
  }

  /**
   * Determine which segment is at the top (pointer position) and show it.
   * The pointer sits at the top of the wheel (angle = -π/2 from center = 270°).
   */
  function showWinner() {
    const sliceAngle = (2 * Math.PI) / names.length;
    // Normalize rotation to [0, 2π)
    const normalised = ((currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    // The pointer is at the top, which corresponds to -π/2. Adjust accordingly.
    const pointerAngle = (2 * Math.PI - normalised + (3 * Math.PI) / 2) % (2 * Math.PI);
    const winnerIndex = Math.floor(pointerAngle / sliceAngle) % names.length;

    winnerName.textContent = names[winnerIndex];
    winnerDisplay.classList.remove("hidden");
  }

  // ── Names loading ────────────────────────────────────────────────────────────

  function loadNames() {
    const raw = namesInput.value;
    names = raw
      .split("\n")
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length > 0; });

    spinBtn.disabled = names.length === 0;
    winnerDisplay.classList.add("hidden");
    currentRotation = 0;
    drawWheel(currentRotation);
  }

  // ── Color customization ──────────────────────────────────────────────────────

  function renderSwatches() {
    colorSwatchesEl.innerHTML = "";
    colors.forEach(function (color, index) {
      const swatch = document.createElement("div");
      swatch.className = "color-swatch";
      swatch.style.backgroundColor = color;
      swatch.setAttribute("title", color);
      swatch.setAttribute("role", "button");
      swatch.setAttribute("aria-label", "Color " + color);

      // Remove button
      const removeBtn = document.createElement("button");
      removeBtn.className = "remove-swatch";
      removeBtn.textContent = "×";
      removeBtn.setAttribute("aria-label", "Remove color " + color);
      removeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        if (colors.length > 1) {
          colors.splice(index, 1);
          renderSwatches();
          drawWheel(currentRotation);
        }
      });

      swatch.appendChild(removeBtn);
      colorSwatchesEl.appendChild(swatch);
    });
  }

  addColorBtn.addEventListener("click", function () {
    colorPicker.click();
  });

  colorPicker.addEventListener("change", function () {
    colors.push(colorPicker.value);
    renderSwatches();
    drawWheel(currentRotation);
  });

  // ── Center image ─────────────────────────────────────────────────────────────

  uploadImageBtn.addEventListener("click", function () {
    centerImageInput.click();
  });

  centerImageInput.addEventListener("change", function () {
    const file = centerImageInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.onload = function () {
        centerImage = img;
        // Show preview
        centerImagePreview.innerHTML = "";
        const previewImg = document.createElement("img");
        previewImg.src = e.target.result;
        previewImg.alt = "Center graphic";
        centerImagePreview.appendChild(previewImg);
        centerImagePreview.classList.remove("hidden");
        drawWheel(currentRotation);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    // Reset input so the same file can be re-selected
    centerImageInput.value = "";
  });

  clearImageBtn.addEventListener("click", function () {
    centerImage = null;
    centerImagePreview.innerHTML = "";
    centerImagePreview.classList.add("hidden");
    drawWheel(currentRotation);
  });

  // ── Event listeners ──────────────────────────────────────────────────────────

  loadNamesBtn.addEventListener("click", loadNames);

  namesInput.addEventListener("keydown", function (e) {
    // Allow Ctrl/Cmd+Enter to load names quickly
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      loadNames();
    }
  });

  spinBtn.addEventListener("click", spin);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  /**
   * Return white or black text color depending on the background luminance.
   * @param {string} hex - Hex color string (e.g. "#e06000").
   * @returns {string} "#ffffff" or "#000000"
   */
  function getContrastColor(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // Perceived luminance (sRGB)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.55 ? "#000000" : "#ffffff";
  }

  /**
   * Truncate text to fit within maxWidth, appending "…" if needed.
   * @param {CanvasRenderingContext2D} context
   * @param {string} text
   * @param {number} maxWidth
   * @returns {string}
   */
  function truncateText(context, text, maxWidth) {
    if (context.measureText(text).width <= maxWidth) return text;
    let truncated = text;
    while (truncated.length > 1 && context.measureText(truncated + "…").width > maxWidth) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + "…";
  }

  /**
   * Clamp a value between min and max.
   * @param {number} min
   * @param {number} value
   * @param {number} max
   * @returns {number}
   */
  function clamp(min, value, max) {
    return Math.min(Math.max(value, min), max);
  }

  // ── Init ─────────────────────────────────────────────────────────────────────

  renderSwatches();
  drawWheel(currentRotation);
})();
