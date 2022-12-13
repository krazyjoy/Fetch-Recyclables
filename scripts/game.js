


class Game{

    // create bottles obstacles
    

    constructor(scene, camera){
        // initialize variables
        this._initializeScene(scene,camera);

    

        // prepare 3D scene
        // bind event callbacks
        document.addEventListener("keydown", this._keydown.bind(this));
        document.addEventListener("keyup", this._keyup.bind(this));
    }

    update(){
        // event handling
        // recapsulate the game state
        this.time += this.clock.getDelta(); 
        /*------------------------------*/
        //recompute the game state
        this._updateGrid();
        this._checkCollisions();
        this._updateInfoPanel();
    }

    _keydown(event){
        // check for the key to move the robot accordingly
    }

    _keyup(event){
        // reset to idle mode
    }

    _updateGrid(){
        this.grid.material.uniforms.time.value = this.time;
    }

    _checkCollisions(){
        // obstacles
        // bonuses

    }
    _updateInfoPanel(){

    }

    _gameOver(){
        // prepare end state
        // show ui
        // reset variables
    }
    _createRobot(scene){
        var robotBody = new THREE.Mesh(
            new THREE.CylinderGeometry(1,1,0.2,12),
            new THREE.MeshBasicMaterial({color:0x73c2fb }),
        );

        //robotBody.rotateX(85 * Math.PI/100);
        //robotBody.rotateY(100 * Math.PI/100);
        // make a instance viable
        var geometry = new THREE.EdgesGeometry( robotBody.geometry );

        var material = new THREE.LineBasicMaterial( { color: 0xffffff } );

        var wireframe = new THREE.LineSegments( geometry, material );

        wireframe.ro
        scene.add(wireframe);
        this.robot = new THREE.Group(); // create components into one

        this.robot.add(robotBody);
       
        
        
        scene.add(this.robot);
       
        // const x = 0, y=0;
        //  // https://github.com/mrdoob/three.js/blob/master/examples/webgl_geometry_shapes.html
        //  const scannerShape = new THREE.Shape()
        //  const unit = 0.002
        //  scannerShape.moveTo(x+ 4*unit,y+ unit);
        //  scannerShape.lineTo(2*unit,4*unit);
        //  scannerShape.lineTo(6*unit,4*unit);
        //  scannerShape.lineTo(4*unit,unit);
     
        //  const extrudeSettings = {
        //      steps: 2,
        //      depth: 1,
        //      bevelEnabled: true,
        //      bevelThickness: 1,
        //      bevelSize: 1,
        //      bevelOffset: 0,
        //      bevelSegments: 1
        //  };
         
        //  const scanner = new THREE.Mesh( 
        //      new THREE.ExtrudeGeometry( scannerShape, extrudeSettings ),
        //      new THREE.MeshBasicMaterial( { color: 0x00ff00 } )
        //  ) ;
 
         
        //  this.robot.add(scanner);
        //  scanner.position.set(0,0,0);

    }
    _createGrid(scene){

        
    
        // grid size
        let divisions = 30;
        let gridLimit = 200;
        this.grid = new THREE.GridHelper(gridLimit * 2, divisions, 0xccddee, 0xccddee);
    
        // move forward
        const moveableZ = [];
        for (let i = 0; i <= divisions; i++) {
          moveableZ.push(1, 1, 0, 0); // move horizontal lines only (1 - point is moveable)
        }
        this.grid.geometry.setAttribute('moveableZ', new THREE.BufferAttribute(new Uint8Array(moveableZ), 1));
        
        // grid material
        this.speedZ = 5;
        this.grid.material = new THREE.ShaderMaterial({
          uniforms: {
            speedZ: {
              value: this.speedZ
            },
            gridLimits: {
              value: new THREE.Vector2(-gridLimit, gridLimit)
            },
            time: {
              value: 0
            }
          },
          vertexShader: `
            uniform float time;
            uniform vec2 gridLimits;
            uniform float speedZ;
            
            attribute float moveableZ;
            
            varying vec3 vColor;
          
            void main() {
              vColor = vec3(1.0, 1.0, 1.0);
              float limLen = gridLimits.y - gridLimits.x;
              vec3 pos = position;
              if (floor(moveableZ + 0.5) > 0.5) { // if a point has "moveableZ" attribute = 1 
                float zDist = speedZ * time;
                float curZPos = mod((pos.z + zDist) - gridLimits.x, limLen) + gridLimits.x;
                pos.z = curZPos;
              }
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `,
          fragmentShader: `
            varying vec3 vColor;
          
            void main() {
              gl_FragColor = vec4(vColor, 1.); // r, g, b channels + alpha (transparency)
            }
          `,
          vertexColors: THREE.VertexColors
        });
    
        scene.add(this.grid);


        // animate grid
        this.time = 0;
        this.clock = new THREE.Clock();
    }
    _createBottle(){
      // const points = [];
      // for(let i=0; i<5; i++){
      //   points.push(new THREE.Vector2(Math.sin(i*0.4) * 5 +1, -(i-2) * 2));
      // }
      const BottleGeometry = new THREE.CapsuleGeometry(5,6,17,13)
      const material = new THREE.MeshBasicMaterial({color: 0xfff00});

      const bottle = new THREE.Mesh(
        BottleGeometry,
        material
      );

      // randomness
      this._setupObstacles(bottle);

      this.objectsParent.add(bottle);
    }
    _createCarton(){
      const boxGeometry = new THREE.BoxGeometry(1,1,1);
      const material = new THREE.MeshBasicMaterial({color: 0x663377});

      const carton = new THREE.Mesh(boxGeometry, material);

      this._setupObstacles(carton)
      this._cartonScore(carton);

      this.objectsParent.add(carton);
    }
    _setupObstacles(obj, refXPos = 0, refYPos = 1,refZPos = 0){
      // random scale
      
      // obj.scale.set(
      //   this._randomFloat(0.5,2),
      //   this._randomFloat(0.5,2),
      //   this._randomFloat(0.5,2)
      // );

      // random position
      obj.position.set(
        refXPos + this._randomFloat(-50, 50),
        obj.scale.y * 0.5,
        refYPos + 0.0005,
        refZPos - 140 - this._randomFloat(0,100)
      );
    }
    _randomFloat(min, max){
      return Math.random() * (max-min) + min;

    }
    _bottleScore(obj){

    }
    _randomInt(min, max){
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max-min+1)) + min;
    }

    _cartonScore(obj){
      const price = this._randomInt(5,20);
      const ratio = price/20; // deduce size and color of carton
      const size = ratio * 0.5;
      obj.scale.set(size, size, size);

      // remap hue color 0.5~1 based on price 5~20

    }

    _initializeScene(scene, camera){
      // prepare 3D scene
      this._createRobot(scene);
      this._createGrid(scene);

      // obstacle group
      this.objectsParent = new THREE.Group()
      scene.add(this.objectsParent);

      for (let i = 0; i < 3; i++){
        this._createBottle();
        this._createCarton();
      }
      // set up camera
      camera.rotateX(-20 * Math.PI/100);
      camera.position.set(0,1.5,2);
        
       
        
        
    }
}