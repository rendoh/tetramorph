import 'the-new-css-reset';

import { clock } from './core/clock';
import { renderer } from './core/renderer';
import { sizes } from './core/sizes';
import { Practice } from './practice/Practice';

sizes.addEventListener('resize', resize);
clock.addEventListener('tick', update);

const practice = new Practice();
renderer.scene.add(practice.scene);

function resize() {
  renderer.resize();
}

function update() {
  practice.update();
  renderer.update();
}
