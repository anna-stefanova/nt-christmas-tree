import * as THREE from 'three';
import {GUI} from "three/addons/libs/lil-gui.module.min";


import init from './init';

import './style.css';
import {GLTFLoader} from "three/addons/loaders/GLTFLoader";
import ambientLightNode from "three/addons/nodes/lighting/AmbientLightNode";
import {OBJLoader} from "three/addons/loaders/OBJLoader";
import {MTLLoader} from "three/addons/loaders/MTLLoader";
const { data, sizes, camera, scene, canvas, controls, renderer } = init();



camera.position.set(0, 0.5, 4.1);
camera.lookAt(scene.position);


//*********  Spot Light *********//
// const colorSpot = 0xFFFFFF;
// const intensitySpot = 150;
// const lightSpot = new THREE.SpotLight(colorSpot, intensitySpot);
// //lightSpot.position.set()
// scene.add(lightSpot);
// scene.add(lightSpot.target);
// const helperSpot = new THREE.SpotLightHelper(lightSpot);
// scene.add(helperSpot);

//*********  Point Light *********//
const color = 0xFFFFFF;
const intensity = 150;
const pointLight = new THREE.PointLight(color, intensity);
pointLight.position.set(0, 3.32, 2.78);
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xffffff, 150);
pointLight2.position.set(0, 3.32, -2.78);
scene.add(pointLight2);

/*const pointHelper = new THREE.PointLightHelper(pointLight);
scene.add(pointHelper);
const pointHelper2 = new THREE.PointLightHelper(pointLight2);
scene.add(pointHelper2);*/

class ColorGUIHelper {
	constructor(object, prop) {
		this.object = object;
		this.prop = prop;
	}
	get value() {
		return `#${this.object[this.prop].getHexString()}`;
	}
	set value(hexString) {
		this.object[this.prop].set(hexString);
	}
}

class DegRadHelper {
	constructor(obj, prop) {
		this.obj = obj;
		this.prop = prop;
	}
	get value() {
		return THREE.MathUtils.radToDeg(this.obj[this.prop]);
	}
	set value(v) {
		this.obj[this.prop] = THREE.MathUtils.degToRad(v);
	}
}

function makeXYZGUI(gui, vector3, name, onChangeFn) {
	const folder = gui.addFolder(name);
	folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
	folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
	folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
	folder.open();
}

function updatePointLight() {
	pointHelper.update();
}
function updatePointLight2() {
	pointHelper2.update();
}

function updateSpotLight() {
	helperSpot.update();
}

/*const gui = new GUI();*/


// ********** Spot Light ****************** //
// gui.addColor(new ColorGUIHelper(lightSpot, 'color'), 'value').name('color');
// gui.add(lightSpot, 'intensity', 0, 150, 0.01);
// gui.add(lightSpot, 'distance', 0, 40).onChange(updateSpotLight);
//
// makeXYZGUI(gui, lightSpot.position, 'position', updateSpotLight);
//
// gui.add(new DegRadHelper(lightSpot, 'angle'), 'value', 0, 90).name('angle').onChange(updateSpotLight);
// gui.add(lightSpot, 'penumbra', 0, 1, 0.01);

// ********* Point Light **********//
/*gui.addColor(new ColorGUIHelper(pointLight, 'color'), 'value').name('color');
gui.add(pointLight, 'intensity', 0, 150, 0.01);
gui.add(pointLight, 'distance', 0, 40).onChange(updatePointLight);

makeXYZGUI(gui, pointLight.position, 'position', updatePointLight);

gui.addColor(new ColorGUIHelper(pointLight2, 'color'), 'value').name('color');
gui.add(pointLight2, 'intensity', 0, 150, 0.01);
gui.add(pointLight2, 'distance', 0, 40).onChange(updatePointLight2);

makeXYZGUI(gui, pointLight2.position, 'position', updatePointLight2);*/

const radius =  16.3;
const segments = 150;
const thetaStart = Math.PI * 2.00;
const thetaLength = Math.PI * 2.00;
const floorGeometry = new THREE.CircleGeometry(
	radius, segments, thetaStart, thetaLength );
const floorMaterial = new THREE.MeshBasicMaterial({
	color: '#9b3a00',
	side: THREE.DoubleSide
})
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.y = -2.55;
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);




