
    var width  = window.innerWidth,
        height = window.innerHeight;

    var scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xeeeeee));

    var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, -30, 30);

    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);

    var terrainLoader = new THREE.TerrainLoader();
    // gdalinfo -mm DSM_1km_6210_721.tif  
    // gdal_translate -scale 600 1905 0 65535 -outsize 300 285 -ot UInt16 -of ENVI DSM_1km_6210_721.tif DSM_1km_6210_721.bin
    terrainLoader.load('https://benna100.github.io/house-3d-model-three-js/assets/721/DSM_1km_6210_721_subset.bin', function(data) {
        var offsetheight = 10;
        var geometry = new THREE.PlaneGeometry(60, 60, 199, 199);

        for (var i = 0, l = geometry.vertices.length; i < l; i++) {
            geometry.vertices[i].z = data[i] / 65535 * offsetheight;
        }

        var material = new THREE.MeshPhongMaterial({
            map: THREE.ImageUtils.loadTexture('https://benna100.github.io/house-3d-model-three-js/assets/721/DSM_1km_6210_721_subset.png')
        });

        //var plane = new THREE.Mesh(geometry, material);
        var plane = new THREE.Mesh(geometry, material);
        scene.add(plane);

    });

    var controls = new THREE.TrackballControls(camera); 

    document.getElementById('webgl').appendChild(renderer.domElement);

    render();

    function render() {
        controls.update();    
        requestAnimationFrame(render);
        renderer.render(scene, camera);
    }