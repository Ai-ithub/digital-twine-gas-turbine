import React, { useEffect, useRef } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Color4, SceneLoader, Vector3 } from '@babylonjs/core';
import '@babylonjs/loaders';

const My3DModel: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const engine = new Engine(canvas, true);
        const createScene = () => {
            const scene = new Scene(engine);
            scene.clearColor = new Color4(0.973, 0.973, 0.973, 1); // تنظیم رنگ پس‌زمینه به خاکستری 50

            const camera = new ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2, 5, Vector3.Zero(), scene);
            camera.attachControl(canvas, true);
            new HemisphericLight("light", new Vector3(0, 1, 0), scene);
          
            // بارگذاری مدل 3D
            SceneLoader.Append('/3D/cube.glb', '', scene, () => {
                scene.meshes.forEach(mesh => {
                    mesh.scaling = new Vector3(1, 1, 1); // تنظیم مقیاس
                });
                console.log("مدل 3D با موفقیت بارگذاری شد!");
            }, null, () => {
                console.error("خطا در بارگذاری مدل:");
            });

            return scene;
        };

        const scene = createScene();
        engine.runRenderLoop(() => {
            scene.render();
            // چرخش خودکار مدل به سمت راست
            scene.meshes.forEach(mesh => {
                mesh.rotation.y += 0.01; // تغییر زاویه چرخش
            });
        });

        window.addEventListener('resize', () => {
            engine.resize();
        });

        return () => {
            engine.dispose();
        };
    }, []);

    return (
      <div
        className="overflow-hidden rounded-2xl px-5 pt-5 dark:bg-white/[0.03] sm:px-6 sm:pt-6"
        onClick={(e) => {
            e.preventDefault();
            const target = e.target as HTMLElement;
            target.style.border = 'none'; // حذف حاشیه هنگام کلیک
        }}
        style={{ border: 'none' }} // حذف حاشیه اولیه
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90"></h3>
        </div>

        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
            <canvas 
                ref={canvasRef}  
                style={{ outline: 'none' }} // حذف outline
            />
          </div>
        </div>
      </div>
    );
};

export default My3DModel;