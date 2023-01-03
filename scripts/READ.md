# JavaScript Term Project

Link of Reference:
https://medium.com/geekculture/making-a-3d-web-runner-game-4-making-an-infinite-plane-with-a-shader-48a0c63bc8d2

https://sketchfab.com/3d-models/ocean-wave-sim-0e5033a2469e499d875f3a75ba54ae9b

Infinite Grid Move
https://stackoverflow.com/questions/51470309/three-js-and-infinite-forward-grid-movement
 `THREE.GridHelper()` with `THREE.ShaderMaterial()`:
 
 1. grid size `THREE.GridHelper`:
 
        _createGrid(scene) {
        this.speedZ = 5;

        let divisions = 30;
        let gridLimit = 200;
        this.grid = new THREE.GridHelper(gridLimit * 2, divisions, 0xccddee, 0xccddee);

2. `BufferAttribute` 設定頂點xyz座標

        const moveableZ = [];
        for (let i = 0; i <= divisions; i++) {
          moveableZ.push(1, 1, 0, 0); // move horizontal lines only (1 - point is moveable)
        }
        this.grid.geometry.setAttribute('moveableZ', new THREE.BufferAttribute(new Uint8Array(moveableZ), 1));

3. 設定shaders - uniforms, vertexShader, fragmentShader

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
              vColor = color;
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

        
        
4. 將 grid 加入scene
        
        scene.add(this.grid);
          }

        }

## Animate Grid
- init timer:

        class Game {

          // (other functions)

          _createGrid(scene) {
            // ...

            this.time = 0;
          }

        }
- keep track of time:
            
        class Game {

          // (other functions)

          _createGrid(scene) {
            // ...

            this.time = 0;
            this.clock = new Three.Clock()
          }

        }
- update time:
        
        class Game {
  
          // (other functions)

          update() {
            // recompute the game state
            this.time += this.clock.getDelta();

            this._updateGrid();
            this._checkCollisions();
            this._updateInfoPanel();
          }
        }
        
- update parameters inside the grid
        
        class Game {
            _updateGrid(){
                this.grid.material.uniforms.time.value = this.time
            }
        }
        
        
## Obstacles Generation
- `initialize_grid`: create a Group, named: `objectsParent`
    - save all mesh
    - add to scene
    - _createBottle
    - _createCarton
>     _initializeScene(scene, camera){
>           ...
>           
>          this.objectsParent = new THREE.Group()
>          scene.add(this.objectsParent)
>          this._createBottle()
>          this._createCarton()
>          ...
>      }

### Create Bottles
- create mesh
>     _createBottle(){
>         const bottleGeometry = new THREE.CapsuleGeometry(5,6,7,13);
>         const bottleMaterial = new THREE.MeshBasicMaterial({color:0x00ff00});
>         const bottle = new THREE.Mesh(bottleGeometry, bottleMaterial);
>         
>     }

- position
>     _setPosition(obj,refXPos = 0, refYPos = 1, refZPos = 0.05){
>         obj.position.set(
>            refXPos + _randomInt(-10, 10),
>            refYPos,
>            refZPos + _randomInt(-30,0)
>         );
>     }
>     _createBottle(){
>         ...
>         this._setPosition(bottle);
>     }
- scale
>     _bottleScore(obj){
>           const price = this._randomFloat(0.01, 0.05);
>           const ratio = price; // deduce size and color of bottle
>           const size = ratio;
>           obj.scale.set(size, size, size); // 0 ~ 0.1
>     }
>     _createBottle(){
>         ...
>         this._setPosition(bottle);
>         this._bottleScore(bottle);
>         this.objectsParent.add(bottle);
>     }
    
         
    

### Create Cartons
    _createCarton(){
          const boxGeometry = new THREE.BoxGeometry(1,1,1);
          const material = new THREE.MeshBasicMaterial({color: 0x663377});

          const carton = new THREE.Mesh(boxGeometry, material);

          this._setPosition(carton);

          this._cartonScore(carton);

          this.objectsParent.add(carton);
    }
- position
   
>      _setPosition(obj, refXPos = 0, refYPos = 1,refZPos = 0.05){
>         obj.position.set(
>             refXPos + this._randomInt(-10,10),
>             refYPos,
>             refZPos + this._randomInt(-30,0)
>         );
>     }

- scale
    
>     _cartonScore(obj){
>         const price = this._randomInt(10,50);
>         const ratio = price/50; // deduce size and color of carton
>         const size = ratio * 0.5;
>         obj.scale.set(size, size, size);
> 
>       // remap hue color 0.5~1 based on price 5~20
>     }

