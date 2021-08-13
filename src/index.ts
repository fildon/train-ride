import {
  BoxGeometry,
  Mesh,
  MeshNormalMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";

const buildCube = () => {
  const depth = 1 + Math.random() * 10;
  const xOffset = Math.random() * 4;
  const spinSpeed = 0.005 + Math.random() * 0.01;
  const mesh = new Mesh(
    new BoxGeometry(0.2, 0.2, 0.2),
    new MeshNormalMaterial()
  );
  mesh.position.z = -depth;
  mesh.position.y = -0.5;
  const update = (time: number) => {
    mesh.rotation.x += spinSpeed;
    mesh.rotation.y += spinSpeed;
    mesh.position.x = 2 - ((time / 1000 + xOffset) % 4);
  };
  return { mesh, update };
};

const buildCubes = (count: number) => new Array(count).fill(0).map(buildCube);

const camera = new PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

const scene = new Scene();

const cubes = buildCubes(30);
cubes.forEach((cube) => scene.add(cube.mesh));

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop((time) => {
  cubes.forEach((cube) => cube.update(time));

  renderer.render(scene, camera);
});
document.body.appendChild(renderer.domElement);
