import { useEffect, useRef } from "react";

const VERTEX_SHADER = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;
uniform float u_time;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_glowIntensity;

#define PI 3.14159265359

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p * 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 p = (gl_FragCoord.xy - u_res * 0.5) / min(u_res.x, u_res.y);
  vec2 m = (u_mouse - u_res * 0.5) / min(u_res.x, u_res.y);

  float mouseDist = length(p - m);
  float lightRadius = 0.15 + 0.02 * sin(u_time * 2.0);
  float light = 1.0 - smoothstep(0.0, lightRadius, mouseDist);
  light = pow(light, 2.0);

  float wobble = fbm(p * 3.0 + u_time * 0.5) * 0.01;
  float distWobble = mouseDist + wobble;

  float dustNoise = fbm(p * 8.0 + u_time * 0.2);
  float dust = dustNoise * exp(-mouseDist * 3.0) * 0.1;
  light += dust;

  float halo = exp(-mouseDist * mouseDist * 6.0) * 0.15;
  vec3 haloColor = vec3(0.9, 0.95, 1.0);
  vec3 col = haloColor * halo;

  vec3 glowColor = mix(vec3(0.92, 0.96, 1.0), vec3(1.0, 1.0, 1.0), light);
  col += glowColor * light * 0.75 * u_glowIntensity;
  col += vec3(0.85, 0.9, 1.0) * dust * u_glowIntensity;

  vec3 bgColor = vec3(0.0, 0.0, 0.0);
  col = mix(bgColor, col, 0.85 + light * 0.15);

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function LightCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const mouseRef = useRef({ x: -1, y: -1, targetX: -1, targetY: -1 });
  const rafRef = useRef<number>(0);
  const isTouchRef = useRef(false);

  useEffect(() => {
    isTouchRef.current = window.matchMedia("(hover: none)").matches;
    if (isTouchRef.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
    if (!gl) return;
    glRef.current = gl;

    const dpr = Math.min(window.devicePixelRatio, 2);

    function resize() {
      if (!canvas || !gl) return;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();

    // Compile shaders
    function createShader(type: number, source: string) {
      const shader = gl!.createShader(type)!;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      return shader;
    }

    const vs = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);
    programRef.current = program;

    // Full-screen triangle
    const vertices = new Float32Array([-1, -1, 3, -1, -1, 3]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_res");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uGlow = gl.getUniformLocation(program, "u_glowIntensity");

    gl.uniform1f(uGlow, 1.0);

    function onPointerMove(e: PointerEvent) {
      mouseRef.current.targetX = e.clientX * dpr;
      mouseRef.current.targetY = (window.innerHeight - e.clientY) * dpr;
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("resize", resize);

    function render(time: number) {
      if (!gl || !program) return;

      const m = mouseRef.current;
      if (m.targetX >= 0) {
        if (m.x < 0) {
          m.x = m.targetX;
          m.y = m.targetY;
        }
        m.x += (m.targetX - m.x) * 0.12;
        m.y += (m.targetY - m.y) * 0.12;
      }

      gl.uniform1f(uTime, time * 0.001);
      gl.uniform2f(uRes, canvas!.width, canvas!.height);
      gl.uniform2f(uMouse, m.x, m.y);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
