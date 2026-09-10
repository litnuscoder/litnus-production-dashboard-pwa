const PRINT = Object.freeze({
  trimWidthMm: 210,
  trimHeightMm: 297,
  bleedMm: 5,
  safeMarginMm: 15,
  spineFactorMmPerPage: 0.0472,
});

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function buildPrintSpec(pageCount) {
  const pages = Number(pageCount);
  const spineWidthMm = round2(pages * PRINT.spineFactorMmPerPage);
  const totalWidthMm = round2(
    PRINT.trimWidthMm * 2 + spineWidthMm + PRINT.bleedMm * 2,
  );
  const totalHeightMm = PRINT.trimHeightMm + PRINT.bleedMm * 2;

  const x = {
    canvasLeft: 0,
    backTrimLeft: PRINT.bleedMm,
    backTrimRight: PRINT.bleedMm + PRINT.trimWidthMm,
  };
  x.spineLeft = x.backTrimRight;
  x.spineRight = round2(x.spineLeft + spineWidthMm);
  x.frontTrimLeft = x.spineRight;
  x.frontTrimRight = round2(x.frontTrimLeft + PRINT.trimWidthMm);
  x.canvasRight = totalWidthMm;

  const y = {
    canvasTop: 0,
    trimTop: PRINT.bleedMm,
    trimBottom: PRINT.bleedMm + PRINT.trimHeightMm,
    canvasBottom: totalHeightMm,
  };

  const safe = {
    back: {
      left: round2(x.backTrimLeft + PRINT.safeMarginMm),
      right: round2(x.backTrimRight - PRINT.safeMarginMm),
      top: round2(y.trimTop + PRINT.safeMarginMm),
      bottom: round2(y.trimBottom - PRINT.safeMarginMm),
    },
    front: {
      left: round2(x.frontTrimLeft + PRINT.safeMarginMm),
      right: round2(x.frontTrimRight - PRINT.safeMarginMm),
      top: round2(y.trimTop + PRINT.safeMarginMm),
      bottom: round2(y.trimBottom - PRINT.safeMarginMm),
    },
  };

  return {
    unit: "mm",
    trim: {
      eachPanel: { width: PRINT.trimWidthMm, height: PRINT.trimHeightMm },
    },
    bleed: {
      top: PRINT.bleedMm,
      bottom: PRINT.bleedMm,
      backOuterLeft: PRINT.bleedMm,
      frontOuterRight: PRINT.bleedMm,
      spineLeftRight: 0,
    },
    safeMarginFromTrim: PRINT.safeMarginMm,
    spine: {
      formula: "jumlah_halaman × 0,0472 mm",
      factorMmPerPage: PRINT.spineFactorMmPerPage,
      widthMm: spineWidthMm,
    },
    canvas: { widthMm: totalWidthMm, heightMm: totalHeightMm },
    panelCoordinates: {
      x,
      y,
      safe,
    },
  };
}

module.exports = { PRINT, buildPrintSpec, round2 };
