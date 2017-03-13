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
    //loadtexture
    //var texture = THREE.TextureLoader('https://benna100.github.io/house-3d-model-three-js/assets/721/DSM_1km_6210_721_subset.png');
    //var texture = new THREE.TextureLoader().load(  );
    //texture.offset.x = 0.015; // positive, texture towards left
    //texture.offset.y = 0.01;
    /*
    var textureLoader = new THREE.TextureLoader();
    textureLoader.load("http://benna100.github.io/house-3d-model-three-js/assets/721/DSM_1km_6210_721_subset.png", function(texture){
        console.log(texture);
        console.log('loaded');
        // The actual texture is returned in the event.content
        //var randomTexture = new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.5 } );

        plane = new THREE.Mesh(geometry, texture);
        //plane = new THREE.Mesh(geometry, material);
        scene.add(plane);
    });
    */



    // instantiate a loader
    var loader = new THREE.TextureLoader();

    // load a resource
    loader.load(
        // resource URL
        'http://benna100.github.io/house-3d-model-three-js/assets/721/DSM_1km_6210_721_subset.png',
        // Function when resource is loaded
        function(texture) {

            console.log(texture);
            // do something with the texture
            

            setTimeout((function() {
                console.log(texture);
                var material = new THREE.MeshBasicMaterial( {
                    map: texture
                 });
                plane = new THREE.Mesh(geometry, material);
                scene.add(plane);
            }).bind(this), 2000);
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




    /*
            var material = new THREE.MeshPhongMaterial({
                map: texture,
            });
    */
    //var plane = new THREE.Mesh(geometry, material);



});


var controls = new THREE.TrackballControls(camera);

raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();



document.getElementById('webgl').addEventListener('click', function(event) {
    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects([plane]);

    if (intersects.length > 0) {

        //  intersects[ 0 ].object.material.color.setHex( Math.random() * 0xffffff );

        //var particle = new THREE.Sprite( particleMaterial );

        //particle.position.copy( intersects[ 0 ].point );
        console.log(intersects[0].point);

        //particle.scale.x = particle.scale.y = 16;
        /*
            scene.add( particle );

            
*/


        var geometry = new THREE.CubeGeometry(1, 1, 1);

        var material = new THREE.MeshBasicMaterial({ color: 0xCC66FF });

        var mesh = new THREE.Mesh(geometry, material);

        //scene is global
        //scene.add(mesh);

        //cube = new THREE.Mesh( new THREE.CubeGeometry( 200, 200, 200 ), new THREE.MeshNormalMaterial() );
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
