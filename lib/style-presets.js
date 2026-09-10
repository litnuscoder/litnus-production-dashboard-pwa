const STYLE_PRESETS = Object.freeze({
  premium_school: {
    label: 'Premium School',
    instruction: 'premium educational editorial illustration, polished, refined, professional, print-friendly, controlled ornament, strong hierarchy',
  },
  modern_islamic: {
    label: 'Modern Islamic',
    instruction: 'modern Islamic educational visual language, elegant geometric accents, warm premium atmosphere, restrained ornament, contemporary composition',
  },
  academic_clean: {
    label: 'Academic Clean',
    instruction: 'clean academic visual system, minimal clutter, crisp typography hierarchy, structured composition, subtle subject motifs',
  },
  cinematic_education: {
    label: 'Cinematic Educational',
    instruction: 'cinematic educational illustration, dimensional light, immersive environment, realistic materials, dramatic but controlled visual depth',
  },
  soft_illustrated: {
    label: 'Soft Illustrated',
    instruction: 'soft editorial illustration, warm approachable characters, gentle texture, refined school-book finish, restrained detail',
  },
});

function getStylePreset(key) {
  return STYLE_PRESETS[key] || STYLE_PRESETS.premium_school;
}

module.exports = { STYLE_PRESETS, getStylePreset };
