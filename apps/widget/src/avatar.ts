import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

export class TourAvatar {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private avatar: THREE.Group | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private animations: Map<string, THREE.AnimationAction> = new Map();
  private container: HTMLElement;
  private animationId: number | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    
    this.scene = new THREE.Scene();
    this.scene.background = null;
    
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 3;
    this.camera.position.y = 0.5;
    
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);
    
    this.setupLights();
    this.loadAvatar();
    
    window.addEventListener('resize', this.handleResize.bind(this));
    this.animate();
  }

  private loadAvatar(): void {
    const loader = new GLTFLoader();
    
    // Put your .glb file in public folder
    loader.load('../../public/Chick.gltf', (gltf) => {
      this.avatar = gltf.scene;
      this.scene.add(this.avatar);
      
      // Scale and position
      this.avatar.scale.set(1.5, 1.5, 1.5);
      this.avatar.position.set(0, -0.8, -0.5);
      this.avatar.rotation.set(0, 0.75, 0);
      
      // Setup animation mixer
      this.mixer = new THREE.AnimationMixer(this.avatar);
      
      // Store all animations
      gltf.animations.forEach((clip) => {
        const action = this.mixer!.clipAction(clip);
        this.animations.set(clip.name, action);
        console.log('Available animation:', clip.name);
      });
      
      // Start with Idle animation
      this.playAnimation('Idle', true);
    });
  }

  private setupLights(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 3, 2);
    this.scene.add(directionalLight);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    
    // Update animations
    if (this.mixer) {
      this.mixer.update(0.016); // ~60fps
    }
    
    this.renderer.render(this.scene, this.camera);
  }

  private handleResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
  }

  // Play animation by name with loop option
  private playAnimation(name: string, loop: boolean = false): void {
    const action = this.animations.get(name);
    if (action) {
      // Stop all other animations
      this.animations.forEach(a => a.stop());
      
      // Configure and play
      action.reset();
      action.loop = loop ? THREE.LoopRepeat : THREE.LoopOnce;
      action.clampWhenFinished = true;
      action.play();
    }
  }

  public wave(): void {
    // Use Attack animation for waving
    this.playAnimation('Attack');
    
    // Return to Idle after animation completes
    setTimeout(() => {
      this.playAnimation('Idle', true);
    }, 1000);
  }

  public celebrate(): void {
    // Use Run animation for celebration
    this.playAnimation('Run');
    
    setTimeout(() => {
      this.playAnimation('Idle', true);
    }, 1500);
  }

  public nod(): void {
    // Use Idle_Peck for nodding
    this.playAnimation('Idle_Peck');
    
    setTimeout(() => {
      this.playAnimation('Idle', true);
    }, 800);
  }

  public destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    if (this.avatar) {
      this.scene.remove(this.avatar);
    }
    
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}