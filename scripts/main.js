//import * as THREE from  '../node_modules/three/build/three.module.js';
//C:\Users\USER\Desktop\RunnerGame\node_modules\three\examples\jsm\libs\stats.module.js
//import {OrbitControls} from '../node_modules/three/build/examples/jsm/controls/OrbitControls.js';
//import Stats from '../node_modules/three/examples/jsm/libs/stats.module.js';
window.onload = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/ window.innerHeight);

    console.log(scene.children.length)
    const renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    document.body.appendChild(renderer.domElement); // append under body

    const gameInstance = new Game(scene, camera);
    /* render recursively */
    function animate() {
        requestAnimationFrame( animate ); // recall function
        gameInstance.update();
        renderer.render( scene, camera );
    }
    animate();

    
}