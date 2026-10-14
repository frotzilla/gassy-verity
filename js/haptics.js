// Phone vibration. Android Chrome supports it; iOS Safari does not, so everything is guarded.
GV.haptics = (() => {
  const on = () => GV.config.haptics && "vibrate" in navigator;
  let nextPulse = 0;

  function buzz(pattern) { if (on()) try { navigator.vibrate(pattern); } catch (e) {} }

  // Called every frame while charging: pulses get faster and stronger as power builds.
  function charge(power, now) {
    if (now < nextPulse) return;
    nextPulse = now + 230 - power * 160;
    buzz(6 + Math.round(power * 24));
  }

  function release(power, blast) {
    nextPulse = 0;
    if (blast) buzz([60, 30, 60, 30, 220]);
    else buzz([20, 15, 40 + Math.round(power * 180)]);
  }

  function cancel() { buzz(0); }

  return { charge, release, cancel };
})();
