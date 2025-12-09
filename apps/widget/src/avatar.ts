// avatar.ts - Simple Three.js 3D Avatar for Tour
import * as THREE from 'three';

export class TourAvatar {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private avatar: THREE.Group;
  private container: HTMLElement;
  private animationId: number | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    
    // Setup scene
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent
    
    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;
    
    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);
    
    // Create avatar
    this.avatar = this.createAvatar();
    this.scene.add(this.avatar);
    
    // Add lights
    this.setupLights();
    
    // Handle resize
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Start animation
    this.animate();
  }

  private createAvatar(): THREE.Group {
    const avatar = new THREE.Group();
    
    // Create a simple character using geometric shapes
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffdbac,
      flatShading: false
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.5;
    avatar.add(head);
    
    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.08, 16, 16);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.15, 1.6, 0.4);
    avatar.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.15, 1.6, 0.4);
    avatar.add(rightEye);
    
    // Smile
    const smileCurve = new THREE.EllipseCurve(
      0, 0,
      0.2, 0.15,
      Math.PI, 2 * Math.PI,
      false,
      0
    );
    const smilePoints = smileCurve.getPoints(20);
    const smileGeometry = new THREE.BufferGeometry().setFromPoints(smilePoints);
    const smileMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    const smile = new THREE.Line(smileGeometry, smileMaterial);
    smile.position.set(0, 1.3, 0.5);
    smile.rotation.x = Math.PI;
    avatar.add(smile);
    
    // Body
    const bodyGeometry = new THREE.CylinderGeometry(0.4, 0.5, 1.2, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4a90e2 
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.4;
    avatar.add(body);
    
    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.12, 0.1, 0.8, 16);
    const armMaterial = new THREE.MeshPhongMaterial({ color: 0xffdbac });
    
    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-0.5, 0.5, 0);
    leftArm.rotation.z = Math.PI / 6;
    avatar.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(0.5, 0.5, 0);
    rightArm.rotation.z = -Math.PI / 6;
    avatar.add(rightArm);
    
    return avatar;
  }

  private setupLights(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);
    
    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 3, 2);
    this.scene.add(directionalLight);
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    
    // Gentle rotation and bobbing
    this.avatar.rotation.y += 0.01;
    this.avatar.position.y = Math.sin(Date.now() * 0.001) * 0.1;
    
    this.renderer.render(this.scene, this.camera);
  }

  private handleResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
  }

  // Animation methods
  public wave(): void {
    const rightArm = this.avatar.children.find(
      child => child.position.x > 0 && child instanceof THREE.Mesh
    );
    
    if (rightArm) {
      const startRotation = rightArm.rotation.z;
      const waveAnimation = () => {
        const time = Date.now() * 0.005;
        rightArm.rotation.z = startRotation + Math.sin(time) * 0.5;
      };
      
      // Animate for 2 seconds
      const intervalId = setInterval(waveAnimation, 16);
      setTimeout(() => clearInterval(intervalId), 2000);
    }
  }

  public celebrate(): void {
    // Jump animation
    const startY = this.avatar.position.y;
    const duration = 1000;
    const startTime = Date.now();
    
    const jump = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out bounce
      const height = Math.sin(progress * Math.PI) * 0.5;
      this.avatar.position.y = startY + height;
      
      if (progress < 1) {
        requestAnimationFrame(jump);
      }
    };
    
    jump();
  }

  public nod(): void {
    // Nodding animation
    const head = this.avatar.children[0];
    const startRotation = head.rotation.x;
    const duration = 1000;
    const startTime = Date.now();
    
    const nod = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      head.rotation.x = startRotation + Math.sin(progress * Math.PI * 4) * 0.2;
      
      if (progress < 1) {
        requestAnimationFrame(nod);
      } else {
        head.rotation.x = startRotation;
      }
    };
    
    nod();
  }

  public destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    // Dispose of Three.js objects
    this.avatar.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);
  }
}

// Usage in your tour manager
export function initAvatar(container: HTMLElement): TourAvatar {
  return new TourAvatar(container);
}