


class Game{

    // create bottles obstacles
    

    constructor(scene, camera){
        // initialize variables

        this.speedZ = 10;
        this.speedX = 0;
        this.translateX = 0;

        // initialize what to eat & score
        this.divFood = document.getElementById("whatToEat");
        this.score = 0;
        this.divScore = document.getElementById("score");

        const typeOfFood = 2
        this.FoodList = ["bottle","carton"];
        this.Food_id = this._requestFood(typeOfFood);
        this.collideBool = false;
        this.divFood.innerText = this.FoodList[this.Food_id];
        
        // health
        this.health = 100;
        this.divHealth = document.getElementById("health");
        this.divHealth.value = this.health;

        // prepare for check distance
        this.COLLISION_THRESHOLD = 0.4
  
        this._initializeScene(scene,camera);

        

        // prepare 3D scene
        // bind event callbacks
        document.addEventListener("keydown", this._keydown.bind(this));
        document.addEventListener("keyup", this._keyup.bind(this));
    }

    update(){
        // event handling
        // recapsulate the game state

        /* ----- synchronize game state by a clock ----- */
        this.time += this.clock.getDelta(); 
        /*-------update x position based on key events -----*/
        this.translateX += this.speedX * - 0.05 // negative multiple bc robot doesn't move but the grid move
        //console.log("translateX", this.translateX);

        this.collideBool = false;
        //recompute the game state
        this._updateGrid();
        this._checkCollisions();
        this._updateInfoPanel();
    }

    _keydown(event){
        // check for the key to move the robot accordingly
        let newSpeedX;
        switch(event.key){

          case 'ArrowLeft':
            newSpeedX = -1.0;
            break;

          case 'ArrowRight':
            newSpeedX = 1.0;
            break;
          
          default:
            return;
        }
        //console.log("new speed X", newSpeedX);
        this.speedX = newSpeedX;
    }

    _keyup(){
        // reset to idle mode
        this.speedX = 0;
    }

    _updateGrid(){
      
      /* ------------------ change Z position ------------ */
        this.grid.material.uniforms.time.value = this.time;

        this.objectsParent.position.z = this.speedZ * this.time;         // because obstacles are stored in objectsParent, moves everything


      /* ------------------ change X position ------------- */
        this.grid.material.uniforms.translateX.value = this.translateX;
        this.objectsParent.position.x = this.translateX;
        //console.log("position x",  this.objectsParent.position.x)
        /* ---------------Renerate Obstacles---------------- */

        this.objectsParent.traverse((child) => {
        
          if (child instanceof THREE.Mesh) {
            
            // Z-position relative to Robot itself
            var childZPos = child.position.z + this.objectsParent.position.z;
     
            if(childZPos > 0){
              
              // move passed robot, reset object
              this._setPosition(child, this.robot.position.x, 0, -this.objectsParent.position.z);
              
              if (child.userData.type == 'bottle'){
                this._bottleScore(child);
                //console.log("new bottle: ", child.position);

              }
              else if (child.userData.type == 'carton'){
                this._cartonScore(child);
                //console.log("new carton: ", child.position);
              }

            }
          }
        });
    }

    _checkCollisions(){
        // TRAVERSE ALL CHILDREN, use initializeScene() 裡的 objectsParent
        this.objectsParent.traverse((child) => {
            if(child instanceof THREE.Mesh){

              // position of obstacle in world space
              const childZPos = child.position.z + this.objectsParent.position.z;

              // calculate threshold for this obstacle
              const thresholdX = this.COLLISION_THRESHOLD + child.scale.x/2;

              const thresholdZ = this.COLLISION_THRESHOLD + child.scale.z/2;

              // check collision
              if( childZPos > -thresholdZ && Math.abs(child.position.x + this.translateX) < thresholdX){

                  
                  if(this.Food_id == 0){
                      if(child.userData.type == "bottle"){
                        this.collideBool = true;
                        this.score += parseInt(child.userData.price);
                        this.divScore.innerText = "Score:  " + this.score;
                      }
                      else{
                        this.score -= parseInt(child.userData.price)/4;
                        this.divScore.innerText = "Score:  " + this.score;
                        this.health -= 10;
                        this.divHealth.value = this.health;
                      }
                  }
                  else if(this.Food_id == 1){
                      if(child.userData.type == "carton"){
                          this.collideBool = true;
                          this.score += parseInt(child.userData.price);
                          this.divScore.innerText = "Score:  " + this.score;
                      }
                      else{
                          this.score -= parseInt(child.userData.price)/4;
                          this.divScore.innerText = "Score:  " + this.score;
                          this.health -= 10;
                          this.divHealth.value = this.health;
                      }
                  }

                  if(this.collideBool == true){
                    this._setPosition(child, -this.translateX, -this.objectsParent.position.z);
                    this.Food_id = this._requestFood(2);
                    console.log("collision, food id: ", this.Food_id);
                    this.divFood.innerText = this.FoodList[this.Food_id]; 

                  }
              }
            
            }
        })

    }
    _updateInfoPanel(){

    }

