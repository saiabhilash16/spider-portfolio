/* =========================================================================
 * SPIDER-MAN CHARACTER (rigged 3D model) — Phase 2A plumbing, Phase 2B content.
 *
 * Model: public/assets/tribute/character/spiderman-textured.glb (your textured Raimi-suit model, 76-bone rig).
 * It has NO animation clips yet: until they exist he holds his rest pose (A-pose) and only the
 * Phase 2A path moves him. Nothing is faked; the preview panel lists the missing clips.
 * Visitors only see it when `enabledForVisitors` is true (switched on in Phase 2B,
 * after the model has been checked). Preview mode (?preview) always shows a character:
 * the real model if it exists, otherwise the CC0 TEST character below — which is
 * never shown to visitors and is never presented as Spider-Man.
 * ========================================================================= */
export const CHARACTER = {
  file: 'character/spiderman-animated.glb',
  enabledForVisitors: true,
  /** show the model in preview mode. Off until real animation clips exist — no static model sliding along paths. */
  showInPreview: true,
  height: 1.8,                      // metres-ish, scene units — the model is rescaled to this height
  /** animation clip names inside spiderman.glb (rename here if your clips are named differently) */
  clips: { swing: 'Swing', perch: 'Swing', fall: 'FallBackward', shoot: 'Swing', land: 'Land', idle: 'Land' },
  /** what each clip is for — listed in the preview panel when the clip is missing */
  needed: [
    { clip: 'Swing_R / Swing_L', use: 'web swing between items, one per hand (realistic, animator/mocap)' },
    { clip: 'HangIdle', use: 'hanging from a web beside a project / case study / skill' },
    { clip: 'FallBackward', use: 'the multiverse fall' },
    { clip: 'WebShoot', use: 'firing the web at the start of each swing' },
    { clip: 'Release', use: 'letting go of the web between swings' },
    { clip: 'Land', use: 'landing at the exit portal' },
  ],
  /** the bone the web line starts from */
  handBone: /mixamorig:?RightHand$|RightHand$|Hand[._]?R$|hand_r$/i,
  test: {
    file: 'character/_test/RobotExpressive.glb',
    clips: { swing: 'Jump', perch: 'Idle', fall: 'Jump', shoot: 'Punch', land: 'Standing', idle: 'Idle' },
    license: 'Test character: RobotExpressive by Tomás Laulhé (Quaternius), CC0 1.0 — preview only',
  },
}
export type ClipMap = typeof CHARACTER.clips