## Move along the grid
- move this.speedZ = 5 into the constructor
    
    
        class Game {
    
          // (other functions)

          constructor(scene, camera) {
            // initialize variables
            this.speedZ = 5;

            // prepare 3D scene
            this._initializeScene(scene, camera);

            // bind event callbacks
            document.addEventListener('keydown', this._keydown.bind(this));
            document.addEventListener('keyup', this._keyup.bind(this));
          }

          _updateGrid() {
                this.grid.material.uniforms.time.value = this.time;
                this.objectsParent.position.z = this.speedZ * this.time;
              }
          }

- change the position of the entire Group
>     _updateGrid(){
>         this.objectsParent.position.z = this.speedZ * this.time;
>     }

## Recreate Obstacles

- change the position of obstacles
    - to save memory we don't create new objects,
    - but change their positions
    `Three.js traverse()` method that allows you to iterate through a sub-hierarchy in your scene and run some logic for an object and all of its children.
        
        
        _updateGrid(){
            this.grid.material.uniforms.time.value = this.time;
 
            this.objectsParent.position.z = this.speedZ * this.time;

            /* ---------------Renerate Obstacles---------------- */

            this.objectsParent.traverse((child) => {
              // Z-position relative to Robot itself
              const childZPos = child.position.z + this.objectsParent.position.z;
              if(childZPos > 0){
                // move passed robot, reset object

              }
            })
        }

- Give identity to different obstacles
    - `obj.userData` specify type
    
            _createBottle(){
                ...
                bottle.userData = {type: 'bottle'};
            }
            _createCarton(){
                ...
                carton.userData = {type: 'bottle'};
            }

## Move Right or Left

- HTML DOM EVENTS:
https://www.w3schools.com/jsref/dom_obj_event.asp

- Handling Key events: 

    - keydown: 'ArrowLeft', 'ArrowRight': `speedX` = 1 or `speedX` = -1
            - 利用一個 local variable 暫存 key 值
    - KeyUp: `speedX` = 0
        
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

                this.speedX = newSpeedX;
            }

            _keyup(){
                // reset to idle mode
                this.speedX = 0;
            }

- 更新Robot位移
    - `update(){...} `設定位移 `translateX`
    - 乘以一個負值, 因為實際上在動的是grid
    
            this.translateX += this.speedX * - 0.05 
            
