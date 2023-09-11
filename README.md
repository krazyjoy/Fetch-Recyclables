# Fetch Recyclables - JavaScript Term Project

Link of Reference:
https://medium.com/geekculture/making-a-3d-web-runner-game-4-making-an-infinite-plane-with-a-shader-48a0c63bc8d2

https://sketchfab.com/3d-models/ocean-wave-sim-0e5033a2469e499d875f3a75ba54ae9b
## Structure
`Index.html` -> `Main.js` -> `Game.js`

## Index.html

- npm install three
- Addons Include: https://threejs.org/docs/#manual/en/introduction/Installation
    - ![](https://i.imgur.com/2xBzcX7.png)




    
    <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <link rel="stylesheet" type="text/css" href="styles/style.css">
            <script async src="https://unpkg.com/es-module-shims@1.3.6/dist/es-module-shims.js"></script>
            <script type="importmap">
            {
                "imports": {
                "three": "https://unpkg.com/three@0.148.0/build/three.module.js",
                "three/addons/": "https://unpkg.com/three@0.148.0/examples/jsm/"
                }
            }
            </script>

            <script src="scripts/lerp.js"></script>
            <script type = "module" src="scripts/game.js"></script>
            <script type = "module" src="scripts/main.js"></script>

            
            
## Main.js
- Import Dependencies:        
    - Import Three
    - Import `{Game}` from `"./scripts/Game.js"`

- 加載畫面: `window.onload = () => {...}` ，在HTML檔案載入完畢後將**場景**所需要的元素加到函式中
            
- 基本場景建置: 
    - Scene
    - Camera
    - Light
- 3D 場景的渲染 WebGLRenderer: 
    - 目的: 將3D場景渲染成2D顯示在畫布上
    - 1. 建立一個實體: `new WebGLRenderer()`
        2. 設定window畫布大小: `renderer.setSize`

- DOM 元素對象:
    - HTML DOM appendChild() 加一個子節點到樹上
            
- Animate 產生動畫:
    - 方法: 藉由recall函式自己，不斷地更新場景內容
    
            const gameInstance = new Game(scene, camera);
            /* render recursively */
            function animate() {
                requestAnimationFrame( animate ); // recall function
                gameInstance.update(scene);
                renderer.render( scene, camera );
            }
            animate();

## Game.js
            
## About
遊戲內容為簡易的衝浪遊戲，目標為根據info panel要求收集海上漂浮的垃圾，若收集錯誤垃圾會扣分數，若碰到鯊魚生命值會減少

## Motivation
- create a 3D game
- Environmental Protection Using A ROBOT
### Structure: 
    - Initialize_Scene()
    - constructor(觸發update條件)
    - _initializeScene()
    - update(   updateGrid(), checkCollisions(), updateInfoPanel())
    - keydown(event)
    - keyup()
    - createGrid()
    - createOcean()
    - updateGrid()
    - checkCollisions()
    
### Constructor

### Initialize Scene
 
        _initializeScene(scene, camera){
      
          this._createRobot(scene);
            
          // create Grid
            
          this._createGrid(scene);

      
          // Garbage group
          

          // set up camera
          camera.rotateX(-10 * Math.PI/100);
          camera.position.set(0,1.5,2);

    }
## Create Robot
- 自訂robot造型與顏色: `new THREE.Mesh`(圓柱狀, 紅色)
- 精緻化邊框: 
    - wireframe = new THREE.LineSegments(geometry, material)
    - wireframe.ro
    - 建立群組: this.robot = new THREE.Group(),
        - robot: this.robot.add(robotBody)
        - robot邊緣: this.robot.add(wireframe)
    - 加入場景: scene.add(this.robot)
            
            
            
---------------------------------------            
    _createRobot(scene){
        const robotBody = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5,0.5,0.1,12),
            new THREE.MeshBasicMaterial({color:0xE64848 }),
        );

        var geometry = new THREE.EdgesGeometry( robotBody.geometry );

        var material = new THREE.LineBasicMaterial( { color: 0xFFFFFF } );

        var wireframe = new THREE.LineSegments( geometry, material );

        wireframe.ro
        scene.add(wireframe);
        this.robot = new THREE.Group(); // create components into one

        this.robot.add(robotBody);
       
        this.robot.add(wireframe);

        scene.add(this.robot);
       
    }
