(function() {
    "use strict";
    var ID = 113441569, KEY = "cookie_choice_v1", loaded = false;
    window.METRIKA_ID = ID;
    function load() {
        if (loaded || location.protocol === "file:") return;
        loaded = true;
        (function(m, e, t, r, i, k, a) {
            m[i] = m[i] || function() {
                (m[i].a = m[i].a || []).push(arguments);
            };
            m[i].l = 1 * new Date;
            for (var j = 0; j < document.scripts.length; j++) {
                if (document.scripts[j].src === r) {
                    return;
                }
            }
            k = e.createElement(t), a = e.getElementsByTagName(t)[0], k.async = 1, k.src = r, 
            a.parentNode.insertBefore(k, a);
        })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=" + ID, "ym");
        window.ym(ID, "init", {
            ssr: true,
            webvisor: true,
            clickmap: true,
            ecommerce: "dataLayer",
            referrer: document.referrer,
            url: location.href,
            accurateTrackBounce: true,
            trackLinks: true
        });
    }
    var choice = null;
    try {
        choice = localStorage.getItem(KEY);
    } catch (e) {}
    if (choice === "all") load();
    document.addEventListener("click", function(e) {
        if (e.target && e.target.closest && e.target.closest("#cookie-ok")) load();
    });
})();