- Apply onto Grid 
    - Create `moveableX` points
            
            const moveableX = [];
            for(int i = 0; i < divisions; i++){
                moveableX.push(0,0,1,1);
            }
    - Init new `moveableX` bufferAttribute on grid
    
            this.grid.geometry.setAttribute("moveableX",
            new THREE.BufferAttribute(new Uint8Array(moveableX), 1));
    
    - Add `this.translateX` records onto new property `moveableX` of `ShaderMaterial`
    
             this.grid.material = new THREE.ShaderMaterial({
                  ...
                translateX:{
                  value: this.translateX
                },
    - pass values into `vertexShader` (control position)
        1. moveableX 為 attribute type
        2. this.translateX 為 uniform type
        
                 vertexShader: `
                    ...
                    uniform float translateX;

                    ...
                    attribute float moveableX;
    
    - calculate current X position after adding translateX
        1. current position = last position + translateX
        2. if exceeds gridX limit, then modulate until current position stays in the limits of the grid
                
                if (floor(moveableX + 0.5) > 0.5){
                        float xDist = translateX;
                        float curXPos = mod((pos.x + xDist) - gridLimits.x, limLen) + gridLimits.x;
                        pos.x = curXPos;
                      }
                      
        3. update Grid X position
           
               _updateGrid(){

                    ....
                    /* ---- change X position ----- */
                    this.grid.material.uniforms.translateX.value = this.translateX;
                    this.objectsParents.position.x = this.translateX;

                    ...
                }
                
# Collide Objects
picking up objects according to the symbol

collide signals: if robot is close enough to the object then means collide



        constructor{

            // ...
            this.COLLISION_THRESHOLD = 0.4;
        }
        
        update(){
            
            this._checkCollisions();
        }
        
        _checkCollisions(){
            // TRAVERSE ALL CHILDREN, use initializeScene() 裡的 objectsParent
            this.objectsParent.traverse((child) => {
                if(child instanceof THREE.Mesh){
            
            
                }
            })
        }
        
## check distance
1. traverse all mesh `this.objectsParent.traverse((child) => {...})`
2. position of object relative to world
    - 相對於世界的位置 = robotZ + childZ
3. calculate specific threshold for child
    - 假設threshold = 0.2 + childZ 或 childX 的比例
4. check collision
    - 若childZ位置超過Zthreshold這麼多
    - 若位移量translateX為childX位置中心的左或右thresholdX以內



>     _checkCollisions(){
>         // TRAVERSE ALL CHILDREN, use initializeScene() 裡的 objectsParent
>         this.objectsParent.traverse((child) => {
>             if(child instanceof THREE.Mesh){
> 
>             // position of obstacle in world space
>                 const childZPos = child.position.z + this.objectsParent.position.z;
> 
>             // calculate threshold for this obstacle
>                 const thresholdX = this.COLLISION_THRESHOLD + child.scale.x/2;
> 
>                 const thresholdZ = this.COLLISION_THRESHOLD + child.scale.z/2;
> 
>                 // check collision
>                 if( childZPos > -thresholdZ && Math.abs(child.position.x + this.translateX) < thresholdX){
>                 ....
>                 }
> 
>             }
>         })
> 
>     }

## check collision
只要distance 符合 COLLISION_THRESHOLD即可

分數:
CASE1. 畫面要求取得carbon, 碰到carbon: + 16 
CASE2. 畫面要求取得carbon, 碰到其他物體: -objectPrice * (1/4)
CASE3. 畫面要求取得bottle, 碰到bottle: + 10 
CASE4. 畫面要求取得bottle, 碰到其他物體: -objectPrice * (1/4)

畫面UI顯示要求OBJECT: `index.html`

    <body>
        <div id="info">
            <div id="whatToEat"></div>
            <div id="score"></div>
        </div>
        

    </body>

取得畫面項目:
    
    constructor{
        ...
        this.divFood = document.getElementById("whatToEat");
        
        this.divScore = document.getElementById("score");
    }

此外，在constructor設定一般變數:
- `this.score`: 接收分數的計算，總結後再透過`parseInt`給`this.divScore`
- `this.collideBool`: 判斷collision是否發生的指標，為true時，要重新發送要求request
- `this.Food_id`: 接收random計算的這次畫面要求食物，每次collision發生後重新接收
- `this.FoodList = ["bottle","carton"];`
- `this._requestFood()`: return random `this.Food_id`


        constructor{
            ...
             // initialize what to eat & score
            this.divFood = document.getElementById("whatToEat");
            this.score = 0;
            this.divScore = document.getElementById("score");

            const typeOfFood = 2
            this.FoodList = ["bottle","carton"];
            this.Food_id = this._requestFood(typeOfFood);
            this.collideBool = false;
            this.divFood.innerText = this.FoodList[this.Food_id];

            // prepare for check distance
            this.COLLISION_THRESHOLD = 0.4
  
          ...
        }
        
每次update()中，重新指派`collideBool` = `false`;
在_checkCollisions()會檢查是否應該改為`collideBool` = `true`，因此應該確保在進入_checkCollisions()之前為`false`

        
        
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


- 根據userData.type檢查碰撞物件
假如物體符合碰撞距離要求，且正確碰撞到對應的物件(i.e. this.Food_id 與 child.userData.type 相對應):`this.collideBool` = `true`。

改變碰撞物體之位置、重新requestFood()，改變UI food


        if( childZPos > -thresholdZ && Math.abs(child.position.x + this.translateX) < thresholdX){
              if(this.Food_id == 0){
                  if(child.userData.type == "bottle"){
                    this.collideBool = true;
                    this.score += parseInt(child.userData.price);
                    this.divScore.innerText = this.score;
                  }
                  else{
                    this.score -= parseInt(child.userData.price)/4;
                    this.divScore.innerText = this.score;
                  }
              }
              else if(this.Food_id == 1){
                if(child.userData.type == "carton"){
                  this.collideBool = true;
                  this.score += parseInt(child.userData.price);
                  this.divScore.innerText = this.score;
                }
                else{
                  this.score -= parseInt(child.userData.price)/4;
                  this.divScore.innerText = this.score;
                }
              }

              if(this.collideBool == true){
                this._setPosition(child, -this.translateX, -this.objectsParent.position.z);
                this.Food_id = this._requestFood(2);
                console.log("collision, food id: ", this.Food_id);
                this.divFood.innerText = this.FoodList[this.Food_id]; 

              }
          }

        _requestFood(typeOfFood = 2){
            this.Food_id = this._randomInt(0,typeOfFood-1);
            console.log("food id: ",this.Food_id)
            return this.Food_id;
        }