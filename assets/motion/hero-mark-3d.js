/* B10 pilot viewer: the GLB and this WebGL scene share one generated mesh JSON.
   Content, links and CTA remain ordinary HTML outside the canvas. */
(() => {
  const meshUrl = new URL('exports/symbol-b-mesh.json', document.currentScript.src);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const vertices = `#version 300 es
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
  const fragments = `#version 300 es
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
  function shader(gl, kind, source) {
    const result = gl.createShader(kind);
    gl.shaderSource(result, source);
    gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(result) || 'shader compile');
    return result;
  }
  function createViewer(root, mesh) {
    const stage = root.closest('.motion-stage');
    const editorial = stage?.dataset.motionMode === 'editorial';
    const button = stage?.querySelector('[data-replay]');
    const status = stage?.querySelector('[data-motion-status]');
    const canvas = root.querySelector('canvas');
    if (!stage || !button || !canvas) return;
    const fallback = (message) => {
      root.classList.remove('motion-ready');
      root.dataset.motionState = 'poster';
      button.hidden = true;
      if (status) { status.hidden = false; status.textContent = message; }
    };
    if (reduced.matches) { fallback('Vista estática · movimiento reducido'); return; }
    const gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: false, powerPreference: 'low-power' });
    if (!gl) { fallback('Vista estática · 3D no disponible'); return; }
    try {
      const program = gl.createProgram();
      gl.attachShader(program, shader(gl, gl.VERTEX_SHADER, vertices));
      gl.attachShader(program, shader(gl, gl.FRAGMENT_SHADER, fragments));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || 'program link');
      gl.useProgram(program);
      const attributes = { position: gl.getAttribLocation(program, 'aPosition'), normal: gl.getAttribLocation(program, 'aNormal') };
      const uniforms = { viewport: gl.getUniformLocation(program, 'uViewport'), angle: gl.getUniformLocation(program, 'uAngle'), color: gl.getUniformLocation(program, 'uColor') };
      const parts = mesh.components.map((part) => {
        const position = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(part.positions), gl.STATIC_DRAW);
        const normal = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normal);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(part.normals), gl.STATIC_DRAW);
        return { position, normal, count: part.positions.length / 3, color: [1, 3, 5].map((i) => parseInt(part.color.slice(i, i + 2), 16) / 255) };
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
        if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
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
        if (playing || reduced.matches) return;
        playing = true;
        button.disabled = true;
        root.dataset.motionState = 'playing';
        const start = performance.now();
        const duration = editorial ? 2300 : 3800;
        function frame(now) {
          const t = Math.min(1, (now - start) / duration);
          // Editorial entrance: modest turn, tiny overshoot, then settle at the exact front.
          // The block specimen keeps the full turn so both directions remain inspectable.
          const turn = Math.min(1, t / .76);
          const eased = 1 - Math.pow(1 - turn, 3);
          const settle = Math.max(0, (t - .76) / .24);
          const degrees = editorial ? (-72 + 80 * eased - 8 * settle) : 360 * (0.5 - 0.5 * Math.cos(Math.PI * t));
          draw(degrees * Math.PI / 180);
          if (t < 1) animation = requestAnimationFrame(frame);
          else { playing = false; button.disabled = false; root.dataset.motionState = 'rest'; draw(0); }
        }
        animation = requestAnimationFrame(frame);
      }
      root.classList.add('motion-ready');
      root.dataset.motionState = 'ready';
      button.hidden = false;
      if (status) status.hidden = true;
      draw();
      button.addEventListener('click', play);
      canvas.addEventListener('webglcontextlost', (event) => { event.preventDefault(); cancelAnimationFrame(animation); fallback('Vista estática · se perdió el contexto 3D'); });
      reduced.addEventListener('change', () => { if (reduced.matches) { cancelAnimationFrame(animation); fallback('Vista estática · movimiento reducido'); } });
      if ('ResizeObserver' in window) new ResizeObserver(() => draw()).observe(root);
      else window.addEventListener('resize', () => draw());
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) { observer.disconnect(); play(); }
        }, { threshold: .5 });
        observer.observe(root);
      } else play();
    } catch (error) {
      fallback('Vista estática · no se pudo iniciar el 3D');
    }
  }
  const roots = [...document.querySelectorAll('[data-hero-mark]')];
  if (!roots.length) return;
  if (reduced.matches) {
    for (const root of roots) {
      root.dataset.motionState = 'poster';
      const status = root.closest('.motion-stage')?.querySelector('[data-motion-status]');
      if (status) { status.hidden = false; status.textContent = 'Vista estática · movimiento reducido'; }
    }
    return;
  }
  function loadMesh() {
    fetch(meshUrl)
      .then((response) => { if (!response.ok) throw new Error('mesh unavailable'); return response.json(); })
      .then((mesh) => roots.forEach((root) => createViewer(root, mesh)))
      .catch(() => roots.forEach((root) => {
        root.dataset.motionState = 'poster';
        const status = root.closest('.motion-stage')?.querySelector('[data-motion-status]');
        if (status) { status.hidden = false; status.textContent = location.protocol === 'file:' ? 'Para ver el giro, abre el preview local HTTP' : 'Vista estática · modelo no disponible'; }
      }));
  }
  function scheduleMesh() {
    if ('requestIdleCallback' in window) window.requestIdleCallback(loadMesh, { timeout: 1600 });
    else window.setTimeout(loadMesh, 450);
  }
  if (document.readyState === 'complete') scheduleMesh();
  else window.addEventListener('load', scheduleMesh, { once: true });
})();
