import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

export class TourAvatar {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private avatar: THREE.Group | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private animations: Map<string, THREE.AnimationAction> = new Map();
  private container: HTMLElement;
  private animationId: number | null = null;
  private currentAction: THREE.AnimationAction | null = null;
  private clock: THREE.Clock;
  private modelUrl: string;

  constructor(container: HTMLElement, modelUrl?: string) {
    this.container = container;
    this.clock = new THREE.Clock();
    this.modelUrl = modelUrl || this.getDefaultModelUrl();

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
      antialias: true,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    this.setupLights();
    this.loadAvatar();

    window.addEventListener("resize", this.handleResize.bind(this));
    this.animate();
  }

  private getDefaultModelUrl(): string {
    // Try to detect script location for CDN usage
    const scriptTag = document.querySelector('script[src*="tourify-widget"]') as HTMLScriptElement;
    
    if (scriptTag) {
      const scriptUrl = new URL(scriptTag.src);
      const baseUrl = scriptUrl.origin + scriptUrl.pathname.replace('/tourify-widget.js', '');
      return `${baseUrl}/Chick.gltf`;
    }
    
    return '/Chick.gltf';
  }

  private loadAvatar(): void {
    const loader = new GLTFLoader();

    loader.load(
      this.modelUrl,
      (gltf) => {
        this.avatar = gltf.scene;
        this.scene.add(this.avatar);

        this.avatar.scale.set(1.5, 1.5, 1.5);
        this.avatar.position.set(0, -0.8, -0.5);
        this.avatar.rotation.set(0, 0.75, 0);

        this.mixer = new THREE.AnimationMixer(this.avatar);

        gltf.animations.forEach((clip) => {
          const action = this.mixer!.clipAction(clip);
          this.animations.set(clip.name, action);
          console.log("Available animation:", clip.name);
        });

        this.playAnimation("Idle", true);
      },
      undefined,
      (error) => {
        console.error("Error loading avatar:", error);
      }
    );
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

    const delta = this.clock.getDelta();

    if (this.mixer) {
      this.mixer.update(delta);
    }

    this.renderer.render(this.scene, this.camera);
  }

  private handleResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  private playAnimation(
    name: string,
    loop: boolean = false,
    fadeDuration: number = 0.3
  ): void {
    const action = this.animations.get(name);
    if (!action) {
      console.warn(`Animation "${name}" not found`);
      return;
    }

    if (this.currentAction && this.currentAction !== action) {
      this.currentAction.fadeOut(fadeDuration);
    }

    action.reset();
    action.setLoop(
      loop ? THREE.LoopRepeat : THREE.LoopOnce,
      loop ? Infinity : 1
    );
    action.clampWhenFinished = true;
    action.fadeIn(fadeDuration);
    action.play();

    this.currentAction = action;
  }

  public peck(): void {
    this.playAnimation("Attack", false, 0.2);
    setTimeout(() => {
      this.playAnimation("Idle", true, 0.3);
    }, 1000);
  }

  public run(): void {
    this.playAnimation("Run", true, 0.2);
    setTimeout(() => {
      this.playAnimation("Idle", true, 0.3);
    }, 1500);
  }

  public eat(): void {
    this.playAnimation("Idle_Peck", false, 0.2);
    setTimeout(() => {
      this.playAnimation("Idle", true, 0.3);
    }, 800);
  }

  public destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    window.removeEventListener("resize", this.handleResize.bind(this));

    if (this.mixer) {
      this.mixer.stopAllAction();
    }

    if (this.avatar) {
      this.scene.remove(this.avatar);
      this.avatar.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    this.renderer.dispose();

    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(
        this.renderer.domElement
      );
    }
  }
}