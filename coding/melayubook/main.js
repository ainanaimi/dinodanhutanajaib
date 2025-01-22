import { loadGLTF, loadAudio } from "../../libs/loader.js";
const THREE = window.MINDAR.IMAGE.THREE;

document.addEventListener('DOMContentLoaded', () => {
  const start = async () => {
    const mindarThree = new window.MINDAR.IMAGE.MindARThree({
      container: document.body,
      imageTargetSrc: '../../assets/targets/storybook/dino.mind',
    });

    const { renderer, scene, camera } = mindarThree;

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    const clock = new THREE.Clock();

    // Track loaded models for zooming
    const loadedModels = [];

    // Helper function to load assets
    const loadPage = async (pageIndex, modelPath, audioPath, scale, position, rotation = [0, 0, 0]) => {
      try {
        const gltf = await loadGLTF(modelPath);
        gltf.scene.scale.set(...scale);
        gltf.scene.position.set(...position);
        gltf.scene.rotation.set(...rotation);

        const anchor = mindarThree.addAnchor(pageIndex);
        anchor.group.add(gltf.scene);

        const audioClip = await loadAudio(audioPath);
        const listener = new THREE.AudioListener();
        camera.add(listener);

        const audio = new THREE.PositionalAudio(listener);
        anchor.group.add(audio);
        audio.setBuffer(audioClip);
        audio.setRefDistance(10000);
        audio.setLoop(true);

        anchor.onTargetFound = () => audio.play();
        anchor.onTargetLost = () => audio.stop();

        const mixer = new THREE.AnimationMixer(gltf.scene);
        const action = mixer.clipAction(gltf.animations[0]);
        action.play();

        // Store model reference for zoom functionality
        loadedModels.push(gltf.scene);

        return mixer;
      } catch (error) {
        console.error(`Error loading page ${pageIndex}:`, error);
      }
    };

    // Load pages
    const mixers = [
      await loadPage(0, '../../assets/models/g20/page1.glb', '../../assets/audio/BM/scene1.mp3', [0.2, 0.2, 0.2], [0, -0.4, 0]),
      await loadPage(1, '../../assets/models/g20/page2.glb', '../../assets/audio/BM/scene2.mp3', [0.3, 0.3, 0.3], [0, -0.4, 0]),
      await loadPage(2, '../../assets/models/g20/page3.glb', '../../assets/audio/BM/scene3.mp3', [0.3, 0.3, 0.3], [0, -0.4, 0]),
      await loadPage(3, '../../assets/models/g20/page4.glb', '../../assets/audio/BM/scene4.mp3', [0.2, 0.2, 0.2], [0, -0.4, 0]),
      await loadPage(4, '../../assets/models/g20/page5.glb', '../../assets/audio/BM/scene5.mp3', [0.6, 0.6, 0.6], [0, -0.4, 0]),
      await loadPage(5, '../../assets/models/g20/page6.glb', '../../assets/audio/BM/scene6.mp3', [0.2, 0.2, 0.2], [0, -0.4, 0], [0, 0, 0]),
      await loadPage(6, '../../assets/models/g20/page7.glb', '../../assets/audio/BM/scene7.mp3', [0.3, 0.3, 0.3], [0, -0.4, 0]),
      await loadPage(7, '../../assets/models/g20/page8.glb', '../../assets/audio/BM/scene8.mp3', [0.6, 0.6, 0.6], [0, -0.4, 0]),
      await loadPage(8, '../../assets/models/g20/page9.glb', '../../assets/audio/BM/scene9.mp3', [0.6, 0.6, 0.6], [0, -0.4, 0], [0, 0, 0]),
      await loadPage(9, '../../assets/models/g20/page10.glb', '../../assets/audio/BM/scene10.mp3', [0.6, 0.6, 0.6], [0, -0.4, 0]),
      await loadPage(10, '../../assets/models/g20/page11.glb', '../../assets/audio/BM/scene11.mp3', [0.2, 0.2, 0.2], [0, -0.4, 0]),
      await loadPage(11, '../../assets/models/g20/page12.glb', '../../assets/audio/BM/music.mp3', [0.2, 0.2, 0.2], [0, -0.4, 0]),
    ];

    // Zoom functionality
    const handleZoom = (event) => {
      const zoomFactor = 0.1; // Adjust zoom sensitivity
      const scaleDelta = event.deltaY < 0 ? zoomFactor : -zoomFactor; // Zoom in or out

      loadedModels.forEach((model) => {
        const newScale = Math.max(0.1, Math.min(5, model.scale.x + scaleDelta)); // Scale limits
        model.scale.set(newScale, newScale, newScale);
      });
    };

    // Attach zoom interaction to the window
    window.addEventListener('wheel', handleZoom);

    await mindarThree.start();

    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      mixers.forEach(mixer => mixer?.update(delta));
      renderer.render(scene, camera);
    });
  };

  start();
});
