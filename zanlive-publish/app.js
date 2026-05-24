(function () {
  var cfg = window.APP_PUBLISH_CONFIG || {};
  var ua = navigator.userAgent || '';
  var comingSoon =
    cfg.comingSoonMessage || 'Not yet published. Stay tuned.';

  function hasUrl(url) {
    return typeof url === 'string' && url.trim().length > 0;
  }

  function isIOS() {
    return (
      /iPad|iPhone|iPod/i.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  }

  function isAndroid() {
    return /android/i.test(ua);
  }

  function $(id) {
    return document.getElementById(id);
  }

  function setText(id, text) {
    var el = $(id);
    if (el) el.textContent = text || '';
  }

  function show(id) {
    var el = $(id);
    if (el) el.hidden = false;
  }

  function hide(id) {
    var el = $(id);
    if (el) el.hidden = true;
  }

  function hidePanels() {
    hide('actions');
    hide('actions-dual');
    hide('ios-redirect');
    hide('coming-soon');
    hide('android-unavailable');
    hide('ios-unavailable');
  }

  function showComingSoon() {
    hidePanels();
    setText('coming-soon-text', comingSoon);
    show('coming-soon');
  }

  function bindDownloadLink(id, url) {
    var el = $(id);
    if (!el || !hasUrl(url)) return;
    el.href = url.trim();
    el.setAttribute('rel', 'noopener');
  }

  var androidUrl = cfg.androidApkUrl;
  var iosUrl = cfg.iosAppStoreUrl;
  var hasAndroid = hasUrl(androidUrl);
  var hasIos = hasUrl(iosUrl);

  document.title = (cfg.appName || 'App') + ' — 下载';
  setText('app-name', cfg.appName);
  setText('tagline', cfg.tagline);
  if (cfg.version) {
    setText('version', 'v' + cfg.version);
  }

  hidePanels();

  if (isIOS()) {
    if (hasIos) {
      bindDownloadLink('ios-fallback', iosUrl);
      show('ios-redirect');
    } else {
      showComingSoon();
    }
    return;
  }

  if (isAndroid()) {
    if (hasAndroid) {
      bindDownloadLink('btn-android', androidUrl);
      show('actions');
    } else {
      showComingSoon();
    }
    return;
  }

  /* 桌面 / 其他设备 */
  if (!hasAndroid && !hasIos) {
    showComingSoon();
    return;
  }

  show('actions-dual');

  if (hasAndroid) {
    bindDownloadLink('btn-android-desktop', androidUrl);
    show('btn-android-desktop');
  } else {
    hide('btn-android-desktop');
    setText('android-unavailable', comingSoon);
    show('android-unavailable');
  }

  if (hasIos) {
    bindDownloadLink('btn-ios-desktop', iosUrl);
    show('btn-ios-desktop');
  } else {
    hide('btn-ios-desktop');
    setText('ios-unavailable', comingSoon);
    show('ios-unavailable');
  }
})();
