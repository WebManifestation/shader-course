import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'stats.js';
import { Uniform } from "three";

let container, controls;
let camera, scene, renderer;

const uniforms = {
  u_time: {
    value: 0.0
  },
  u_mouse: {
    value: { x: 0.0, y: 0.0 },
  },
  u_resolution: {
    value: { x: 0.0, y: 0.0 },
  },
  u_color: {
    value: new THREE.Color(0xff0000)
  }
}
const clock = new THREE.Clock();

const stats = new Stats();
stats.domElement.style.right = 0;
stats.domElement.style.left = 'initial';
document.body.appendChild(stats.dom);

const vshader = `
void main(){
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 0.5, 1.0);
}
`
const fshader = `
uniform float u_time;
uniform vec2 u_mouse;
uniform vec2 u_resolution;
uniform vec3 u_color;
void main(){
  // vec2 v = u_mouse/u_resolution;
  // vec3 color = vec3(v.x, v.y, 0.0);
  vec3 color = vec3((sin(u_time) + 1.0)/2.0, (cos(u_time) + 1.0)/2.0, 0.0);
  gl_FragColor = vec4(color, 1.0);
}
`

init();

function addItems() {

}

function addLights() {

}

function init() {
  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.OrthographicCamera(-1, 1, 0.1, 10);

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.shadowMap.enabled = true;
  // renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // renderer.toneMappingExposure = 0.8;
  // renderer.outputEncoding = THREE.sRGBEncoding

  container.appendChild(renderer.domElement);

  const geometry = new THREE.PlaneGeometry(2, 2);

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vshader,
    fragmentShader: fshader,
  });
  const plane = new THREE.Mesh(geometry, material);

  scene.add(plane);

  camera.position.set(0, 0, 1);
  // controls = new OrbitControls(camera, renderer.domElement);
  // controls.addEventListener('change', render);
  // controls.enabled = false;
  // controls.autoRotate = true;
  // controls.minDistance = 2;
  // controls.maxDistance = 10
  // controls.target.set(0, 0, 4);
  // controls.update();

  addLights();
  addItems();

  onWindowResize();

  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('mousemove', onMove, false);
  animate();
}

function onMove(event) {
  uniforms.u_mouse.value.x = (event.touches) ? event.touches[0].clientX : event.clientX;
  uniforms.u_mouse.value.y = (event.touches) ? event.touches[0].clientY : event.clientY;
}

function onWindowResize() {
  const aspectRatio = window.innerWidth/window.innerHeight;
  let width, height;
  if (aspectRatio>=1){
    width = 1;
    height = (window.innerHeight/window.innerWidth) * width;
  }else{
    width = aspectRatio;
    height = 1;
  }
  camera.left = -width;
  camera.right = width;
  camera.top = height;
  camera.bottom = -height;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
  uniforms.u_resolution.value.x = window.innerWidth;
  uniforms.u_resolution.value.y = window.innerHeight;
}

function animate() {
  stats.begin();
  
  // controls.update();
  renderer.render(scene, camera);

  uniforms.u_time.value = clock.getElapsedTime();
  
  stats.end();
  requestAnimationFrame(animate);
}