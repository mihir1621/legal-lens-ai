'use client';
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform, Raycast, Vec2 } from 'ogl';
import { useEffect, useRef } from 'react';

type GL = Renderer['gl'];

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: number;
  return function (this: any, ...args: Parameters<T>) {
    window.clearTimeout(timeout);
    timeout = window.setTimeout(() => func.apply(this, args), wait);
  };
}

function lerp(p1: number, p2: number, t: number): number {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance: any): void {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach(key => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function getFontSize(font: string): number {
  const match = font.match(/(\d+)px/);
  return match ? parseInt(match[1], 10) : 30;
}

function createTextTexture(
  gl: GL,
  text: string,
  font: string = 'bold 30px Inter, sans-serif',
  color: string = 'white'
): { texture: Texture; width: number; height: number } {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get 2d context');

  context.font = font;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width);
  const fontSize = getFontSize(font);
  const textHeight = Math.ceil(fontSize * 1.2);

  canvas.width = textWidth + 20;
  canvas.height = textHeight + 20;

  context.font = font;
  context.fillStyle = color;
  context.textBaseline = 'middle';
  context.textAlign = 'center';
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new Texture(gl, { generateMipmaps: false });
  texture.image = canvas;
  return { texture, width: canvas.width, height: canvas.height };
}

class Title {
  gl: GL;
  plane: Mesh;
  renderer: Renderer;
  text: string;
  textColor: string;
  font: string;
  mesh!: Mesh;

  constructor({ gl, plane, renderer, text, textColor = 'white', font = 'bold 30px Inter, sans-serif' }: any) {
    autoBind(this);
    this.gl = gl;
    this.plane = plane;
    this.renderer = renderer;
    this.text = text;
    this.textColor = textColor;
    this.font = font;
    this.createMesh();
  }

  createMesh() {
    const { texture, width, height } = createTextTexture(this.gl, this.text, this.font, this.textColor);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform sampler2D tMap;
        varying vec2 vUv;
        void main() {
          vec4 color = texture2D(tMap, vUv);
          if (color.a < 0.1) discard;
          gl_FragColor = color;
        }
      `,
      uniforms: { tMap: { value: texture } },
      transparent: true
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    const aspect = width / height;
    const textHeightScaled = this.plane.scale.y * 0.15;
    const textWidthScaled = textHeightScaled * aspect;
    this.mesh.scale.set(textWidthScaled, textHeightScaled, 1);
    this.mesh.position.y = -this.plane.scale.y * 0.5 - textHeightScaled * 0.5 - 0.05;
    this.mesh.setParent(this.plane);
  }
}

class Media {
  extra: number = 0;
  geometry: Plane;
  gl: GL;
  image: string;
  index: number;
  length: number;
  renderer: Renderer;
  scene: Transform;
  screen: any;
  text: string;
  viewport: any;
  bend: number;
  textColor: string;
  borderRadius: number;
  font?: string;
  program!: Program;
  plane!: Mesh;
  title!: Title;
  scale!: number;
  padding!: number;
  width!: number;
  widthTotal!: number;
  x!: number;
  speed: number = 0;
  isBefore: boolean = false;
  isAfter: boolean = false;
  hoverProgress: number = 0;
  isHovered: boolean = false;
  baseScaleX: number = 0;
  baseScaleY: number = 0;

  constructor({
    geometry,
    gl,
    image,
    index,
    length,
    renderer,
    scene,
    screen,
    text,
    viewport,
    bend,
    textColor,
    borderRadius = 0,
    font
  }: any) {
    this.geometry = geometry;
    this.gl = gl;
    this.image = image;
    this.index = index;
    this.length = length;
    this.renderer = renderer;
    this.scene = scene;
    this.screen = screen;
    this.text = text;
    this.viewport = viewport;
    this.bend = bend;
    this.textColor = textColor;
    this.borderRadius = borderRadius;
    this.font = font;
    this.createShader();
    this.createMesh();
    this.createTitle();
    this.onResize();
  }

  createShader() {
    const texture = new Texture(this.gl, {
      generateMipmaps: true
    });
    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      vertex: `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uSpeed;
        uniform float uTime;
        uniform float uBend;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vec3 p = position;
          // Bending effect: curve the mesh based on its local x position
          // This creates a more authentic 'circular' feel than just rotating the plane
          p.z = (sin(p.x * 2.0) * uBend * 0.2);
          // Add ripple during movement
          p.z += (sin(p.x * 4.0 + uTime) * 1.5 + cos(p.y * 2.0 + uTime) * 1.5) * (0.02 + abs(uSpeed) * 0.5);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragment: `
        precision highp float;
        uniform vec2 uImageSizes;
        uniform vec2 uPlaneSizes;
        uniform sampler2D tMap;
        uniform float uBorderRadius;
        uniform float uHover;
        varying vec2 vUv;
        
        float roundedBoxSDF(vec2 p, vec2 b, float r) {
          vec2 d = abs(p) - b;
          return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r;
        }
        
        void main() {
          vec2 ratio = vec2(
            min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
            min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
          );
          vec2 uv = vec2(
            vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
            vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
          );
          vec4 color = texture2D(tMap, uv);
          
          // Enhanced visibility on hover: increase brightness and contrast
          color.rgb += uHover * 0.15;
          color.rgb = mix(color.rgb, vec3(1.0), uHover * 0.05); // Subtle white glow
          
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float alpha = 1.0 - smoothstep(-0.002, 0.002, d);
          gl_FragColor = vec4(color.rgb, alpha * color.a);
        }
      `,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
        uViewportSizes: { value: [this.viewport.width, this.viewport.height] },
        uSpeed: { value: 0 },
        uTime: { value: 100 * Math.random() },
        uBend: { value: this.bend },
        uBorderRadius: { value: this.borderRadius },
        uHover: { value: 0 }
      },
      transparent: true
    });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      texture.image = img;
      this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program
    });
    this.plane.setParent(this.scene);
  }

  createTitle() {
    this.title = new Title({
      gl: this.gl,
      plane: this.plane,
      renderer: this.renderer,
      text: this.text,
      textColor: this.textColor,
      font: this.font
    });
  }

  update(scroll: any, direction: string) {
    this.plane.position.x = this.x - scroll.current - this.extra;

    const x = this.plane.position.x;
    const H = this.viewport.width / 2;

    if (this.bend === 0 || H === 0) {
      this.plane.position.y = 0;
      this.plane.rotation.z = 0;
    } else {
      const B_abs = Math.max(0.0001, Math.abs(this.bend));
      const R = (H * H + B_abs * B_abs) / (2 * B_abs);
      const effectiveX = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(Math.max(0, R * R - effectiveX * effectiveX));
      if (this.bend > 0) {
        this.plane.position.y = -arc;
        this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
      } else {
        this.plane.position.y = arc;
        this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
      }
    }

    this.speed = scroll.current - scroll.last;
    // Clamp speed to prevent crazy distortions or clipping
    const clampedSpeed = Math.max(-2, Math.min(2, this.speed));
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = clampedSpeed;

    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
    this.isAfter = this.plane.position.x - planeOffset > viewportOffset;

    // Smoothly interpolate hover state
    this.hoverProgress = lerp(this.hoverProgress || 0, this.isHovered ? 1 : 0, 0.1);
    this.program.uniforms.uHover.value = this.hoverProgress;
    
    // SCALE the mesh slightly on hover for "visibility/feedback"
    const scaleFactor = 1.0 + this.hoverProgress * 0.05;
    this.plane.scale.set(this.baseScaleX * scaleFactor, this.baseScaleY * scaleFactor, 1);

    if (direction === 'right' && this.isBefore) {
      this.extra -= this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
    if (direction === 'left' && this.isAfter) {
      this.extra += this.widthTotal;
      this.isBefore = this.isAfter = false;
    }
  }

  onResize({ screen, viewport }: any = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      if (this.plane.program.uniforms.uViewportSizes) {
        this.plane.program.uniforms.uViewportSizes.value = [this.viewport.width, this.viewport.height];
      }
    }
    this.scale = this.screen.height / 1500;
    this.plane.scale.y = (this.viewport.height * (900 * this.scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (700 * this.scale)) / this.screen.width;
    this.baseScaleX = this.plane.scale.x;
    this.baseScaleY = this.plane.scale.y;
    this.plane.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.padding = 2.5;
    this.width = this.plane.scale.x + this.padding;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
  }
}

