// Custom Flutter Web bootstrap.
// 强制使用 CanvasKit 渲染器：这样 window.devicePixelRatio 的 override（见 index.html）
// 才会真正放大内部画布到 ~3K，得到锐利的文字与图形。
// HTML renderer 不读 DPR，所以必须切到 CanvasKit。

{{flutter_js}}
{{flutter_build_config}}

_flutter.loader.load({
  config: {
    renderer: "canvaskit",
  },
});
