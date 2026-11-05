// Pure geometry for the lesson's independently chosen rectangular example.
export function rectangleMetrics(scale, width = 13, height = 9) {
  if (![scale,width,height].every(value => Number.isFinite(value) && value > 0)) {
    throw new RangeError('Scale and dimensions must be positive finite numbers.');
  }
  return {
    scale, width: width * scale, height: height * scale,
    perimeter: 2 * (width + height) * scale,
    area: width * height * scale * scale,
    areaFactor: scale * scale
  };
}

export function rectangleDrawing(scale) {
  const m = rectangleMetrics(scale);
  const unit = 7;
  return {x:45,y:240-m.height*unit,width:m.width*unit,height:m.height*unit};
}

export function formatNumber(value) {
  return String(Number(value.toFixed(3)));
}

