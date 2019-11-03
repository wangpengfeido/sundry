import "./index.scss";

import { WebGLRenderer, OrthographicCamera, Scene, AmbientLight, FontLoader, TextureLoader, PlaneGeometry, TextGeometry, MeshBasicMaterial, Mesh, Group, Box3, Vector3, Box3Helper, GridHelper, DoubleSide, MeshDepthMaterial } from "three";
import { ScrollSensor } from "scroll-sensor";

class App {
  constructor() {
    this.width = 0;
    this.height = 0;

    this.scrollSensor = null;
    this.scrollTop = 0;

    this.renderer = null;
    this.camera = null;
    this.scene = null;

    this.objects = [];
  }
  init() {
    this.height = document.body.clientHeight;
    this.width = this.height * 0.75;

    this.initRender();
    this.initScrollSensor();
    this.initCamera();
    this.initScene();
    this.initLight();
    this.initObject();
    this.render();
  }
  initRender() {
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0xeeddaf, 1);
    document.querySelector(".canvas-box").appendChild(this.renderer.domElement);

    this.renderer.domElement.addEventListener("scroll", event => {
      event.preventDefault();
    });
    this.renderer.domElement.addEventListener("touchstart", event => {
      event.preventDefault();
    });
    this.renderer.domElement.addEventListener("touchmove", event => {
      event.preventDefault();
    });
  }
  initScrollSensor() {
    this.scrollSensor = new ScrollSensor({
      element: this.renderer.domElement,
      options: {
        maxScrollLeft: 0,
        maxScrollTop: this.height * 4.5,
        mouseWheelInertiaXDeceleration: 5000,
        mouseWheelInertiaYDeceleration: 5000,
        mouseMoveInertiaXDeceleration: 5000,
        mouseMoveInertiaYDeceleration: 5000,
        touchInertiaXDeceleration: 5000,
        touchInertiaYDeceleration: 5000
      }
    });
    this.scrollSensor.on("scroll", event => {
      this.scrollTop = event.scrollTop;
    });
  }
  initCamera() {
    // 使用正交投影相机
    this.camera = new OrthographicCamera(-this.width / 2, this.width / 2, this.height / 2, -this.height / 2, 10, 1000);
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 600;
    this.camera.up.x = 0;
    this.camera.up.y = 1;
    this.camera.up.z = 0;
    this.camera.lookAt(0, 0, 0);
  }
  initScene() {
    this.scene = new Scene();
  }
  initLight() {
    const light1 = new AmbientLight(0xffffff);
    light1.position.set(100, 100, 200);
    this.scene.add(light1);
  }
  createPlane({ pictureUrl }) {
    const height = this.height * 0.18;
    const width = this.height * 0.18;
    const plane = new PlaneGeometry(height, width, 1, 1);
    const texture = new TextureLoader().load(pictureUrl);
    const material = new MeshBasicMaterial({ map: texture });
    material.side = DoubleSide;
    const mesh = new Mesh(plane, material);
    mesh.baseX = width;
    mesh.baseY = height;
    mesh.position.x = 100000;
    mesh.position.y = 100000;
    mesh.anims = [];
    return mesh;
  }
  addMoveAnimToPlane({ mesh, startScrollPosition, endScrollPosition, animStartXPosition, animEndXPosition, animStartYPosition, animEndYPosition }) {
    mesh.anims.push(scrollTop => {
      const percent = (scrollTop - startScrollPosition) / (endScrollPosition - startScrollPosition);
      if (percent >= 0 && percent <= 1) {
        mesh.position.x = animStartXPosition + percent * (animEndXPosition - animStartXPosition);
        mesh.position.y = animStartYPosition + percent * (animEndYPosition - animStartYPosition);
      } else if (percent > 1) {
        mesh.position.x = animEndXPosition;
        mesh.position.y = animEndYPosition;
      } else if (percent < 0) {
        mesh.position.x = 10000;
        mesh.position.y = 10000;
      }
    });
  }
  addRotateAnimToPlane({ mesh, startScrollPosition, endScrollPosition }) {
    mesh.anims.push(scrollTop => {
      const percent = (scrollTop - startScrollPosition) / (endScrollPosition - startScrollPosition);
      if (percent >= 0 && percent <= 1) {
        mesh.rotation.x = percent * Math.PI * 2;
        mesh.rotation.y = percent * Math.PI * 2;
      } else {
        mesh.rotation.x = 0;
        mesh.rotation.y = 0;
      }
    });
  }
  addRandomScale({ mesh, startScrollPosition }) {
    mesh.randomScaling = 0;
    mesh.anims.push(scrollTop => {
      if (scrollTop > startScrollPosition) {
        if (mesh.randomScaling === 1) {
          // 缩放速度
          mesh.scale.x -= 0.001;
          mesh.scale.y -= 0.001;
          // 缩放大小
          if (mesh.scale.x <= 0.8) {
            mesh.randomScaling = 2;
          }
        }
        if (mesh.randomScaling === 2) {
          mesh.scale.x += 0.001;
          mesh.scale.y += 0.001;
          if (mesh.scale.x >= 1) {
            mesh.randomScaling = 0;
            mesh.scale.x = 1;
            mesh.scale.y = 1;
          }
        } else {
          const random = Math.random();
          // 概率
          if (random <= 0.005) {
            mesh.randomScaling = 1;
          }
        }
      } else {
        mesh.randomScaling = 0;
        mesh.scale.x = 1;
        mesh.scale.y = 1;
      }
    });
  }
  initObject() {
    // 文字
    const fontLoader = new FontLoader();
    fontLoader.load(require("../assets/fonts/FZShuTi_Regular.typeface"), font => {
      this.textGroup = new Group();
      const textArr = ["下滑", "开启", "魔法"];
      for (let i = 0; i < textArr.length; i++) {
        const textGeometry = new TextGeometry(textArr[i], {
          font,
          size: this.height * 0.13,
          height: 10
        });
        const textMaterial = new MeshBasicMaterial({ color: 0x20d9db });
        const textMesh = new Mesh(textGeometry, textMaterial);
        textMesh.translateX(-this.height * 0.02);
        textMesh.translateY(-i * this.height * 0.16 - this.height * 0.13);
        this.textGroup.add(textMesh);
      }
      this.textGroup.box3 = new Box3().setFromObject(this.textGroup);
      this.textGroup.baseXPosition = -this.textGroup.box3.getSize(new Vector3()).x / 2;
      this.textGroup.baseYPosition = this.textGroup.box3.getSize(new Vector3()).y / 2;
      this.textGroup.position.x = this.textGroup.baseXPosition;
      this.textGroup.position.y = this.textGroup.baseYPosition;
      this.scene.add(this.textGroup);
      this.objects.push(this.textGroup);
      this.textGroup.anims = [];
      // 动画
      this.textGroup.anims = [
        scrollTop => {
          this.textGroup.position.y = this.textGroup.baseYPosition + scrollTop;
        }
      ];
    });

    const moveEndY = this.height * 0.25;
    const mesh1 = this.createPlane({ pictureUrl: require("../assets/images/jx.jpg") });
    this.scene.add(mesh1);
    this.objects.push(mesh1);
    this.addMoveAnimToPlane({
      mesh: mesh1,
      startScrollPosition: this.height * 0.3,
      endScrollPosition: this.height * 1,
      animStartXPosition: this.width / 2 + mesh1.baseX / 2 + 10,
      animEndXPosition: -(mesh1.baseX / 2 + 10),
      animStartYPosition: -this.height * 0.4,
      animEndYPosition: moveEndY
    });
    this.addRotateAnimToPlane({
      mesh: mesh1,
      startScrollPosition: this.height * 2.6,
      endScrollPosition: this.height * 3.4
    });
    this.addRandomScale({ mesh: mesh1, startScrollPosition: this.height * 4.4 });

    const mesh2 = this.createPlane({ pictureUrl: require("../assets/images/czw.jpg") });
    this.scene.add(mesh2);
    this.objects.push(mesh2);
    this.addMoveAnimToPlane({
      mesh: mesh2,
      startScrollPosition: this.height * 0.5,
      endScrollPosition: this.height * 1.4,
      animStartXPosition: -(this.width / 2 + mesh2.baseX / 2 + 10),
      animEndXPosition: mesh2.baseX / 2 + 10,
      animStartYPosition: -this.height * 0.4,
      animEndYPosition: moveEndY
    });
    this.addRotateAnimToPlane({
      mesh: mesh2,
      startScrollPosition: this.height * 2.8,
      endScrollPosition: this.height * 3.6
    });
    this.addRandomScale({ mesh: mesh2, startScrollPosition: this.height * 4.4 });

    const mesh3 = this.createPlane({ pictureUrl: require("../assets/images/lxm.jpg") });
    this.scene.add(mesh3);
    this.objects.push(mesh3);
    this.addMoveAnimToPlane({
      mesh: mesh3,
      startScrollPosition: this.height * 0.9,
      endScrollPosition: this.height * 1.6,
      animStartXPosition: this.width / 2 + mesh3.baseX / 2 + 10,
      animEndXPosition: -(mesh3.baseX / 2 + 10),
      animStartYPosition: -this.height * 0.1,
      animEndYPosition: moveEndY - (mesh3.baseY + 20)
    });
    this.addRotateAnimToPlane({
      mesh: mesh3,
      startScrollPosition: this.height * 3,
      endScrollPosition: this.height * 3.8
    });
    this.addRandomScale({ mesh: mesh3, startScrollPosition: this.height * 4.4 });

    const mesh4 = this.createPlane({ pictureUrl: require("../assets/images/gyl.jpg") });
    this.scene.add(mesh4);
    this.objects.push(mesh4);
    this.addMoveAnimToPlane({
      mesh: mesh4,
      startScrollPosition: this.height * 1.4,
      endScrollPosition: this.height * 2,
      animStartXPosition: -(this.width / 2 + mesh4.baseX / 2 + 10),
      animEndXPosition: mesh4.baseX / 2 + 10,
      animStartYPosition: -this.height * 0.4,
      animEndYPosition: moveEndY - (mesh3.baseY + 20)
    });
    this.addRotateAnimToPlane({
      mesh: mesh4,
      startScrollPosition: this.height * 3.2,
      endScrollPosition: this.height * 4
    });
    this.addRandomScale({ mesh: mesh4, startScrollPosition: this.height * 4.4 });

    const mesh5 = this.createPlane({ pictureUrl: require("../assets/images/gxw.jpg") });
    this.scene.add(mesh5);
    this.objects.push(mesh5);
    this.addMoveAnimToPlane({
      mesh: mesh5,
      startScrollPosition: this.height * 2,
      endScrollPosition: this.height * 2.6,
      animStartXPosition: this.width / 2 + mesh5.baseX / 2 + 10,
      animEndXPosition: -(mesh5.baseX / 2 + 10),
      animStartYPosition: this.height * 0.4,
      animEndYPosition: moveEndY - (mesh5.baseY + 20) * 2
    });
    this.addRotateAnimToPlane({
      mesh: mesh5,
      startScrollPosition: this.height * 3.4,
      endScrollPosition: this.height * 4.2
    });
    this.addRandomScale({ mesh: mesh5, startScrollPosition: this.height * 4.4 });

    const mesh6 = this.createPlane({ pictureUrl: require("../assets/images/wpf.jpg") });
    this.scene.add(mesh6);
    this.objects.push(mesh6);
    this.addMoveAnimToPlane({
      mesh: mesh6,
      startScrollPosition: this.height * 2,
      endScrollPosition: this.height * 2.6,
      animStartXPosition: -(this.width / 2 + mesh4.baseX / 2 + 10),
      animEndXPosition: mesh4.baseX / 2 + 10,
      animStartYPosition: this.height * 0.4,
      animEndYPosition: moveEndY - (mesh5.baseY + 20) * 2
    });
    this.addRotateAnimToPlane({
      mesh: mesh6,
      startScrollPosition: this.height * 3.6,
      endScrollPosition: this.height * 4.4
    });
    this.addRandomScale({ mesh: mesh6, startScrollPosition: this.height * 4.4 });
  }
  animate() {
    this.objects.forEach(object => {
      object && object.anims.length && object.anims.forEach(anim => anim(this.scrollTop));
    });
  }
  render() {
    requestAnimationFrame(() => {
      this.render();
    });
    this.animate();
    this.renderer.render(this.scene, this.camera);
  }
}

class Sound {
  constructor() {
    this.dom = document.createElement("audio");
    this.dom.src = require("../assets/sounds/eva.mp3");
  }
  play() {
    this.dom.play().catch();
  }
}

new App().init();
const sound = new Sound();
sound.play();

window.addEventListener("click", () => {
  sound.play();
});
window.addEventListener("mousewheel", () => {
  sound.play();
});
