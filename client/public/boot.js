(function () {
  var root = document.documentElement;
  try {
    var lang = localStorage.getItem('alfa-lang');
    if (lang !== 'ar' && lang !== 'en') lang = (navigator.language || '').indexOf('ar') === 0 ? 'ar' : 'en';
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    var theme = localStorage.getItem('alfa-theme');
    if (theme === 'light' || theme === 'dark') root.setAttribute('data-theme', theme);
  } catch (e) {}
})();