let INTERSECTED;
const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

const selectedObject = [];

function addSelectedObjects(object) {
	if (selectedObject.length > 0) {
		selectedObject.pop();
	}
	selectedObject.push(object);
}

const gltfLoader = new GLTFLoader();
const mesh = [];
gltfLoader.load(
	'/models/1.2.new_color.glb',
	(gltf) => {
		console.log('success');
		console.log(gltf);
		gltf.scene.position.y = -2.7;
		gltf.scene.castShadow = true;
		gltf.scene.receiveShadow = true;

		scene.add(gltf.scene);


		const clock = new THREE.Clock();
		const tick = () => {
			const delta = clock.getDelta();
			controls.update();
			//gltf.scene.rotation.y += 0.2 * delta;
			renderer.render(scene, camera);
			window.requestAnimationFrame(tick);
		};
		tick();

		const handleClick = (event) => {

			pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
			pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

			raycaster.setFromCamera(pointer, camera);
			const intersects = raycaster.intersectObjects(gltf.scene.children, true);

			if (intersects.length > 0) {
				if(INTERSECTED !== intersects[0].object && intersects[0].object.type === "Mesh") {
					INTERSECTED = intersects[0].object;

					addSelectedObjects(INTERSECTED);
					console.log(INTERSECTED.name);
					if (data[`${INTERSECTED.name}`]) {
						getMessage(data[`${INTERSECTED.name}`]);
					}


				}
			} else {
				INTERSECTED = null;
			}
		}
		window.addEventListener('click', handleClick);
	},
	(progress) => {
		// console.log('progress');
		// console.log((progress.loaded / progress.total) * 100 + '% loaded');
	},
	(error) => {
		console.log('error');
		console.log(error);
	}
)


const tick = () => {
	controls.update();
	renderer.render(scene, camera);
	window.requestAnimationFrame(tick);
};
tick();

/** Базовые обпаботчики событий длы поддержки ресайза */
window.addEventListener('resize', () => {
	// Обновляем размеры
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Обновляем соотношение сторон камеры
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Обновляем renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.render(scene, camera);
});

window.addEventListener('dblclick', () => {
	if (!document.fullscreenElement) {
		canvas.requestFullscreen();
	} else {
		document.exitFullscreen();
	}
});

function getMessage (text) {

	// устанавливаем триггер для модального окна (название можно изменить)
	//const modalTrigger = document.getElementsByClassName("trigger")[0];

	// получаем ширину отображенного содержимого и толщину ползунка прокрутки
	const windowInnerWidth = document.documentElement.clientWidth;
	const scrollbarWidth = parseInt(window.innerWidth) - parseInt(windowInnerWidth);

	// привязываем необходимые элементы
	const bodyElementHTML = document.getElementsByTagName("body")[0];
	const modalBackground = document.getElementsByClassName("modalBackground")[0];
	const modalActive = document.getElementsByClassName("modalActive")[0];
	const msgBlock = document.querySelector('.christmas-msg.christmas-blue');
	console.log(msgBlock);

	// функция для корректировки положения body при появлении ползунка прокрутки
	function bodyMargin() {
		bodyElementHTML.style.marginRight = "-" + scrollbarWidth + "px";
	}

	// при длинной странице - корректируем сразу
	bodyMargin();

	// делаем модальное окно видимым
	modalBackground.style.display = "flex";
	msgBlock.innerHTML = text;

	// если размер экрана больше 1366 пикселей (т.е. на мониторе может появиться ползунок)
	if (windowInnerWidth >= 1366) {
		bodyMargin();
	}

	// позиционируем наше окно по середине, где 175 - половина ширины модального окна
	modalActive.classList.add("animate__bounce");
	modalActive.style.left = "calc(50% - " + (400 - scrollbarWidth / 2) + "px)";

	if (modalBackground.style.display === "flex") {
		setTimeout(() => {
			modalBackground.style.display = "none";
		}, 6000);  // time is in milliseconds
	}



// закрытие модального окна на зону вне окна, т.е. на фон
	modalBackground.addEventListener("click", function (event) {
		modalBackground.style.display = "none";
		if (windowInnerWidth >= 1366) {
			bodyMargin();
		}
	});
}
