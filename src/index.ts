import {
  BoxGeometry,
  Frustum,
  Mesh,
  MeshNormalMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";

const random = (min = -1, max = 1) => min + Math.random() * (max - min);

const buildCube = () => {
  const depth = random(1.5, 10) ** 2;
  const height = random(0.8, 1.05) ** 10;
  const mesh = new Mesh(
    new BoxGeometry(random(0.1, 0.3), height, random(0.1, 0.3)),
    new MeshNormalMaterial()
  );
  mesh.position.x = random(-depth, depth);
  mesh.position.y = height / 2;
  mesh.position.z = -depth;
  const update = (time: number, frustum: Frustum) => {
    mesh.position.x += -(time / 1000);
    if (mesh.position.x < 0 && !frustum.intersectsObject(mesh)) {
      mesh.position.x *= -1;
    }
  };
  return { mesh, update };
};

const buildCubes = (count: number) => new Array(count).fill(0).map(buildCube);

const camera = new PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
camera.position.y = 1;

const frustum = new Frustum();
frustum.setFromProjectionMatrix(camera.projectionMatrix);

const scene = new Scene();

const cubes = buildCubes(2000);
cubes.forEach((cube) => scene.add(cube.mesh));

const renderer = new WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
let previousTime = 0;
renderer.setAnimationLoop((time) => {
  const deltaTime = time - previousTime;
  cubes.forEach((cube) => cube.update(deltaTime, frustum));

  renderer.render(scene, camera);
  previousTime = time;
});

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  frustum.setFromProjectionMatrix(camera.projectionMatrix);
};

window.addEventListener("resize", onWindowResize);
document.body.appendChild(renderer.domElement);
