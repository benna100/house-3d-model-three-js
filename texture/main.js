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
// gdalinfo -mm DSM_1km_6210_721.tif  
// gdal_translate -scale 600 1905 0 65535 -outsize 300 285 -ot UInt16 -of ENVI DSM_1km_6210_721.tif DSM_1km_6210_721.bin
terrainLoader.load('https://benna100.github.io/house-3d-model-three-js/assets/721/DSM_1km_6210_721_subset.bin', function(data) {
    var offsetheight = 10;
    var geometry = new THREE.PlaneGeometry(60, 60, 199, 199);

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

        //  intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );

        console.log(intersects[0].point);


        var width = 0.5;
        var height = 1.5;
        var depth = 0.1;
        var geometry = new THREE.CubeGeometry(height, width, depth);

        //geometry.rotateY(ini);
        console.log(ini);
        geometry.rotateY(2.4);
        geometry.rotateZ(2.6);

        ini += 0.1;
        var material = new THREE.MeshBasicMaterial({ color: 0x000000 });

        var mesh = new THREE.Mesh(geometry, material);
/*
        var xAxis = new THREE.Vector3(1,0,0);
        rotateAroundWorldAxis(mesh, xAxis, Math.PI / 190);
*/
        mesh.position.x = intersects[0].point.x;
        mesh.position.y = intersects[0].point.y;
        mesh.position.z = intersects[0].point.z;
        scene.add(mesh);

    }
}, false);

document.getElementById('webgl').appendChild(renderer.domElement);



render();

function render() {
    controls.update();
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}



var rotObjectMatrix;
function rotateAroundObjectAxis(object, axis, radians) {
    rotObjectMatrix = new THREE.Matrix4();
    rotObjectMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    // object.matrix.multiplySelf(rotObjectMatrix);      // post-multiply
    // new code for Three.JS r55+:
    object.matrix.multiply(rotObjectMatrix);

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js r50-r58:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // new code for Three.js r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}

var rotWorldMatrix;
// Rotate an object around an arbitrary axis in world space       
function rotateAroundWorldAxis(object, axis, radians) {
    rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    //  rotWorldMatrix.multiply(object.matrix);
    // new code for Three.JS r55+:
    rotWorldMatrix.multiply(object.matrix);                // pre-multiply

    object.matrix = rotWorldMatrix;

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js pre r59:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // code for r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}