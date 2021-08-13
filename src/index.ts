import {
  BoxGeometry,
  Frustum,
  Line3,
  Mesh,
  MeshNormalMaterial,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";

const random = (min = -1, max = 1) => min + Math.random() * (max - min);

const lineAtDepth = (depth: number) =>
  new Line3(new Vector3(-1000000, 1, depth), new Vector3(1000000, 1, depth));

const frustumWidthAtDepth = (frustum: Frustum, depth: number) => {
  const line = lineAtDepth(depth);
  const [pointA, pointB] = frustum.planes
    .map((plane) => plane.intersectLine(line, new Vector3()))
    .filter((p): p is Vector3 => !!p);
  return pointA.distanceTo(pointB);
};

const buildCube = (frustum: Frustum) => {
  const depth = random(1.5, 10) ** 2;
  const height = random(0.8, 1.05) ** 10;
  const width = random(0.1, 0.3);
  const mesh = new Mesh(
    new BoxGeometry(width, height, random(0.1, 0.3)),
    new MeshNormalMaterial()
  );
  const xWidth = frustumWidthAtDepth(frustum, depth) + 2 * width;
  mesh.position.x = random(-xWidth / 2, xWidth / 2);
  mesh.position.y = height / 2;
  mesh.position.z = -depth;
  const update = (time: number, frustum: Frustum) => {
    mesh.position.x += -(time / 1000);
    if (mesh.position.x < 0 && !frustum.intersectsObject(mesh)) {
      mesh.position.x *= -1;
      // TODO idea: feel free to change the size of the box here
    }
  };
  return { mesh, update };
};

const buildCubes = (count: number, frustum: Frustum) =>
  new Array(count).fill(0).map(() => buildCube(frustum));

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

const cubes = buildCubes(2000, frustum);
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
