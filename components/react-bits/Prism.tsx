'use client';

import { useEffect, useRef } from 'react';
import { Renderer, Camera, Transform, Program, Mesh, Vec2, Polyhedron } from 'ogl';

interface PrismProps {
  height?: number;
  baseWidth?: number;
  animationType?: 'rotate' | 'hover' | '3drotate';
  glow?: number;
  offset?: { x?: number; y?: number };
  noise?: number;
  transparent?: boolean;
  scale?: number;
  hueShift?: number;
  colorFrequency?: number;
  hoverStrength?: number;
  inertia?: number;
  bloom?: number;
  suspendWhenOffscreen?: boolean;
  timeScale?: number;
  className?: string;
}

const vertex = /* glsl */ `
  attribute vec3 position;
  attribute vec3 normal;
  uniform mat4 modelViewMatrix;
  uniform mat4 projectionMatrix;
  uniform mat3 normalMatrix;
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  varying vec3 vNormal;
  uniform float uTime;
  uniform float uHueShift;
  uniform float uColorFreq;
  uniform float uGlow;
  uniform float uNoise;

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    float hue = fract(uHueShift + vNormal.y * uColorFreq + uTime * 0.1);
    vec3 color = hsv2rgb(vec3(hue, 0.8, 1.0));
    float lighting = max(0.2, dot(vNormal, vec3(0.5, 0.7, 1.0)));
    color *= lighting + uGlow;
    
    if (uNoise > 0.0) {
      color += (random(gl_FragCoord.xy) - 0.5) * uNoise;
    }
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function Prism({
  height = 3.5,
  baseWidth = 5.5,
  animationType = 'rotate',
  glow = 1.0,
  noise = 0.5,
  transparent = true,
  scale = 3.6,
  hueShift = 0,
  colorFrequency = 1.0,
  hoverStrength = 2.0,
  inertia = 0.05,
  timeScale = 0.5,
  className = '',
}: PrismProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef(new Vec2(0));
  const targetRotation = useRef(new Vec2(0));
  const currentRotation = useRef(new Vec2(0));

  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new Renderer({ alpha: transparent, antialias: true });
    const gl = renderer.gl;
    containerRef.current.appendChild(gl.canvas);

    const camera = new Camera(gl, { fov: 35 });
    camera.position.set(0, 0, 10);

    const scene = new Transform();

    // Create Prism Geometry (Pyramid)
    const geometry = new Polyhedron(gl, {
      vertices: new Float32Array([
        0, height / 2, 0,           // Top
        -baseWidth / 2, -height / 2, baseWidth / 2,
        baseWidth / 2, -height / 2, baseWidth / 2,
        baseWidth / 2, -height / 2, -baseWidth / 2,
        -baseWidth / 2, -height / 2, -baseWidth / 2,
      ]),
      indices: new Uint16Array([
        0, 1, 2, 0, 2, 3, 0, 3, 4, 0, 4, 1, // Sides
        1, 3, 2, 1, 4, 3                    // Base
      ]),
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uHueShift: { value: hueShift },
        uColorFreq: { value: colorFrequency },
        uGlow: { value: glow },
        uNoise: { value: noise },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    mesh.setParent(scene);
    mesh.scale.set(scale);

    const handleResize = () => {
      const width = containerRef.current?.clientWidth || 0;
      const height = containerRef.current?.clientHeight || 0;
      renderer.setSize(width, height);
      camera.perspective({ aspect: width / height });
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    let raf: number;
    const update = (time: number) => {
      raf = requestAnimationFrame(update);
      program.uniforms.uTime.value = time * 0.001 * timeScale;

      if (animationType === 'rotate') {
        mesh.rotation.y += 0.01 * timeScale;
      } else if (animationType === 'hover') {
        targetRotation.current.set(mouse.current.y * hoverStrength, mouse.current.x * hoverStrength);
        currentRotation.current.lerp(targetRotation.current, inertia);
        mesh.rotation.set(currentRotation.current.x, currentRotation.current.y, 0);
      }

      renderer.render({ scene, camera });
    };

    raf = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(raf);
      gl.canvas.remove();
    };
  }, [height, baseWidth, animationType, glow, noise, transparent, scale, hueShift, colorFrequency, hoverStrength, inertia, timeScale]);

  return <div ref={containerRef} className={`absolute inset-0 w-full h-full overflow-hidden ${className}`} />;
}
