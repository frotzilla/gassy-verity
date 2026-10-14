// Number formatting for the economy: 1234 -> "1.23K", 5.1e9 -> "5.10B". Plain ASCII.
GV.fmt = (() => {
  const SUF = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];

  function fmt(n) {
    if (!isFinite(n)) return "0";
    if (n < 0) return "-" + fmt(-n);
    if (n < 10) return (Math.round(n * 10) / 10).toString();
    if (n < 1000) return Math.round(n).toString();
    const tier = Math.min(SUF.length - 1, Math.floor(Math.log10(n) / 3));
    const v = n / Math.pow(1000, tier);
    return v.toFixed(v < 10 ? 2 : v < 100 ? 1 : 0) + SUF[tier];
  }

  fmt.time = sec => {
    sec = Math.round(sec);
    if (sec < 60) return sec + "s";
    if (sec < 3600) return Math.floor(sec / 60) + "m";
    return Math.floor(sec / 3600) + "h " + Math.floor(sec % 3600 / 60) + "m";
  };

  return fmt;
})();