class App {
  container: HTMLElement;
  scrollSpeed: number;
  scroll: any;
  onCheckDebounce: (...args: any[]) => void;
  renderer!: Renderer;
  gl!: GL;
  camera!: Camera;
  scene!: Transform;
  planeGeometry!: Plane;
  medias: Media[] = [];
  screen: any;
  viewport: any;
  raf: number = 0;
  isDown: boolean = false;
  isHovered: boolean = false;
  start: number = 0;
  mouse: Vec2 = new Vec2();
  raycast: Raycast;
  onMove: any;

  constructor(container: HTMLElement, config: any) {
    this.container = container;
    this.scrollSpeed = config.scrollSpeed || 2;
    this.scroll = { ease: config.scrollEase || 0.05, current: 0, target: 0, last: 0 };
    this.onCheckDebounce = debounce(this.onCheck.bind(this), 200);
    this.onMove = this.onTouchMove.bind(this);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.raycast = new Raycast();
    this.onResize();
    this.createGeometry();
    this.createMedias(config.items, config.bend, config.textColor, config.borderRadius, config.font);
    this.update();
    this.addEventListeners();
  }

  createRenderer() {
    this.renderer = new Renderer({ alpha: true, antialias: true, dpr: Math.min(window.devicePixelRatio, 2) });
    this.gl = this.renderer.gl;
    this.gl.clearColor(0, 0, 0, 0);
    this.container.appendChild(this.gl.canvas);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = 45;
    this.camera.position.z = 20;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, { heightSegments: 50, widthSegments: 100 });
  }

  createMedias(items: any[], bend: number, textColor: string, borderRadius: number, font: string) {
    const galleryItems = items && items.length ? items : [];
    const images = galleryItems.concat(galleryItems);
    this.medias = images.map((data: any, index: number) => {
      return new Media({
        geometry: this.planeGeometry,
        gl: this.gl,
        image: data.image,
        index,
        length: images.length,
        renderer: this.renderer,
        scene: this.scene,
        screen: this.screen,
        text: data.text,
        viewport: this.viewport,
        bend,
        textColor,
        borderRadius,
        font
      });
    });
  }

  onResize() {
    if (!this.container) return;
    this.screen = { width: this.container.clientWidth, height: this.container.clientHeight };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { width, height };
    if (this.medias) this.medias.forEach(m => m.onResize({ screen: this.screen, viewport: this.viewport }));
  }

  onTouchDown(e: any) {
    this.isDown = true;
    this.scroll.position = this.scroll.target;
    this.start = e.touches ? e.touches[0].clientX : e.clientX;
    this.container.style.cursor = 'grabbing';
    
    // Add global move listeners
    window.addEventListener('mousemove', this.onMove);
    window.addEventListener('touchmove', this.onMove);
  }

  onTouchMove(e: any) {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Update mouse for interaction logic
    const rect = this.container.getBoundingClientRect();
    this.mouse.set(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);

    if (!this.isDown) return;
    
    const distance = (this.start - x) * (this.scrollSpeed * 0.02);
    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp() {
    this.isDown = false;
    this.onCheck();
    window.removeEventListener('mousemove', this.onMove);
    window.removeEventListener('touchmove', this.onMove);
    this.container.style.cursor = 'grab';
  }

  onWheel(e: any) {
    this.scroll.target += e.deltaY * 0.005 * this.scrollSpeed;
    this.onCheckDebounce();
  }

  onClick(e: any) {
    const rect = this.container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.mouse.set(x, y);

    this.raycast.castMouse(this.camera, this.mouse);
    const intersects = this.raycast.intersectBounds(this.medias.map(m => m.plane));
    
    if (intersects.length) {
      const hit = intersects[0] as Mesh;
      const media = this.medias.find(m => m.plane === hit);
      if (media) {
          // Calculate target to center this plane
          // The current position of the plane is media.x - scroll.current - media.extra
          // We want its plane.position.x to be 0
          // 0 = media.x - target - media.extra  => target = media.x - media.extra
          this.scroll.target = media.x - media.extra;
      }
    }
  }

  onCheck() {
    if (!this.medias[0]) return;
    const width = this.medias[0].width;
    const index = Math.round(Math.abs(this.scroll.target) / width);
    this.scroll.target = Math.sign(this.scroll.target) * index * width;
  }

  update() {
    // Live Raycasting for card-hover state
    this.raycast.castMouse(this.camera, this.mouse);
    const intersects = this.raycast.intersectBounds(this.medias.map(m => m.plane));
    const hoveredMesh = intersects.length ? (intersects[0] as Mesh) : null;
    
    this.medias.forEach(m => {
        m.isHovered = (m.plane === hoveredMesh);
    });

    // Rotation logic
    if (!this.isDown) {
      // Significantly increased speed as requested (scrollSpeed * base)
      const baseSpeed = 0.008 * this.scrollSpeed;
      const mouseInfluence = this.isHovered ? (this.mouse.x * 0.15 * this.scrollSpeed) : 0;
      
      this.scroll.target += baseSpeed + mouseInfluence;
    }

    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';
    this.medias.forEach(m => m.update(this.scroll, direction));
    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current;
    this.raf = window.requestAnimationFrame(this.update.bind(this));
  }

  addEventListeners() {
    window.addEventListener('resize', this.onResize.bind(this));
    this.container.addEventListener('mousedown', this.onTouchDown.bind(this));
    this.container.addEventListener('touchstart', this.onTouchDown.bind(this));
    
    // Use onMove for hover-parallax
    this.container.addEventListener('mousemove', this.onMove);
    this.container.addEventListener('touchmove', this.onMove);
    
    window.addEventListener('mouseup', this.onTouchUp.bind(this));
    window.addEventListener('touchend', this.onTouchUp.bind(this));
    
    this.container.addEventListener('wheel', this.onWheel.bind(this));
    this.container.addEventListener('click', this.onClick.bind(this));
    this.container.addEventListener('mouseenter', () => { this.isHovered = true; });
    this.container.addEventListener('mouseleave', () => { this.isHovered = false; });
  }

  destroy() {
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize.bind(this));
    if (this.gl.canvas.parentNode) this.gl.canvas.parentNode.removeChild(this.gl.canvas);
  }
}

export default function CircularGallery({
  items,
  bend = 3,
  textColor = '#ffffff',
  borderRadius = 0.05,
  font = 'bold 30px Inter, sans-serif',
  scrollSpeed = 2,
  scrollEase = 0.05
}: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const app = new App(containerRef.current, { items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase });
    return () => app.destroy();
  }, [items, bend, textColor, borderRadius, font, scrollSpeed, scrollEase]);

  return <div ref={containerRef} className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing relative touch-none" />;
}
