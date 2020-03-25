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
  u_offset: {
    value: { x: -0.7891539151645935, y: 0.16092172890358905  },
  },
  u_scale: {
    value: 2.0
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
// varying vec2 v_uv;
varying vec3 v_position;
void main(){
  // v_uv = uv;
  v_position = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position * 1.0, 1.0);
}
`
const fshader = `
// uniform float u_time;
// uniform vec2 u_mouse;
// uniform vec2 u_resolution;
// uniform vec3 u_color;
uniform vec2 u_offset;
uniform float u_scale;
// varying vec2 v_uv;
varying vec3 v_position;

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main(){
  
  // vec2 v = u_mouse/u_resolution;
  // vec3 color = vec3(v.x, v.y, 0.0);
  // vec3 color = vec3((sin(u_time) + 1.0)/2.0, (cos(u_time) + 1.0)/2.0, 0.0);
  // vec2 uv = gl_FragCoord.xy/u_resolution;
  // vec3 color = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), uv.y);
  // vec3 color = vec3(v_uv, 0.0);

  // double test = 0.1;

  float scale = u_scale;
  vec3 centerPosition = v_position + vec3(0.5, 0.5, 0);
  float a = map(centerPosition.x, 0.0, 1.0, -scale, scale) + u_offset.x;
  float b = map(centerPosition.y, 0.0, 1.0, -scale, scale) + u_offset.y;

  float zReal = a;
  float zImag = b;

  float n = 0.0;
  for(float i = 0.0; i < 100.0; i++) {
    float real = zReal * zReal - zImag * zImag;
    float imag = 2.0 * zReal * zImag;
    zReal = real + a;
    zImag = imag + b;
    if (zReal * zReal + zImag * zImag > 16.0) {
      break;
    }
    n++;
  }

  float brightness = map(n, 0.0, 100.0, 0.0, 1.0);
  float red = map(n, 0.0, 100.0, 1.0, 0.0);
  float green = map(n, 0.0, 100.0, 1.0, 0.0);
  float blue = map(n, 0.0, 100.0, 1.0, 0.0);

  // vec3 color = vec3(red, green, blue);
  vec3 color = vec3(brightness, brightness, brightness);
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
  const geometry = new THREE.PlaneGeometry(2, 2 * window.innerHeight / window.innerWidth);

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
  window.addEventListener('keydown', onKeyDown, false);
  window.addEventListener('click', onClick, false);
  // animate();
  renderer.render(scene, camera);
}

function map(value, min1, max1, min2, max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

function onClick() {
  const mouseX = (event.touches) ? event.touches[0].clientX : event.clientX;
  const mouseY = (event.touches) ? event.touches[0].clientY : event.clientY;
  const x = map(mouseX, 0, window.innerWidth, -uniforms.u_scale.value, uniforms.u_scale.value);
  const y = map(mouseY, 0, window.innerHeight, -uniforms.u_scale.value, uniforms.u_scale.value);
  uniforms.u_scale.value *= 0.9;
  uniforms.u_offset.value.x += x;
  uniforms.u_offset.value.y -= y;
  renderer.render(scene, camera);
  console.log(uniforms.u_offset.value.x, uniforms.u_offset.value.y);
  console.log(uniforms.u_scale.value);
}

function onKeyDown(e) {
  const moveAmount = 0.1;
  // console.log(e.keyCode);
  if (event.keyCode === 37) { //Left
    uniforms.u_offset.value.x -= moveAmount;
  } else if (event.keyCode === 38) { //Up
    uniforms.u_offset.value.y += moveAmount;
  } else if (event.keyCode === 39) { //Right
    uniforms.u_offset.value.x += moveAmount;
  } else if (event.keyCode === 40) { //Down
    uniforms.u_offset.value.y -= moveAmount;
  } else if (event.keyCode === 27) { //Esc
    uniforms.u_scale.value *= 1.1;
  } else if (event.keyCode === 32) { //Esc
    uniforms.u_scale.value *= 0.95;
  }
  renderer.render(scene, camera);
}

function onMove(event) {
  uniforms.u_mouse.value.x = (event.touches) ? event.touches[0].clientX : event.clientX;
  uniforms.u_mouse.value.y = (event.touches) ? event.touches[0].clientY : event.clientY;
}

function onWindowResize() {
  const aspectRatio = window.innerWidth / window.innerHeight;
  let width, height;
  if (aspectRatio >= 1) {
    width = 1;
    height = (window.innerHeight / window.innerWidth) * width;
  } else {
    width = aspectRatio;
    height = 1;
  }
  camera.left = -width;
  camera.right = width;
  camera.top = height;
  camera.bottom = -height;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  uniforms.u_resolution.value.x = window.innerWidth;
  uniforms.u_resolution.value.y = window.innerHeight;

  renderer.render(scene, camera);
}

function animate() {
  stats.begin();

  // controls.update();
  renderer.render(scene, camera);

  // uniforms.u_time.value = clock.getElapsedTime();

  stats.end();
  requestAnimationFrame(animate);
}