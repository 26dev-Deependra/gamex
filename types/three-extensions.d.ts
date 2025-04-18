declare module "three/examples/jsm/controls/OrbitControls" {
  import { Camera } from "three";
  import { EventDispatcher } from "three";
  import { MOUSE } from "three";
  import { Object3D } from "three";
  import { Vector3 } from "three";

  export class OrbitControls extends EventDispatcher {
    constructor(object: Camera, domElement: HTMLElement);

    object: Camera;
    domElement: HTMLElement;

    enabled: boolean;
    target: Vector3;

    minDistance: number;
    maxDistance: number;

    minZoom: number;
    maxZoom: number;

    minPolarAngle: number;
    maxPolarAngle: number;

    minAzimuthAngle: number;
    maxAzimuthAngle: number;

    enableDamping: boolean;
    dampingFactor: number;

    zoomSpeed: number;
    rotateSpeed: number;
    panSpeed: number;

    autoRotate: boolean;
    autoRotateSpeed: number;

    keys: { LEFT: string; UP: string; RIGHT: string };

    mouseButtons: { LEFT: MOUSE; MIDDLE: MOUSE; RIGHT: MOUSE };

    update(): boolean;
    reset(): void;
    dispose(): void;
  }
}

declare module "three/examples/jsm/math/ImprovedNoise" {
  export class ImprovedNoise {
    constructor();
    noise(x: number, y: number, z: number): number;
  }
}
