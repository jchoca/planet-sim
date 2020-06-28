///<reference path="types/babylon.d.ts" />

class Game {
    private readonly _canvas: HTMLCanvasElement;
    private readonly _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    private _light: BABYLON.Light;

    private readonly _orbitRadius: number;

    constructor(canvasElement: string) {
        this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this._engine = new BABYLON.Engine(this._canvas, true);
        this._orbitRadius = 598;
    }

    createScene(): void {
        this._scene = new BABYLON.Scene(this._engine);
        this._scene.clearColor = new BABYLON.Color4(150, 150, 150);

        let earth = BABYLON.MeshBuilder.CreateSphere('earth',
            {diameter: 1}, this._scene);
        let points = this.createAnimation(earth);
        earth.position = points[0];

        let earthLabel = this.makePlanetLabel("EARTH", "black", 100);
        earthLabel.parent = earth;

        const camera = new BABYLON.ArcRotateCamera('camera1', Math.PI, 0, 0,
            new BABYLON.Vector3(this._orbitRadius, 0, -this._orbitRadius), this._scene);
        camera.setTarget(earth);
        camera.attachControl(this._canvas, false);

        this._light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 0, 500), this._scene);
        this._light.intensity = 0.5;

        let sun = BABYLON.MeshBuilder.CreateSphere("sun",
            {diameter: 109}, this._scene);
        sun.position = BABYLON.Vector3.Zero();

        const track = BABYLON.MeshBuilder.CreateLines('track', {points: points}, this._scene);
        track.color = new BABYLON.Color3(0, 0, 0);
        track.alpha = 0.1;

        this.showAxis(500);

        setTimeout(() => {
            this._scene.beginAnimation(earth, 0, points.length, true);
        });
    }

    createAnimation(mesh: BABYLON.Mesh) {
        const animation = new BABYLON.Animation("myAnimation", "position", 10, BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        let [keys, points] = this.generateKeys();
        animation.setKeys(keys);

        mesh.animations = [animation];

        return points;
    }

    generateKeys() {
        const diameter = this._orbitRadius;
        const keys = [];
        const points = [];
        for (let theta = 0; theta <= 360; theta += 0.1) {
            let rad = theta * (Math.PI / 180);
            let value = new BABYLON.Vector3((diameter / 2) * Math.cos(rad), (diameter / 2) * Math.sin(rad), 0);
            points.push(value);
            keys.push({
                frame: theta,
                value: value,
            })
        }
        return [keys, points];
    }

    makePlanetLabel(text: string, color: string, size: number) : BABYLON.Mesh {
        const dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 200, this._scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 0, 200, "bold 36px Arial", color, "transparent", true);
        const plane = new (BABYLON.Mesh as any).CreatePlane("TextPlane", size, this._scene, true);
        plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", this._scene);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;
        return plane as BABYLON.Mesh;
    }

    makeAxisLabel(text: string, color: string, size: number) : BABYLON.Mesh {
        const dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 40, this._scene, true);
        dynamicTexture.hasAlpha = true;
        dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color, "transparent", true);
        const plane = new (BABYLON.Mesh as any).CreatePlane("TextPlane", size, this._scene, true);
        plane.material = new BABYLON.StandardMaterial("TextPlaneMaterial", this._scene);
        plane.material.backFaceCulling = false;
        plane.material.specularColor = new BABYLON.Color3(0, 0, 0);
        plane.material.diffuseTexture = dynamicTexture;
        return plane as BABYLON.Mesh;
    }

    showAxis(size: number) {
        const axisX = BABYLON.Mesh.CreateLines("axisX", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, 0.05 * size, 0),
            new BABYLON.Vector3(size, 0, 0), new BABYLON.Vector3(size * 0.95, -0.05 * size, 0)
        ], this._scene);
        axisX.color = new BABYLON.Color3(1, 0, 0);

        const xChar = this.makeAxisLabel("X", "red", size / 10);
        xChar.position = new BABYLON.Vector3(0.9 * size, -0.05 * size, 0);

        const axisY = BABYLON.Mesh.CreateLines("axisY", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(-0.05 * size, size * 0.95, 0),
            new BABYLON.Vector3(0, size, 0), new BABYLON.Vector3(0.05 * size, size * 0.95, 0)
        ], this._scene);
        axisY.color = new BABYLON.Color3(0, 1, 0);

        const yChar = this.makeAxisLabel("Y", "green", size / 10);
        yChar.position = new BABYLON.Vector3(0, 0.9 * size, -0.05 * size);

        const axisZ = BABYLON.Mesh.CreateLines("axisZ", [
            BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, -0.05 * size, size * 0.95),
            new BABYLON.Vector3(0, 0, size), new BABYLON.Vector3(0, 0.05 * size, size * 0.95)
        ], this._scene);
        axisZ.color = new BABYLON.Color3(0, 0, 1);

        const zChar = this.makeAxisLabel("Z", "blue", size / 10);
        zChar.position = new BABYLON.Vector3(0, 0.05 * size, 0.9 * size);
    }

    doRender(): void {
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });

        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    let game = new Game('renderCanvas');
    game.createScene();
    game.doRender();
});