    _gameOver(){
        // prepare end state
        // show ui
        // reset variables
    }
    _createRobot(scene){
        const robotBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5,0.5,0.1,12),
            new THREE.MeshBasicMaterial({color:0x73c2fb }),
        );

        //robotBody.scale.set(0.5,0.5,0.5);
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
       
        
        //console.log("robot: ", this.robot.position);
        scene.add(this.robot);
       
       
         
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

        // move left or right
        const moveableX = [];
        for (let i = 0; i <= divisions; i++) {
          moveableZ.push(1, 1, 0, 0); // horizontal lines only (1 - point is moveable)
        
          moveableX.push(0, 0, 1, 1); // vertical lines
        }

        // set custom attributes on mesh
        this.grid.geometry.setAttribute('moveableZ', new THREE.BufferAttribute(new Uint8Array(moveableZ), 1));
        
        this.grid.geometry.setAttribute('moveableX', new THREE.BufferAttribute(new Uint8Array(moveableX), 1));
        // grid material
        
        this.grid.material = new THREE.ShaderMaterial({
          uniforms: {
            speedZ: {
              value: this.speedZ
            },
            translateX:{
              value: this.translateX
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
            uniform float translateX;
            
            attribute float moveableZ;
            attribute float moveableX;

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

              if (floor(moveableX + 0.5) > 0.5){
                float xDist = translateX;
                float curXPos = mod((pos.x + xDist) - gridLimits.x, limLen) + gridLimits.x;
                pos.x = curXPos;
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

      const BottleGeometry = new THREE.CapsuleGeometry(5,6,17,13)
      const material = new THREE.MeshBasicMaterial({color: 0xfff00});

      const bottle = new THREE.Mesh(
        BottleGeometry,
        material
      );

      // randomness
      this._setPosition(bottle);
 
      //console.log("bottle position: ", bottle.position);
      this._bottleScore(bottle);
      //console.log("bottle scale", bottle.scale)
      this.objectsParent.add(bottle);
      bottle.userData = {type: 'bottle', price: '10'};
    }
    _createCarton(){
      const boxGeometry = new THREE.BoxGeometry(1,1,1);
      const material = new THREE.MeshBasicMaterial({color: 0x663377});

      const carton = new THREE.Mesh(boxGeometry, material);

      this._setPosition(carton);

      this._cartonScore(carton);

      this.objectsParent.add(carton);

      carton.userData = {type: 'carton', price: '20'};
    }
    _setPosition(obj, refXPos = 0, refYPos = 1,refZPos = 0.05){

      // random position
      obj.position.set(

        refXPos + this._randomInt(-10,10),
        refYPos,
        refZPos + this._randomInt(-30,0)

      );
    }
    _randomFloat(min, max){
      return Math.random() * (max-min) + min;

    }
    _bottleScore(obj){
      const price = this._randomFloat(0.05, 0.09);
      const ratio = price; // deduce size and color of carton
      const size = ratio;

      obj.scale.set(size, size, size); // 0 ~ 0.1
    }
    _randomInt(min, max){
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max-min+1)) + min;
    }

    _cartonScore(obj){
      const price = this._randomInt(10,50);
      const ratio = price/50; // deduce size and color of carton
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
      for (let i = 0; i < 5; i++){
        this._createBottle(); // 裡面含有this.objectsParent.add(obj)
        this._createCarton();
      }
      

      // set up camera
      camera.rotateX(-10 * Math.PI/100);
      camera.position.set(0,1.5,2);
        
       
     

      
    }

    _requestFood(typeOfFood = 2){
        this.Food_id = this._randomInt(0,typeOfFood-1);
        console.log("food id: ",this.Food_id)
        return this.Food_id;
    }
}