------            
            
            
            
            
    class Game {

      constructor() {
        // initialize variables
        // prepare 3D scene

        // bind event callbacks
        document.addEventListener('keydown', this._keydown.bind(this));
        document.addEventListener('keyup', this._keyup.bind(this));
      }

      update() {
        // recompute the game state
        this._updateGrid();
        this._checkCollisions();
        this._updateInfoPanel();
      }

      _keydown(event) { ... }
      _keyup() { ... }
      _updateGrid() { ... }
      _checkCollisions() { ... }
      _updateInfoPanel() { ... }

      _gameOver() {
        // show "end state" UI
        // reset instance variables for a new game
      }

      _initializeScene() {
        // prepare the game-specific 3D scene
      }
    }
### Infinite Grid Move
https://stackoverflow.com/questions/51470309/three-js-and-infinite-forward-grid-movement
 `THREE.GridHelper()` with `THREE.ShaderMaterial()`:
 
 1. `THREE.GridHelper` 利用three內建grid類別建立一個實體:
 
        _createGrid(scene) {
        this.speedZ = 5;

        let divisions = 30;
        let gridLimit = 200;
        this.grid = new THREE.GridHelper(gridLimit * 2, divisions, 0xccddee, 0xccddee);

2. `BufferAttribute` 可以自己加上想要的頂點xyz座標設定
- 建立一個array叫做moveableZ[] 裡面裝grid水平方向的線
- 新增grid.geometry屬性，命名: 'moveableZ', 將moveableZ包裝成BufferAttribute，才能加入geometry屬性
            
            
        const moveableZ = [];
        for (let i = 0; i <= divisions; i++) {
          moveableZ.push(1, 1, 0, 0); // move horizontal lines only (1 - point is moveable)
        }
        this.grid.geometry.setAttribute('moveableZ', new THREE.BufferAttribute(new Uint8Array(moveableZ), 1));

3. 設定shaders - uniforms, vertexShader, fragmentShader
- 避免往前移動超過grid預設大小: 在vertextShader中，利用mod取餘，使的grid像是無限大一樣
                                      
        float limLen = gridLimits.y - gridLimits.x;
        vec3 pos = position;
        if (floor(moveableZ + 0.5) > 0.5) { // if a point has "moveableZ" attribute = 1 
          float zDist = speedZ * time;
          float curZPos = mod((pos.z + zDist) - gridLimits.x, limLen) + gridLimits.x;
          pos.z = curZPos;
        }                               
                                      
-----                                      
                                      
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
>         const bottleMaterial = new THREE.MeshBasicMaterial({color:0xFCF9BE});
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
          const material = new THREE.MeshBasicMaterial({color: 0xFAAB78});

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
    - 節省記憶體，不真的產生新物件 to save memory we don't create new objects,
    - 而是改變物件位置 but change their positions。
    - 藉由 `Three.js traverse()` method 遊歷所有場景中的子物件，可以對`this.objectsParent`的 children 執行動作 
        
            
        
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

    - constructor: 

            document.addEventListener("keydown", this._keydown.bind(this));
            document.addEventListener("keyup", this._keyup.bind(this));
            
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
## Lerp

 - 改變左右 rotation
 - 
 
         _rotateRobot(targetRotation, delay){
            // this 不是 Game 裡面的 instance
            const $this = this;
            this.rotationLerp = new Lerp(this.robot.rotation.z, targetRotation, delay)
            .onUpdate((value) => {$this.robot.rotation.z = value})
            .onFinish(()=>{$this.rotationLerp = null});
        }   
            
            
            
    class Lerp{
        constructor(from, to, delay){
        this.from = from;
        this.to = to;
        this.delay = delay;

        this.value = from;
        this.time = 0;

        // avoid half lerp
        this.lerpSpeed = 1 / this.delay;
    }
    update(timeDelta){
        const t = this.time/this.delay;

        // interpolation
        this.value = (1-t) * this.from + t * this.to;

        //this.time += timeDelta;
        this.time += this.lerpSpeed * timeDelta;

        if(this.onupdate){
            this.onupdate(this.value);
        }

        if(this.time >= this.delay){
            if(this.onfinish)
                this.onfinish();
            delete this;
        }
    }

    onUpdate(callback){
        this.onupdate = callback;
        return this;
    }
    onFinish(callback){
        this.onfinish = callback;
        return this;
    }

}            
# Collide Objects
- 根據 userData.type 辨識碰撞的物件類別

- 碰撞信號: 假如 robot 距離物體的距離夠近，就算碰撞

**架構:**
        
- 閾值: this.COLLISION_THRESHOLD = 0.4
- 每次更新檢查是否碰撞
- 藉由遊歷所有GROUP的CHILDREN，檢查與ROBOT的距離
            
---



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
- 只要distance 符合 COLLISION_THRESHOLD即可

- 分數:
    - CASE1. 畫面要求取得carbon, 碰到carbon: + 20 
    - CASE2. 畫面要求取得carbon, 碰到其他物體: -5
    - CASE3. 畫面要求取得bottle, 碰到bottle: + 10 
    - CASE4. 畫面要求取得bottle, 碰到其他物體: -2.5 

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
- `this.FoodList = ["bottle","carton","fish"];`
- `this._requestFood()`: return random `this.Food_id`


        constructor{
            ...
            this.divFood = document.getElementById("whatToEat");
            this.score = 0;
            this.divScore = document.getElementById("score");

            const typeOfFood = 2
            this.FoodList = ["bottle","carton","fish"];
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
                                                                                                  
                                                                                            
                                                 -------------------                             
                                                                                                
--
## Create FISH                                                                                                  
    _initializeScene(scene, camera){
      // prepare 3D scene
      //this._createRobot(scene);
      //this._createGrid(scene);
     
      
      // // obstacle group
      this.objectsParent = new THREE.Group()
      
      this.ocean = new THREE.Object3D();


      scene.add(this.objectsParent);
      for (let i = 0; i < 5; i++){
        //this._createBottle(); // 裡面含有this.objectsParent.add(obj)
        //this._createCarton();
        this._createFish();
      }
      

      // // set up camera
      camera.rotateX(-10 * Math.PI/100);
      camera.position.set(0,1.5,2);
      
      
    }

- 產生魚的外觀: 
            參考位置 https://codepen.io/prisoner849/pen/PobWvZY?editors=0010
        
        _createFish(){
              // let start = 0.1;
              // let end = 0.1;
              let fishG = new THREE.Group();

              let baseCurve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(1, 0.5, 0),
                new THREE.Vector3(0, 3, 0),
                new THREE.Vector3(-1, 0.5, 0)
              ], true);

              const divisions = 10;
              const slices = 10;
              let basePoints = baseCurve.getSpacedPoints(divisions);
              console.log(basePoints)

              let baseGeom = new THREE.BufferGeometry().setFromPoints(basePoints);
              let line = new THREE.Line(baseGeom, new THREE.LineBasicMaterial({color: 0xFFFFFF, map: new THREE.TextureLoader().load("\\assets\\whiteShark.png")}));
              fishG.add(line);
              let points = new THREE.Points(baseGeom, new THREE.PointsMaterial({color:  0xFFFFFF, size: 1, map: new THREE.TextureLoader().load("\\assets\\whiteShark.png")}));
              fishG.add(points);

              let planeGeom = new THREE.PlaneGeometry(1, 1, divisions, slices);
              let pos = planeGeom.attributes.position;
              console.log(pos);

              let zStart = slices * 0.5;
              let v = new THREE.Vector3();
              for(let i = 0; i <= slices; i++){

                let z = zStart - i;

                let shift = Math.sin(Math.PI * (i / slices));
                let scale = 0.5 + shift * 0.5;
                let yShift = (1 - shift) * 0.2;

                for(let j = 0; j <= divisions; j++){

                  let baseVect = basePoints[j];
                  v.copy(baseVect).multiplyScalar(scale);
                  v.y += yShift;
                  let idx = ((divisions + 1) * i) + j;
                  pos.setXYZ(idx, v.x, v.y, z);

                }
          }

- 魚的質地:
            
        planeGeom.computeVertexNormals(); 

          const fishTexture = new THREE.TextureLoader().load("\\assets\\whiteShark.png");

          let planeMat = new THREE.MeshBasicMaterial({color: 0x879B9F, wireframe: true, side: THREE.DoubleSide, map: fishTexture});
          fishG = new THREE.Mesh(planeGeom, planeMat)
          fishG.rotateY(3);
          //scene.add(mesh);
          this._setPosition(fishG,this.translateX,0,1);
          this._fishScore(fishG);
          this.objectsParent.add(fishG);

          fishG.userData = {type: 'fish', price: '50'};
        }
