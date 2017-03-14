var width = window.innerWidth,
    height = window.innerHeight;

var scene = new THREE.Scene();
scene.add(new THREE.AmbientLight(0xeeeeee));

var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
camera.position.set(0, -30, 30);

var particleMaterial;

particleMaterial = new THREE.SpriteCanvasMaterial({
    color: 0x000000,
    program: function(context) {
        context.beginPath();
        context.arc(0, 0, 0.5, 0, PI2, true);
        context.fill();
    }

});

var renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);

var terrainLoader = new THREE.TerrainLoader();
var plane;
var geometry;
// gdalinfo -mm DSM_1km_6210_721.tif  
// gdal_translate -scale 600 1905 0 65535 -outsize 300 285 -ot UInt16 -of ENVI DSM_1km_6210_721.tif DSM_1km_6210_721.bin
terrainLoader.load('https://benna100.github.io/house-3d-model-three-js/assets/721/DSM_1km_6210_721_subset.bin', function(data) {
    var offsetheight = 10;
    geometry = new THREE.PlaneGeometry(60, 60, 199, 199);

    for (var i = 0, l = geometry.vertices.length; i < l; i++) {
        geometry.vertices[i].z = data[i] / 65535 * offsetheight;
    }


    // instantiate a loader
    var loader = new THREE.TextureLoader();

    // load a resource
    loader.load(
        // resource URL
        '../assets/721/DSM_1km_6210_721_subset.png',
        // Function when resource is loaded
        function(texture) {

            console.log(texture);
            // do something with the texture
            texture.offset.x = 0.015;
            texture.offset.y = 0.005;
            var material = new THREE.MeshBasicMaterial( {
                map: texture
             });
            plane = new THREE.Mesh(geometry, material);
            scene.add(plane);
            var randomTexture = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff, opacity: 0.5 });

        },
        // Function called when download progresses
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        // Function called when download errors
        function(xhr) {
            console.log('An error happened');
        }
    );


});


var controls = new THREE.TrackballControls(camera);

raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();
ini = 0;


document.getElementById('webgl').addEventListener('click', function(event) {
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects([plane]);

    if (intersects.length > 0) {
/*
        var width = 0.25;
        var height = 0.75;
        var depth = 0.05;
        */

        var newArray = geometry.vertices.slice();
        var sortedVertices = newArray.sort(function(a, b){
            var a1 = intersects[0].point.x - a.x;
            var a2 = intersects[0].point.y - a.y;
            var distToAPoint = Math.sqrt( a1*a1 + a2*a2 );

            var b1 = intersects[0].point.x - b.x;
            var b2 = intersects[0].point.y - b.y;
            var distToBPoint = Math.sqrt( b1*b1 + b2*b2 );
            // maybe var d = a.distanceTo( b );
            if(distToAPoint < distToBPoint){
                return -1;
            }else{
                return 1;
            }
        });

        var numberOfClosestVertices = 30;
        var closestVertices = sortedVertices.slice(0, numberOfClosestVertices);

        // show the closest vertices
        closestVertices.forEach(function(vertecy) {
            addCube({x: vertecy.x, y: vertecy.y, z: vertecy.z}, 0.2, 0.2, 0.2, 0x66FF00);
        });

        var totalX = 0;
        var totalY = 0;
        var totalZ = 0;
        closestVertices.forEach(function(vector){
            console.log(vector);
            totalX += vector.x;
            totalY += vector.y;
            totalZ += vector.z;
        });

        var averageVector = new THREE.Vector3( totalX/closestVertices.length, totalY/closestVertices.length, totalZ/closestVertices.length);

        //console.log(averageVector);
        //console.log(averageVector.normalize());
        var averageVector = new THREE.Vector3( 0.5, 0.5, 0);
        //console.log(averageVector);
        
        

        //var geometry = new THREE.CylinderGeometry(2, 2, vector.length(), 4, 4);
        //var mesh = new THREE.Mesh(geometry, someMaterial);
        var axis = new THREE.Vector3(0, 1, 0);
        


        // rotate the panels to fit the roof. 


        var width = 0.5;
        var height = 1.5;
        var depth = 0.05;
        var geometry2 = new THREE.CubeGeometry(width, height, depth);
        var material = new THREE.MeshBasicMaterial({ color: 0x000000 });

        var mesh = new THREE.Mesh(geometry2, material);

        //geometry2.rotateY(2.4);
        //geometry2.rotateZ(2.6);

        mesh.position.x = intersects[0].point.x;
        mesh.position.y = intersects[0].point.y;
        mesh.position.z = intersects[0].point.z;

        // rotate mesh in the direction of the averagevector direction
        mesh.quaternion.setFromUnitVectors(axis, averageVector.clone().normalize());
        //scene.add(mesh);

    }
}, false);


function addCube(position, width, height, depth, color){
    var width = width;
    var height = height;
    var depth = depth;
    var closestPointGeometry = new THREE.CubeGeometry(width, height, depth);
    var material = new THREE.MeshBasicMaterial({ color: color });
    var closestPointMesh = new THREE.Mesh(closestPointGeometry, material);
    closestPointMesh.position.x = position.x;
    closestPointMesh.position.y = position.y;
    closestPointMesh.position.z = position.z;
    scene.add(closestPointMesh);
}

document.getElementById('webgl').appendChild(renderer.domElement);

var axisHelper = new THREE.AxisHelper( 5 );
scene.add( axisHelper );

render();

function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

