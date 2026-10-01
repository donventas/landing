/* Don Ventas B10 — entrada editorial del símbolo 3D aprobada en el Runtime.
   El modelo gira una sola vez, se asienta de frente y conserva el SVG canónico
   para movimiento reducido, WebGL ausente, activos faltantes o fallo de script. */
(() => {
  'use strict';

  const roots = [...document.querySelectorAll('[data-b10-hero-mark]')];
  if (!roots.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const meshUrl = new URL('assets/b10-motion/symbol-b-mesh.json', document.currentScript.src);
  const vertexSource = `#version 300 es
    in vec3 aPosition;
    in vec3 aNormal;
    uniform vec2 uViewport;
    uniform float uAngle;
    out vec3 vNormal;
    void main() {
      float c = cos(uAngle), s = sin(uAngle);
      vec3 p = vec3(aPosition.x*c + aPosition.z*s, aPosition.y, aPosition.z*c - aPosition.x*s);
      vNormal = normalize(vec3(aNormal.x*c + aNormal.z*s, aNormal.y, aNormal.z*c - aNormal.x*s));
      float scale = min(uViewport.x / 66.0, uViewport.y / 65.0);
      float perspective = 145.0 / (145.0 - p.z);
      gl_Position = vec4(2.0*p.x*scale*perspective/uViewport.x,
                         2.0*p.y*scale*perspective/uViewport.y,
                         -p.z/48.0, 1.0);
    }`;
  const fragmentSource = `#version 300 es
    precision highp float;
    in vec3 vNormal;
    uniform vec3 uColor;
    out vec4 fragColor;
    void main() {
      vec3 light = normalize(vec3(-0.32, 0.54, 0.78));
      float diffuse = max(dot(normalize(vNormal), light), 0.0);
      float level = 0.67 + 0.33*diffuse;
      fragColor = vec4(uColor * level, 1.0);
    }`;

  function compile(gl, kind, source) {
    const shader = gl.createShader(kind);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || 'shader compile');
    }
    return shader;
  }

  function fallback(root, message) {
    root.classList.remove('is-3d-ready');
    root.dataset.motionState = 'poster';
    const stage = root.closest('.b10-motion-stage');
    const replay = stage?.querySelector('[data-b10-replay]');
    const status = stage?.querySelector('[data-b10-motion-status]');
    if (replay) replay.hidden = true;
    if (status) status.textContent = message;
  }

  function createViewer(root, mesh, startedAt) {
    const stage = root.closest('.b10-motion-stage');
    const replay = stage?.querySelector('[data-b10-replay]');
    const status = stage?.querySelector('[data-b10-motion-status]');
    const canvas = root.querySelector('canvas');
    if (!stage || !replay || !canvas) return;

    if (reducedMotion.matches) {
      fallback(root, 'Vista estática · movimiento reducido');
      return;
    }

    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: 'low-power'
    });
    if (!gl) {
      fallback(root, 'Vista estática · SVG canónico');
      return;
    }

    try {
      const program = gl.createProgram();
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexSource));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentSource));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program) || 'program link');
      }
      gl.useProgram(program);

      const attributes = {
        position: gl.getAttribLocation(program, 'aPosition'),
        normal: gl.getAttribLocation(program, 'aNormal')
      };
      const uniforms = {
        viewport: gl.getUniformLocation(program, 'uViewport'),
        angle: gl.getUniformLocation(program, 'uAngle'),
        color: gl.getUniformLocation(program, 'uColor')
      };
      const parts = mesh.components.map((part) => {
        const position = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(part.positions), gl.STATIC_DRAW);
        const normal = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normal);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(part.normals), gl.STATIC_DRAW);
        return {
          position,
          normal,
          count: part.positions.length / 3,
          color: [1, 3, 5].map((index) => parseInt(part.color.slice(index, index + 2), 16) / 255)
        };
      });

      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.disable(gl.CULL_FACE);

      let animation = 0;
      let angle = 0;
      let playing = false;

      function draw(nextAngle = angle) {
        angle = nextAngle;
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        const width = Math.max(1, Math.round(root.clientWidth * ratio));
        const height = Math.max(1, Math.round(root.clientHeight * ratio));
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
        gl.viewport(0, 0, width, height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(program);
        gl.uniform2f(uniforms.viewport, width, height);
        gl.uniform1f(uniforms.angle, angle);
        for (const part of parts) {
          gl.bindBuffer(gl.ARRAY_BUFFER, part.position);
          gl.enableVertexAttribArray(attributes.position);
          gl.vertexAttribPointer(attributes.position, 3, gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ARRAY_BUFFER, part.normal);
          gl.enableVertexAttribArray(attributes.normal);
          gl.vertexAttribPointer(attributes.normal, 3, gl.FLOAT, false, 0, 0);
          gl.uniform3fv(uniforms.color, part.color);
          gl.drawArrays(gl.TRIANGLES, 0, part.count);
        }
      }

      function play() {
        if (playing || reducedMotion.matches) return;
        if (document.hidden) {
          root.dataset.motionState = 'rest';
          draw(0);
          if (status) status.textContent = 'Modelo 3D · reposo frontal';
          return;
        }
        playing = true;
        replay.disabled = true;
        root.dataset.motionState = 'playing';
        if (status) status.textContent = 'Entrada editorial · en movimiento';
        const start = performance.now();
        const duration = 2300;
        function frame(now) {
          const t = Math.min(1, (now - start) / duration);
          const turn = Math.min(1, t / 0.76);
          const eased = 1 - Math.pow(1 - turn, 3);
          const settle = Math.max(0, (t - 0.76) / 0.24);
          const degrees = -72 + 80 * eased - 8 * settle;
          draw(degrees * Math.PI / 180);
          if (t < 1) animation = requestAnimationFrame(frame);
          else {
            playing = false;
            replay.disabled = false;
            root.dataset.motionState = 'rest';
            draw(0);
            if (status) status.textContent = 'Modelo 3D · reposo frontal';
          }
        }
        animation = requestAnimationFrame(frame);
      }

      root.classList.add('is-3d-ready');
      root.dataset.motionState = 'ready';
      replay.hidden = false;
      draw(-72 * Math.PI / 180);
      const elapsed = Math.round(performance.now() - startedAt);
      root.dataset.loadMs = String(elapsed);
      if (status) status.textContent = 'Modelo 3D · entrada disponible';
      window.dispatchEvent(new CustomEvent('dv:b10-3d-ready', { detail: { elapsedMs: elapsed } }));

      replay.addEventListener('click', play);
      canvas.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        cancelAnimationFrame(animation);
        fallback(root, 'Vista estática · SVG canónico');
      });
      reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches) {
          cancelAnimationFrame(animation);
          fallback(root, 'Vista estática · movimiento reducido');
        }
      });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && playing) {
          cancelAnimationFrame(animation);
          playing = false;
          replay.disabled = false;
          root.dataset.motionState = 'rest';
          draw(0);
          if (status) status.textContent = 'Modelo 3D · reposo frontal';
        }
      });
      if ('ResizeObserver' in window) new ResizeObserver(() => draw()).observe(root);
      else window.addEventListener('resize', () => draw(), { passive: true });

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            observer.disconnect();
            play();
          }
        }, { threshold: 0.45 });
        observer.observe(root);
      } else play();
    } catch (_error) {
      fallback(root, 'Vista estática · SVG canónico');
    }
  }

  function load(root) {
    if (root.dataset.renderRequested) return;
    root.dataset.renderRequested = 'true';
    if (reducedMotion.matches) {
      fallback(root, 'Vista estática · movimiento reducido');
      return;
    }
    const startedAt = performance.now();
    fetch(meshUrl, { cache: 'force-cache' })
      .then((response) => {
        if (!response.ok) throw new Error('mesh unavailable');
        return response.json();
      })
      .then((mesh) => createViewer(root, mesh, startedAt))
      .catch(() => fallback(root, 'Vista estática · SVG canónico'));
  }

  if ('IntersectionObserver' in window) {
    const loader = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loader.unobserve(entry.target);
          load(entry.target);
        }
      });
    }, { rootMargin: '180px 0px', threshold: 0.01 });
    roots.forEach((root) => loader.observe(root));
  } else roots.forEach(load);
})();
