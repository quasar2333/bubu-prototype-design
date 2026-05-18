(function () {
  "use strict";

  const STAGE = {
    width: 780,
    height: 880,
    cx: 265,
    cy: 545,
    mainRadius: 245,
  };

  const RINGS = {
    main: { label: "主功能盘", radius: 150, min: -180, max: 180 },
    color: { label: "颜色盘", radius: 335, min: -98, max: 44 },
    tool: { label: "笔刷盘", radius: 470, min: -96, max: 41 },
  };

  const ICON_OPTIONS = [
    ["select", "选择"],
    ["shape", "图形"],
    ["eraser", "板擦"],
    ["camera", "照相机"],
    ["teach", "授课"],
    ["capture", "高拍"],
    ["more", "更多"],
    ["pencil", "铅笔"],
    ["brush-red", "红色画笔"],
    ["marker", "马克笔"],
    ["pen-menu", "笔菜单"],
    ["squiggle", "手写线"],
    ["brush-black", "黑色笔刷"],
    ["color-red", "红色"],
    ["color-blue", "蓝色"],
    ["color-yellow", "黄色"],
    ["color-mix", "色盘"],
    ["stroke-ring", "粗细"],
  ];

  const DEFAULT_ITEMS = [
    { id: "select", ring: "main", angle: -122, radius: 150, label: "选择", icon: "select", action: "tool.select" },
    { id: "shape", ring: "main", angle: -62, radius: 150, label: "图形", icon: "shape", action: "tool.shape" },
    { id: "eraser", ring: "main", angle: -8, radius: 154, label: "板擦", icon: "eraser", action: "tool.eraser" },
    { id: "camera", ring: "main", angle: 42, radius: 155, label: "照相机", icon: "camera", action: "device.camera" },
    { id: "more", ring: "main", angle: 91, radius: 151, label: "更多", icon: "more", action: "menu.more" },
    { id: "teach", ring: "main", angle: 140, radius: 154, label: "授课", icon: "teach", action: "class.teach" },
    { id: "capture", ring: "main", angle: 190, radius: 151, label: "高拍", icon: "capture", action: "device.capture" },
    { id: "color-red", ring: "color", angle: -96, label: "红色", icon: "color-red", color: "#fa0927", action: "color.red" },
    { id: "stroke", ring: "color", angle: -66, label: "粗细", icon: "stroke-ring", active: true, action: "stroke.width" },
    { id: "color-blue", ring: "color", angle: -36, label: "蓝色", icon: "color-blue", color: "#1979d5", action: "color.blue" },
    { id: "color-yellow", ring: "color", angle: -11, label: "黄色", icon: "color-yellow", color: "#ffc400", action: "color.yellow" },
    { id: "palette", ring: "color", angle: 22, label: "色盘", icon: "color-mix", action: "color.palette" },
    { id: "pencil", ring: "tool", angle: -94, label: "铅笔", icon: "pencil", action: "pen.pencil" },
    { id: "brush-red", ring: "tool", angle: -70, label: "红笔", icon: "brush-red", active: true, action: "pen.redBrush" },
    { id: "marker", ring: "tool", angle: -45, label: "马克笔", icon: "marker", action: "pen.marker" },
    { id: "pen-menu", ring: "tool", angle: -21, label: "笔菜单", icon: "pen-menu", action: "pen.menu" },
    { id: "squiggle", ring: "tool", angle: 9, label: "手写", icon: "squiggle", active: true, action: "pen.handwriting" },
    { id: "brush-black", ring: "tool", angle: 31, label: "毛笔", icon: "brush-black", action: "pen.blackBrush" },
  ];

  const svgNS = "http://www.w3.org/2000/svg";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function polarToPoint(angle, radius) {
    const rad = (angle * Math.PI) / 180;
    return {
      x: STAGE.cx + radius * Math.cos(rad),
      y: STAGE.cy + radius * Math.sin(rad),
    };
  }

  function describeArc(radius, startAngle, endAngle) {
    const start = polarToPoint(startAngle, radius);
    const end = polarToPoint(endAngle, radius);
    const largeArcFlag = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
    return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  }

  function radialLine(angle, inner, outer) {
    const a = polarToPoint(angle, inner);
    const b = polarToPoint(angle, outer);
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  }

  function clamp(value, min, max) {
    if (max < min) return (min + max) / 2;
    return Math.min(max, Math.max(min, value));
  }

  function normalizeScale(value, min, max) {
    const next = Number(value);
    const lower = Number.isFinite(Number(min)) && Number(min) > 0 ? Number(min) : 0.05;
    const upper = Number.isFinite(Number(max)) && Number(max) > lower ? Number(max) : Number.POSITIVE_INFINITY;
    if (!Number.isFinite(next)) return 1;
    return Math.min(upper, Math.max(lower, next));
  }

  function normalizeAngle(angle) {
    let next = angle;
    while (next > 180) next -= 360;
    while (next <= -180) next += 360;
    return next;
  }

  function getIcon(icon, item) {
    const color = item.color || "#26394b";
    const icons = {
      select: `
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <rect x="9" y="9" width="34" height="34" rx="2" fill="none" stroke="#2d4154" stroke-width="4" stroke-dasharray="7 5"/>
          <path d="M25 20 L51 45 L38 45 L44 58 L36 61 L30 48 L21 56 Z" fill="#2b3d50" stroke="#fff" stroke-width="2"/>
        </svg>`,
      shape: `
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <linearGradient id="shapeGrad" x1="12" x2="45" y1="54" y2="12" gradientUnits="userSpaceOnUse">
              <stop stop-color="#24384b"/>
              <stop offset="1" stop-color="#597087"/>
            </linearGradient>
          </defs>
          <path d="M15 48 L20 34 L42 12 Q45 9 49 12 L53 16 Q56 19 53 22 L31 44 Z" fill="url(#shapeGrad)"/>
          <path d="M12 53 L15 48 L31 44 L21 56 Z" fill="#26394b"/>
          <rect x="45" y="37" width="10" height="10" transform="rotate(45 50 42)" fill="#34495e"/>
        </svg>`,
      eraser: `
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <linearGradient id="eraserGrad" x1="10" x2="54" y1="50" y2="16" gradientUnits="userSpaceOnUse">
              <stop stop-color="#24384b"/>
              <stop offset="1" stop-color="#6d7e8e"/>
            </linearGradient>
          </defs>
          <path d="M14 38 L36 16 Q39 13 42 16 L52 26 Q55 29 52 32 L31 53 Q29 55 26 55 L16 45 Q12 42 14 38 Z" fill="url(#eraserGrad)"/>
          <path d="M35 17 L53 35 L43 45 L25 27 Z" fill="#eef2f5"/>
        </svg>`,
      camera: `
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <linearGradient id="cameraGrad" x1="10" x2="56" y1="53" y2="14" gradientUnits="userSpaceOnUse">
              <stop stop-color="#223548"/>
              <stop offset="1" stop-color="#53687a"/>
            </linearGradient>
          </defs>
          <path d="M18 20 H27 L30 15 H40 L43 20 H49 Q54 20 54 25 V48 Q54 53 49 53 H15 Q10 53 10 48 V25 Q10 20 15 20 Z" fill="url(#cameraGrad)"/>
          <circle cx="32" cy="37" r="11" fill="#f8fbfd"/>
          <circle cx="32" cy="37" r="7" fill="#30465a"/>
          <circle cx="49" cy="27" r="3" fill="#f8fbfd"/>
        </svg>`,
      teach: `
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M13 25 V13 H25 M39 13 H51 V25 M51 39 V51 H39 M25 51 H13 V39" fill="none" stroke="#2d4154" stroke-width="5" stroke-linecap="round"/>
          <path d="M32 20 V44 M20 32 H44" stroke="#2d4154" stroke-width="6" stroke-linecap="round"/>
          <circle cx="32" cy="32" r="7" fill="#2d4154"/>
        </svg>`,
      capture: `
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <linearGradient id="captureGrad" x1="14" x2="46" y1="52" y2="8" gradientUnits="userSpaceOnUse">
              <stop stop-color="#24384b"/>
              <stop offset="1" stop-color="#64778a"/>
            </linearGradient>
          </defs>
          <path d="M17 22 L36 10 L44 16 L30 27 L34 52 L19 56 Z" fill="url(#captureGrad)"/>
          <path d="M12 28 L26 21 L30 29 L16 37 Z" fill="#6f8191"/>
        </svg>`,
      more: `
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="20" cy="32" r="5.5" fill="#2d4154"/>
          <circle cx="32" cy="32" r="5.5" fill="#2d4154"/>
          <circle cx="44" cy="32" r="5.5" fill="#2d4154"/>
        </svg>`,
      pencil: `
        <svg viewBox="0 0 72 72" aria-hidden="true">
          <defs>
            <linearGradient id="pencilWood" x1="18" x2="55" y1="58" y2="10" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ffb42d"/>
              <stop offset="1" stop-color="#ffcf6a"/>
            </linearGradient>
          </defs>
          <path d="M17 57 L24 39 L47 12 L58 22 L31 47 Z" fill="url(#pencilWood)"/>
          <path d="M47 12 L53 6 L64 16 L58 22 Z" fill="#e8ecef"/>
          <path d="M53 6 L58 3 L67 12 L64 16 Z" fill="#9aa5ad"/>
          <path d="M17 57 L21 47 L28 54 Z" fill="#1d2731"/>
          <path d="M25 39 L35 49" stroke="#d68112" stroke-width="3"/>
        </svg>`,
      "brush-red": `
        <svg viewBox="0 0 72 72" aria-hidden="true">
          <defs>
            <linearGradient id="redBrush" x1="23" x2="55" y1="59" y2="15" gradientUnits="userSpaceOnUse">
              <stop stop-color="#d60014"/>
              <stop offset="0.52" stop-color="#ff3c24"/>
              <stop offset="1" stop-color="#8c180e"/>
            </linearGradient>
          </defs>
          <path d="M21 55 C25 44 31 35 42 30 C47 27 52 20 55 13 C64 18 67 24 62 31 C56 38 48 40 42 41 C35 43 30 50 28 61 Z" fill="url(#redBrush)"/>
          <path d="M54 10 L64 17 L63 23 L51 16 Z" fill="#7e1a12"/>
          <path d="M18 61 L24 52 L29 59 Z" fill="#2a1a16"/>
          <path d="M52 15 C57 17 61 20 64 25" stroke="#40110d" stroke-width="3" stroke-linecap="round"/>
        </svg>`,
      marker: `
        <svg viewBox="0 0 72 72" aria-hidden="true">
          <defs>
            <linearGradient id="markerGrad" x1="22" x2="55" y1="58" y2="10" gradientUnits="userSpaceOnUse">
              <stop stop-color="#f7f9f9"/>
              <stop offset="1" stop-color="#cfd6d9"/>
            </linearGradient>
          </defs>
          <path d="M20 55 L25 43 L45 17 L58 27 L37 52 L26 59 Z" fill="url(#markerGrad)" stroke="#1c2730" stroke-width="2"/>
          <path d="M45 17 L51 9 L65 20 L58 27 Z" fill="#111"/>
          <path d="M20 55 L16 65 L26 59 Z" fill="#111"/>
        </svg>`,
      "pen-menu": `
        <svg viewBox="0 0 72 72" aria-hidden="true">
          <path d="M12 49 L20 30 L45 14 L50 21 L25 38 Z" fill="#f7f8fa" stroke="#253241" stroke-width="2"/>
          <path d="M19 51 C28 42 37 42 43 51 C48 58 55 54 55 45 C55 36 64 35 65 45" fill="none" stroke="#8b50fb" stroke-width="6" stroke-linecap="round"/>
          <path d="M43 14 L53 10 L57 18 L50 21 Z" fill="#2f455a"/>
          <circle cx="62" cy="31" r="5" fill="#2487e8"/>
        </svg>`,
      squiggle: `
        <svg viewBox="0 0 72 72" aria-hidden="true">
          <path d="M20 18 C9 42 18 52 30 34 C38 21 42 21 38 42 C36 56 44 59 58 39" fill="none" stroke="#101820" stroke-width="6" stroke-linecap="round"/>
        </svg>`,
      "brush-black": `
        <svg viewBox="0 0 72 72" aria-hidden="true">
          <path d="M40 16 C34 31 32 39 22 49 C15 56 17 62 28 55 C39 48 42 42 46 27 Z" fill="#17212b"/>
          <path d="M45 13 L53 17 L46 31 L38 27 Z" fill="#344558"/>
          <path d="M13 62 C22 47 35 46 31 59" fill="none" stroke="#101820" stroke-width="5" stroke-linecap="round"/>
        </svg>`,
    };

    if (icon === "color-red" || icon === "color-blue" || icon === "color-yellow") {
      return `<span class="wbf-swatch" style="--swatch:${color}"></span>`;
    }

    if (icon === "color-mix") {
      return `<span class="wbf-swatch is-mix"></span>`;
    }

    if (icon === "stroke-ring") {
      return `<span class="wbf-swatch is-ring"></span>`;
    }

    return icons[icon] || `<span class="wbf-swatch" style="--swatch:${color}"></span>`;
  }

  class WhiteboardFloatingBall {
    constructor(target, options) {
      this.root = typeof target === "string" ? document.querySelector(target) : target;
      if (!this.root) {
        throw new Error("WhiteboardFloatingBall: target element not found.");
      }

      this.options = Object.assign(
        {
          open: true,
          showEditor: false,
          storageKey: "",
          scale: 1,
          minScale: 0.05,
          maxScale: Number.POSITIVE_INFINITY,
          position: null,
          onAction: null,
        },
        options || {}
      );

      this.items = clone(DEFAULT_ITEMS);
      this.open = Boolean(this.options.open);
      this.editing = false;
      this.resizeMode = false;
      this.selectedId = this.items[0].id;
      this.userScale = normalizeScale(Number(this.options.scale) || 1, this.options.minScale, this.options.maxScale);
      this.scale = 1;
      this.position = {
        x: Number.isFinite(Number(this.options.position && this.options.position.x))
          ? Number(this.options.position.x)
          : 0,
        y: Number.isFinite(Number(this.options.position && this.options.position.y))
          ? Number(this.options.position.y)
          : 0,
      };
      this.dragState = null;
      this.resizeState = null;
      this.events = new Map();

      this._loadState();
      this._mount();
      this._syncScale();
      this._setDefaultPosition();
      this._applyPosition();
      this._syncSizeControl();
      this._bind();
    }

    setConfig(config) {
      if (Array.isArray(config)) {
        this.items = clone(config);
      } else if (config && Array.isArray(config.items)) {
        this.items = clone(config.items);
      }
      this._normalizeItems();
      this.renderItems();
      this.renderEditor();
      this._saveState();
      return this;
    }

    getConfig() {
      return {
        items: clone(this.items),
        open: this.open,
        position: Object.assign({}, this.position),
        scale: this.userScale,
      };
    }

    setPosition(position) {
      this.position = {
        x: Number.isFinite(Number(position && position.x)) ? Number(position.x) : this.position.x,
        y: Number.isFinite(Number(position && position.y)) ? Number(position.y) : this.position.y,
      };
      this._applyPosition();
      this._saveState();
      return this;
    }

    setScale(scale) {
      this.userScale = normalizeScale(Number(scale) || 1, this.options.minScale, this.options.maxScale);
      this._syncScale();
      this._applyPosition();
      this._syncSizeControl();
      this._saveState();
      return this;
    }

    setSize(scale) {
      return this.setScale(scale);
    }

    updateItem(id, patch) {
      const item = this.items.find((entry) => entry.id === id);
      if (!item) return this;
      Object.assign(item, patch || {});
      this._normalizeItem(item);
      this.renderItems();
      this.renderEditor();
      this._saveState();
      return this;
    }

    replaceItem(id, nextItem) {
      const index = this.items.findIndex((entry) => entry.id === id);
      if (index < 0) return this;
      this.items[index] = Object.assign({}, this.items[index], nextItem || {});
      this._normalizeItem(this.items[index]);
      this.renderItems();
      this.renderEditor();
      this._saveState();
      return this;
    }

    moveItem(id, target) {
      return this.updateItem(id, target);
    }

    addItem(item) {
      const next = Object.assign(
        {
          id: `item-${Date.now()}`,
          ring: "main",
          angle: 0,
          radius: RINGS.main.radius,
          label: "新功能",
          icon: "more",
          action: "custom.action",
        },
        item || {}
      );
      this._normalizeItem(next);
      this.items.push(next);
      this.selectedId = next.id;
      this.renderItems();
      this.renderEditor();
      this._saveState();
      return this;
    }

    removeItem(id) {
      if (this.items.length <= 1) return this;
      this.items = this.items.filter((item) => item.id !== id);
      if (this.selectedId === id) this.selectedId = this.items[0].id;
      this.renderItems();
      this.renderEditor();
      this._saveState();
      return this;
    }

    resetLayout() {
      this.items = clone(DEFAULT_ITEMS);
      this.open = true;
      this.editing = false;
      this.resizeMode = false;
      this.selectedId = this.items[0].id;
      this.userScale = 1;
      this.position = { x: 0, y: 0 };
      this._clearState();
      this.render();
      this._syncScale();
      this._setDefaultPosition(true);
      this._applyPosition();
      this._syncSizeControl();
      return this;
    }

    on(eventName, callback) {
      if (!this.events.has(eventName)) this.events.set(eventName, new Set());
      this.events.get(eventName).add(callback);
      return () => this.events.get(eventName).delete(callback);
    }

    destroy() {
      window.removeEventListener("resize", this._resizeHandler);
      this.root.innerHTML = "";
    }

    render() {
      this.shell.classList.toggle("is-open", this.open);
      this.shell.classList.toggle("is-editing", this.editing);
      this.shell.classList.toggle("is-resize-mode", this.resizeMode);
      this.renderItems();
      this.renderEditor();
      this._applyPosition();
    }

    renderItems() {
      this.itemsLayer.innerHTML = "";
      this.items.forEach((item, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = this._itemClass(item);
        button.dataset.itemId = item.id;
        button.style.setProperty("--item-delay", String(index));
        button.setAttribute("aria-label", item.label);
        button.title = this.editing ? `${item.label} · 可拖动` : item.label;
        button.innerHTML = `
          <span class="wbf-item-inner">
            <span class="wbf-icon">${getIcon(item.icon, item)}</span>
            <span class="wbf-label">${item.label || ""}</span>
          </span>
        `;
        this._positionItem(button, item);
        this.itemsLayer.appendChild(button);
      });
    }

    renderEditor() {
      if (!this.options.showEditor) {
        this.editor.hidden = true;
        return;
      }

      const item = this.items.find((entry) => entry.id === this.selectedId);
      if (!item) {
        this.editor.innerHTML = `<div class="wbf-empty-editor">开启布局后，点选任意功能点即可替换名称、图标、位置和动作。</div>`;
        return;
      }

      const iconOptions = ICON_OPTIONS.map(([value, label]) => {
        return `<option value="${value}" ${item.icon === value ? "selected" : ""}>${label}</option>`;
      }).join("");

      const ringOptions = Object.entries(RINGS)
        .map(([value, ring]) => `<option value="${value}" ${item.ring === value ? "selected" : ""}>${ring.label}</option>`)
        .join("");

      this.editor.innerHTML = `
        <h2>功能点编辑</h2>
        <p>拖动功能点可换位置；这里可替换名称、图标、分组和动作标识。</p>
        <label>
          名称
          <input data-field="label" value="${this._escapeAttribute(item.label || "")}" maxlength="8" />
        </label>
        <label>
          图标
          <select data-field="icon">${iconOptions}</select>
        </label>
        <label>
          位置分组
          <select data-field="ring">${ringOptions}</select>
        </label>
        <label>
          颜色
          <input data-field="color" type="color" value="${item.color || "#26394b"}" />
        </label>
        <label>
          动作标识
          <input data-field="action" value="${this._escapeAttribute(item.action || "")}" />
        </label>
        <div class="wbf-editor-actions">
          <button type="button" data-editor-action="add">新增</button>
          <button type="button" data-editor-action="delete">删除</button>
        </div>
      `;
    }

    _mount() {
      this.root.innerHTML = `
        <section class="wbf-shell ${this.open ? "is-open" : ""}" aria-label="白板悬浮球">
          <div class="wbf-stage">
            ${this._surfaceSvg()}
            <div class="wbf-items"></div>
            <button class="wbf-ai-core" type="button" aria-label="AI 悬浮球，点击展开或收起">
              <span class="wbf-ai-text">Ai</span>
            </button>
          </div>
          <div class="wbf-toolbar" aria-label="悬浮球控制">
            <button type="button" data-wbf-action="toggle-open">折叠</button>
            <button type="button" data-wbf-action="toggle-edit" aria-pressed="false">布局</button>
            <button type="button" data-wbf-action="toggle-size" aria-pressed="false">调大小</button>
            <button type="button" data-wbf-action="reset">重置</button>
          </div>
          <div class="wbf-resize-frame" aria-hidden="true">
            <span class="wbf-resize-grip is-top-left"></span>
            <span class="wbf-resize-grip is-top-right"></span>
            <span class="wbf-resize-grip is-bottom-left"></span>
            <span class="wbf-resize-grip is-bottom-right"></span>
          </div>
          <aside class="wbf-editor" aria-label="功能点编辑"></aside>
        </section>
      `;
      this.shell = this.root.querySelector(".wbf-shell");
      this.itemsLayer = this.root.querySelector(".wbf-items");
      this.core = this.root.querySelector(".wbf-ai-core");
      this.toolbar = this.root.querySelector(".wbf-toolbar");
      this.resizeFrame = this.root.querySelector(".wbf-resize-frame");
      this.editor = this.root.querySelector(".wbf-editor");
      if (!this.options.showEditor) {
        this.toolbar.hidden = true;
        this.editor.hidden = true;
      }
      this.render();
    }

    _surfaceSvg() {
      const mainLines = [-90, -38, 14, 66, 118, 170, 222]
        .map((angle) => {
          const line = radialLine(angle, 0, STAGE.mainRadius);
          return `<line class="wbf-divider" x1="${STAGE.cx}" y1="${STAGE.cy}" x2="${line.x2.toFixed(2)}" y2="${line.y2.toFixed(2)}"/>`;
        })
        .join("");

      const colorDividers = [-82, -52, -24, 7].map((angle) => {
        const line = radialLine(angle, RINGS.color.radius - 41, RINGS.color.radius + 41);
        return `<line class="wbf-arc-divider" x1="${line.x1.toFixed(2)}" y1="${line.y1.toFixed(2)}" x2="${line.x2.toFixed(2)}" y2="${line.y2.toFixed(2)}"/>`;
      });

      const toolDividers = [-33, -4, 21].map((angle) => {
        const line = radialLine(angle, RINGS.tool.radius - 43, RINGS.tool.radius + 43);
        return `<line class="wbf-arc-divider" x1="${line.x1.toFixed(2)}" y1="${line.y1.toFixed(2)}" x2="${line.x2.toFixed(2)}" y2="${line.y2.toFixed(2)}"/>`;
      });

      return `
        <svg class="wbf-surfaces" viewBox="0 0 ${STAGE.width} ${STAGE.height}" aria-hidden="true">
          <defs>
            <radialGradient id="wbfPaper" cx="34%" cy="25%" r="78%">
              <stop offset="0" stop-color="#ffffff"/>
              <stop offset="0.64" stop-color="#fbfbfa"/>
              <stop offset="1" stop-color="#e7ebe6"/>
            </radialGradient>
            <linearGradient id="wbfArcPaper" x1="160" x2="720" y1="90" y2="750" gradientUnits="userSpaceOnUse">
              <stop offset="0" stop-color="#ffffff"/>
              <stop offset="0.72" stop-color="#fbfbfa"/>
              <stop offset="1" stop-color="#e8ede8"/>
            </linearGradient>
            <filter id="wbfSoftShadow" x="-22%" y="-22%" width="144%" height="144%">
              <feDropShadow dx="0" dy="9" stdDeviation="11" flood-color="#0a1416" flood-opacity="0.22"/>
              <feDropShadow dx="0" dy="-2" stdDeviation="3" flood-color="#ffffff" flood-opacity="0.62"/>
            </filter>
          </defs>
          <g class="wbf-panel-surface">
            <path class="wbf-arc wbf-tool-arc" d="${describeArc(RINGS.tool.radius, RINGS.tool.min, RINGS.tool.max)}"/>
            <path class="wbf-arc wbf-color-arc" d="${describeArc(RINGS.color.radius, RINGS.color.min, RINGS.color.max)}"/>
            <circle class="wbf-paper" cx="${STAGE.cx}" cy="${STAGE.cy}" r="${STAGE.mainRadius}"/>
            <circle class="wbf-main-sheen" cx="${STAGE.cx}" cy="${STAGE.cy}" r="${STAGE.mainRadius - 2}"/>
            ${mainLines}
            ${colorDividers.join("")}
            ${toolDividers.join("")}
          </g>
        </svg>
      `;
    }

    _bind() {
      this._resizeHandler = () => {
        this._syncScale();
        this._applyPosition();
      };
      window.addEventListener("resize", this._resizeHandler);

      this.itemsLayer.addEventListener("pointerdown", (event) => {
        const button = event.target.closest(".wbf-item");
        if (!button) return;
        const item = this.items.find((entry) => entry.id === button.dataset.itemId);
        if (!item) return;

        if (!this.editing) {
          this._pressItem(button, item);
          return;
        }

        this.selectedId = item.id;
        this.renderEditor();
        this._startItemDrag(event, button, item);
      });

      this.core.addEventListener("pointerdown", (event) => {
        this._startShellDrag(event);
      });
      this.core.addEventListener("mousedown", (event) => {
        this._startShellDrag(event);
      });

      this.resizeFrame.addEventListener("pointerdown", (event) => {
        this._startResize(event);
      });
      this.resizeFrame.addEventListener("mousedown", (event) => {
        this._startResize(event);
      });

      this.toolbar.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;
        const action = button.dataset.wbfAction;
        if (action === "toggle-open") {
          this.open = !this.open;
          button.textContent = this.open ? "折叠" : "展开";
          this.render();
          this._saveState();
        }
        if (action === "toggle-edit") {
          this.editing = !this.editing;
          button.setAttribute("aria-pressed", String(this.editing));
          this.render();
        }
        if (action === "toggle-size") {
          this.resizeMode = !this.resizeMode;
          button.setAttribute("aria-pressed", String(this.resizeMode));
          this.render();
        }
        if (action === "reset") {
          this.resetLayout();
          this.toolbar.querySelector('[data-wbf-action="toggle-open"]').textContent = "折叠";
          this.toolbar.querySelector('[data-wbf-action="toggle-edit"]').setAttribute("aria-pressed", "false");
          this.toolbar.querySelector('[data-wbf-action="toggle-size"]').setAttribute("aria-pressed", "false");
        }
      });

      this.editor.addEventListener("input", (event) => {
        const field = event.target.dataset.field;
        if (!field) return;
        this._updateSelectedField(field, event.target.value);
      });

      this.editor.addEventListener("change", (event) => {
        const field = event.target.dataset.field;
        if (!field) return;
        this._updateSelectedField(field, event.target.value);
      });

      this.editor.addEventListener("click", (event) => {
        const button = event.target.closest("button");
        if (!button) return;
        const action = button.dataset.editorAction;
        if (action === "add") {
          this.addItem({
            ring: "main",
            angle: 0,
            radius: RINGS.main.radius,
            label: "新功能",
            icon: "more",
            action: "custom.action",
          });
        }
        if (action === "delete" && this.selectedId) {
          this.removeItem(this.selectedId);
        }
      });
    }

    _pressItem(button, item) {
      button.animate(
        [
          { transform: "translate(-50%, -50%) scale(1)" },
          { transform: "translate(-50%, -50%) scale(0.92)" },
          { transform: "translate(-50%, -50%) scale(1.05)" },
          { transform: "translate(-50%, -50%) scale(1)" },
        ],
        { duration: 260, easing: "cubic-bezier(.2,.8,.2,1)" }
      );

      if (typeof this.options.onAction === "function") {
        this.options.onAction(item);
      }
      this._emit("action", item);
      this.root.dispatchEvent(
        new CustomEvent("whiteboard-floating-ball:action", {
          bubbles: true,
          detail: { item: clone(item) },
        })
      );
    }

    _startItemDrag(event, button, item) {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      button.classList.add("is-dragging");

      const onMove = (moveEvent) => {
        const local = this._eventToLocal(moveEvent);
        const dx = local.x - STAGE.cx;
        const dy = local.y - STAGE.cy;
        const distance = Math.hypot(dx, dy);
        const angle = normalizeAngle((Math.atan2(dy, dx) * 180) / Math.PI);
        const next = this._resolveRing(distance, angle);
        item.ring = next.ring;
        item.angle = next.angle;
        item.radius = next.radius;
        this._normalizeItem(item);
        button.className = this._itemClass(item) + " is-dragging";
        this._positionItem(button, item);
      };

      const onUp = () => {
        button.classList.remove("is-dragging");
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        this.renderItems();
        this.renderEditor();
        this._saveState();
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
    }

    _startShellDrag(event) {
      if (this.dragState) return;
      event.preventDefault();
      if ("pointerId" in event) this.core.setPointerCapture(event.pointerId);
      const origin = {
        x: event.clientX,
        y: event.clientY,
        posX: this.position.x,
        posY: this.position.y,
        moved: false,
      };
      this.dragState = origin;

      const onMove = (moveEvent) => {
        const dx = moveEvent.clientX - origin.x;
        const dy = moveEvent.clientY - origin.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) origin.moved = true;
        this.position.x = origin.posX + dx;
        this.position.y = origin.posY + dy;
        this._applyPosition();
      };

      const onUp = () => {
        this.dragState = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("mouseup", onUp);
        if (!origin.moved) {
          this.open = !this.open;
          const toggle = this.toolbar.querySelector('[data-wbf-action="toggle-open"]');
          if (toggle) toggle.textContent = this.open ? "折叠" : "展开";
          this.render();
        }
        this._saveState();
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("mousemove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
      window.addEventListener("mouseup", onUp, { once: true });
    }

    _startResize(event) {
      if (!this.resizeMode || this.resizeState) return;
      event.preventDefault();
      event.stopPropagation();
      if ("pointerId" in event) this.resizeFrame.setPointerCapture(event.pointerId);
      this.shell.classList.add("is-resizing");
      const rect = this.shell.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      const origin = {
        x: event.clientX,
        y: event.clientY,
        center,
        distance: Math.hypot(event.clientX - center.x, event.clientY - center.y),
        scale: this.userScale,
      };
      this.resizeState = origin;

      const onMove = (moveEvent) => {
        const distance = Math.hypot(moveEvent.clientX - origin.center.x, moveEvent.clientY - origin.center.y);
        const delta = (distance - origin.distance) / 520;
        this.userScale = normalizeScale(origin.scale + delta, this.options.minScale, this.options.maxScale);
        this._syncScale();
        this._applyPosition();
        this._syncSizeControl();
      };

      const onUp = () => {
        this.resizeState = null;
        this.shell.classList.remove("is-resizing");
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("mouseup", onUp);
        this._saveState();
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("mousemove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
      window.addEventListener("mouseup", onUp, { once: true });
    }

    _resolveRing(distance, rawAngle) {
      if (distance <= 260) {
        return {
          ring: "main",
          angle: rawAngle,
          radius: clamp(distance, 116, 190),
        };
      }

      if (distance <= 395) {
        const ring = RINGS.color;
        return {
          ring: "color",
          angle: clamp(rawAngle, ring.min, ring.max),
          radius: ring.radius,
        };
      }

      const ring = RINGS.tool;
      return {
        ring: "tool",
        angle: clamp(rawAngle, ring.min, ring.max),
        radius: ring.radius,
      };
    }

    _eventToLocal(event) {
      const rect = this.shell.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) / this.scale,
        y: (event.clientY - rect.top) / this.scale,
      };
    }

    _positionItem(button, item) {
      const point = polarToPoint(item.angle, item.radius || RINGS[item.ring].radius);
      button.style.setProperty("--item-x", point.x.toFixed(2));
      button.style.setProperty("--item-y", point.y.toFixed(2));
    }

    _itemClass(item) {
      const classes = ["wbf-item", `is-${item.ring}`];
      if (item.active) classes.push("wbf-active-ring");
      if (item.id === this.selectedId) classes.push("is-selected");
      return classes.join(" ");
    }

    _updateSelectedField(field, value) {
      const item = this.items.find((entry) => entry.id === this.selectedId);
      if (!item) return;
      if (field === "ring") {
        item.ring = value;
        item.radius = RINGS[value].radius;
        item.angle = clamp(item.angle, RINGS[value].min, RINGS[value].max);
      } else {
        item[field] = value;
      }
      this._normalizeItem(item);
      this.renderItems();
      this._saveState();
    }

    _normalizeItems() {
      this.items.forEach((item) => this._normalizeItem(item));
    }

    _normalizeItem(item) {
      if (!RINGS[item.ring]) item.ring = "main";
      const ring = RINGS[item.ring];
      item.angle = Number.isFinite(Number(item.angle)) ? Number(item.angle) : 0;
      if (item.ring !== "main") item.angle = clamp(item.angle, ring.min, ring.max);
      item.radius = Number.isFinite(Number(item.radius)) ? Number(item.radius) : ring.radius;
      if (item.ring !== "main") item.radius = ring.radius;
      if (!item.id) item.id = `item-${Date.now()}`;
      if (!item.label) item.label = "";
      if (!item.icon) item.icon = "more";
    }

    _syncScale() {
      this.scale = normalizeScale(this.userScale, this.options.minScale, this.options.maxScale);
      this.shell.style.setProperty("--wbf-scale", String(this.scale));
    }

    _setDefaultPosition(force) {
      if (!force && (this.position.x || this.position.y)) return;
      this.position = {
        x: (window.innerWidth - STAGE.width * this.scale) / 2 + 40 * this.scale,
        y: Math.max(12, (window.innerHeight - STAGE.height * this.scale) / 2),
      };
    }

    _applyPosition() {
      const minX = -STAGE.cx * this.scale + 68;
      const maxX = window.innerWidth - STAGE.cx * this.scale - 68;
      const minY = -STAGE.cy * this.scale + 68;
      const maxY = window.innerHeight - STAGE.cy * this.scale - 68;
      this.position.x = clamp(this.position.x, minX, maxX);
      this.position.y = clamp(this.position.y, minY, maxY);
      this.shell.style.setProperty("--wbf-x", `${this.position.x}px`);
      this.shell.style.setProperty("--wbf-y", `${this.position.y}px`);
    }

    _syncSizeControl() {
      if (!this.sizeControls) return;
      this.sizeControls.forEach((control) => {
        control.value = String(this.userScale);
        control.title = `${Math.round(this.scale * 100)}%`;
      });
    }

    _saveState() {
      if (!this.options.storageKey) return;
      const state = {
        items: this.items,
        open: this.open,
        position: this.position,
        scale: this.userScale,
      };
      localStorage.setItem(this.options.storageKey, JSON.stringify(state));
    }

    _loadState() {
      if (!this.options.storageKey) return;
      try {
        const raw = localStorage.getItem(this.options.storageKey);
        if (!raw) return;
        const state = JSON.parse(raw);
        if (Array.isArray(state.items)) this.items = state.items;
        if (typeof state.open === "boolean") this.open = state.open;
        if (state.position) this.position = state.position;
        if (Number.isFinite(Number(state.scale))) {
          this.userScale = normalizeScale(Number(state.scale), this.options.minScale, this.options.maxScale);
        }
        this._normalizeItems();
      } catch (error) {
        localStorage.removeItem(this.options.storageKey);
      }
    }

    _clearState() {
      if (this.options.storageKey) localStorage.removeItem(this.options.storageKey);
    }

    _emit(eventName, payload) {
      const listeners = this.events.get(eventName);
      if (!listeners) return;
      listeners.forEach((callback) => callback(payload));
    }

    _escapeAttribute(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }
  }

  window.WhiteboardFloatingBall = WhiteboardFloatingBall;
})();
