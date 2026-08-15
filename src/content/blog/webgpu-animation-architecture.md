---
title: "WebGPU Animation Architecture"
date: 2026-09-02
tags:
  - graphics
  - webgpu
  - animations
---

Structuring a WebGPU application requires matching your render loop architecture to your application's interactivity. Using a continuous animation loop everywhere is a performance anti-pattern that drains battery life and wastes hardware resources.

This post started as part of the WebGPU 2026 update but it grew into a separate article because the topic of animation architecture is not specific to the 2026 update. The principles here apply to any WebGPU application, regardless of the year.

## Different strategies



### Single-Pass (Static Rendering)

Execute your WebGPU pipeline exactly once, without a loop, when dealing with:

* **Data Visualization**: Static charts, graphs, or mathematical plots that do not animate.
* **Image Processing**: Compute shaders running a filter over a static photograph.
* **Asset Generation**: Using the GPU to calculate procedural textures or geometry that you will later export or use elsewhere in the DOM.

### Continuous Loop (requestAnimationFrame)

Implement a continuous loop exclusively when the visual state changes frame-over-frame:

* **Animations**: Time-based movement, such as particle systems or spinning 3D models.
* **Real-Time Interactivity**: Scenes with constant camera controls (like orbit controls) where the user drags the viewport.
* **Video Processing**: Applying shaders to a `<video>` element or webcam stream where every frame contains new pixel data.

#### Refactoring to `requestAnimationFrame`

When refactoring a static script to support `requestAnimationFrame`, you must divide your code into a one-time initialization phase and a per-frame update loop. Note the critical requirement to request a new `textureView` inside the loop.

```ts
async function startRenderLoop(canvas: HTMLCanvasElement): Promise<void> {
  // --- Phase 1: One-time Initialization ---
  const adapter = await navigator.gpu.requestAdapter();
  const device = await adapter!.requestDevice();
  const context = canvas.getContext("webgpu")!;

  context.configure({
    device,
    format: navigator.gpu.getPreferredCanvasFormat(),
    alphaMode: "premultiplied",
  });

  // Fetch shaders and bake the immutable pipeline once
  const shaderModule = await loadShader("/shaders/triangle.wgsl", device);
  const pipeline = device.createRenderPipeline({ /* ... */ });

  // --- Phase 2: The Render Loop ---
  function frame(timestamp: number) {
    const commandEncoder = device.createCommandEncoder();

    // CRITICAL: We must request a new texture view every single frame
    const textureView = context.getCurrentTexture().createView();

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: textureView,
        clearValue: { r: 0.1, g: 0.2, b: 0.3, a: 1.0 },
        loadOp: "clear",
        storeOp: "store",
      }],
    });

    renderPass.setPipeline(pipeline);
    renderPass.draw(3);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
```

### Render-on-Demand

For applications that are mostly static but occasionally interactive (like a 3D product viewer where the user occasionally rotates the camera), the optimal architecture is render-on-demand.

Instead of a continuous loop, wrap your render logic in a function and only trigger it when a specific event dirties the state. This provides the responsiveness of a loop when needed while automatically returning the GPU to an idle state the moment the user stops interacting.

```ts
let isDirty = true;

function render() {
  if (!isDirty) return;

  const commandEncoder = device.createCommandEncoder();
  const textureView = context.getCurrentTexture().createView();

  // ... pass setup and draw calls ...

  device.queue.submit([commandEncoder.finish()]);

  // Mark as clean until new input arrives
  isDirty = false;
}

// Only trigger a new frame when the user interacts or the window resizes
canvas.addEventListener("mousemove", (event) => {
  updateCameraPosition(event);
  isDirty = true;
  requestAnimationFrame(render);
});

window.addEventListener("resize", () => {
  resizeCanvas();
  isDirty = true;
  requestAnimationFrame(render);
});

// Initial render
requestAnimationFrame(render);
```

## Conclusion

WebGPU applications should avoid a one-size-fits-all approach to rendering. By carefully choosing between single-pass, continuous loops, and render-on-demand  rendering strategies, developers can optimize performance, reduce power consumption, and provide a better user experience.
