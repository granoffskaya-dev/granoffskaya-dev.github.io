(function() {
    "use strict";
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var body = document.body;
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = (new Date).getFullYear();
    var hdr = document.getElementById("hdr");
    requestAnimationFrame(function() {
        setTimeout(function() {
            body.classList.add("loaded");
            hdr.classList.add("ready");
        }, 80);
    });
    var burger = document.getElementById("burger"), mnav = document.getElementById("mnav");
    var lastY = scrollY, pgup = document.getElementById("pgup");
    function onScroll() {
        var y = scrollY;
        hdr.classList.toggle("solid", y > 60);
        if (!mnav.classList.contains("on")) {
            if (y > lastY + 4 && y > 200) hdr.classList.add("hide"); else if (y < lastY - 4 || y < 200) hdr.classList.remove("hide");
        }
        lastY = y;
        if (pgup) pgup.classList.toggle("on", y > innerHeight * 1.2);
    }
    addEventListener("scroll", onScroll, {
        passive: true
    });
    onScroll();
    if (pgup) pgup.addEventListener("click", function() {
        scrollTo({
            top: 0,
            behavior: reduce ? "auto" : "smooth"
        });
    });
    function closeNav() {
        if (!mnav.classList.contains("on")) return;
        burger.classList.remove("on");
        mnav.classList.remove("on");
        hdr.classList.remove("menu-open");
        burger.setAttribute("aria-expanded", "false");
        body.classList.remove("lock");
    }
    burger.addEventListener("click", function() {
        if (mnav.classList.contains("on")) {
            closeNav();
            return;
        }
        burger.classList.add("on");
        mnav.classList.add("on");
        hdr.classList.add("menu-open");
        hdr.classList.remove("hide");
        burger.setAttribute("aria-expanded", "true");
        body.classList.add("lock");
        var links = mnav.querySelectorAll("a");
        for (var i = 0; i < links.length; i++) links[i].style.transitionDelay = .06 + i * .05 + "s";
    });
    mnav.addEventListener("click", function(e) {
        if (e.target === mnav || e.target.closest("a")) closeNav();
    });
    document.addEventListener("click", function(e) {
        var a = e.target.closest && e.target.closest('a[href^="#"]');
        if (!a || a.getAttribute("href").length < 2) return;
        var el = document.querySelector(a.getAttribute("href"));
        if (!el) return;
        e.preventDefault();
        scrollTo({
            top: el.getBoundingClientRect().top + scrollY - 20,
            behavior: reduce ? "auto" : "smooth"
        });
    });
    var els = document.querySelectorAll("[data-a]");
    if ("IntersectionObserver" in window && !reduce) {
        var io = new IntersectionObserver(function(en) {
            en.forEach(function(x) {
                if (x.isIntersecting) {
                    x.target.classList.add("in");
                    io.unobserve(x.target);
                }
            });
        }, {
            threshold: .12,
            rootMargin: "0px 0px -6% 0px"
        });
        els.forEach(function(el) {
            io.observe(el);
        });
    } else els.forEach(function(el) {
        el.classList.add("in");
    });
    var vids = document.querySelectorAll(".g-item video");
    if (vids.length && "IntersectionObserver" in window) {
        var vio = new IntersectionObserver(function(en) {
            en.forEach(function(x) {
                var v = x.target;
                if (x.isIntersecting) {
                    if (v.preload === "none") v.preload = "auto";
                    var p = v.play();
                    if (p && p.catch) p.catch(function() {});
                } else v.pause();
            });
        }, {
            threshold: .25
        });
        vids.forEach(function(v) {
            v.muted = true;
            v.setAttribute("playsinline", "");
            if (!reduce) vio.observe(v);
        });
    }
    var imgs = Array.prototype.slice.call(document.querySelectorAll(".g-item img"));
    var lb = document.getElementById("lb"), lbImg = document.getElementById("lb-img"), lbCount = document.getElementById("lb-count"), cur = 0;
    function show(n) {
        if (!imgs.length) return;
        cur = (n + imgs.length) % imgs.length;
        lbImg.src = imgs[cur].currentSrc || imgs[cur].src;
        lbImg.alt = imgs[cur].alt || "";
        lbCount.textContent = cur + 1 + " / " + imgs.length;
        lb.querySelector(".lb-prev").style.display = lb.querySelector(".lb-next").style.display = imgs.length > 1 ? "" : "none";
    }
    function closeLb() {
        if (!lb || !lb.classList.contains("on")) return;
        lb.classList.remove("on");
        if (!document.querySelector(".modal.on")) body.classList.remove("lock");
    }
    if (lb) {
        imgs.forEach(function(im, i) {
            im.addEventListener("click", function() {
                show(i);
                lb.classList.add("on");
                body.classList.add("lock");
            });
        });
        document.getElementById("lb-x").addEventListener("click", closeLb);
        document.getElementById("lb-prev").addEventListener("click", function(e) {
            e.stopPropagation();
            show(cur - 1);
        });
        document.getElementById("lb-next").addEventListener("click", function(e) {
            e.stopPropagation();
            show(cur + 1);
        });
        lb.addEventListener("click", function(e) {
            if (e.target === lb || e.target === lbImg) closeLb();
        });
        var tx = null;
        lb.addEventListener("touchstart", function(e) {
            tx = e.touches[0].clientX;
        }, {
            passive: true
        });
        lb.addEventListener("touchend", function(e) {
            if (tx === null) return;
            var dx = e.changedTouches[0].clientX - tx;
            tx = null;
            if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
        });
    }
    function closeModals() {
        document.querySelectorAll(".modal.on").forEach(function(m) {
            m.classList.remove("on");
        });
        if ((!lb || !lb.classList.contains("on")) && !mnav.classList.contains("on")) body.classList.remove("lock");
    }
    document.addEventListener("click", function(e) {
        var t = e.target.closest && e.target.closest("[data-modal]");
        if (t) {
            var m = document.getElementById(t.getAttribute("data-modal"));
            if (m) {
                e.preventDefault();
                m.classList.add("on");
                body.classList.add("lock");
                return;
            }
        }
        if (e.target.closest && e.target.closest("[data-close]")) {
            closeModals();
            return;
        }
        if (e.target.classList && e.target.classList.contains("modal")) closeModals();
    });
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            closeModals();
            closeLb();
            closeNav();
        }
        if (lb && lb.classList.contains("on")) {
            if (e.key === "ArrowRight") show(cur + 1);
            if (e.key === "ArrowLeft") show(cur - 1);
        }
    });
    var cookie = document.getElementById("cookie"), KEY = "cookie_choice_v1";
    if (cookie) {
        var stored = null;
        try {
            stored = localStorage.getItem(KEY);
        } catch (err) {}
        function save(v) {
            try {
                localStorage.setItem(KEY, v);
            } catch (err) {}
            cookie.classList.remove("on");
        }
        if (!stored) setTimeout(function() {
            cookie.classList.add("on");
        }, 1800);
        document.getElementById("cookie-ok").addEventListener("click", function() {
            save("all");
        });
        document.getElementById("cookie-no").addEventListener("click", function() {
            save("necessary");
        });
    }
})();

(function() {
    "use strict";
    var covers = document.querySelectorAll(".vcase-cover");
    if (!covers.length) return;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var body = document.body;
    var prev = document.querySelectorAll(".vcase-cover video");
    prev.forEach(function(v) {
        v.muted = true;
        v.loop = true;
        v.setAttribute("playsinline", "");
    });
    if (!reduce && "IntersectionObserver" in window) {
        var io = new IntersectionObserver(function(en) {
            en.forEach(function(x) {
                x.target.querySelectorAll("video").forEach(function(v) {
                    if (x.isIntersecting) {
                        if (v.preload === "none") v.preload = "auto";
                        var p = v.play();
                        if (p && p.catch) p.catch(function() {});
                    } else v.pause();
                });
            });
        }, {
            threshold: .3
        });
        covers.forEach(function(c) {
            io.observe(c);
        });
    }
    var vlb = document.createElement("div");
    vlb.className = "vlb";
    vlb.setAttribute("role", "dialog");
    vlb.setAttribute("aria-modal", "true");
    vlb.setAttribute("aria-label", "Просмотр ролика");
    vlb.innerHTML = '<button class="lb-x" aria-label="Закрыть">✕</button><video controls playsinline preload="none"></video>';
    body.appendChild(vlb);
    var player = vlb.querySelector("video"), closeBtn = vlb.querySelector(".lb-x"), opener = null;
    function open(c) {
        opener = c;
        var ar = (c.getAttribute("data-ar") || "16/9").split("/"), r = (+ar[0] || 16) / (+ar[1] || 9);
        vlb.classList.toggle("is-v", r < .9);
        vlb.classList.toggle("is-sq", r >= .9 && r < 1.5);
        vlb.classList.toggle("is-h", r >= 1.5);
        player.poster = c.getAttribute("data-poster") || "";
        player.src = c.getAttribute("data-video");
        vlb.classList.add("on");
        body.classList.add("lock");
        prev.forEach(function(v) {
            v.pause();
        });
        var p = player.play();
        if (p && p.catch) p.catch(function() {});
        closeBtn.focus();
    }
    function close() {
        if (!vlb.classList.contains("on")) return;
        vlb.classList.remove("on");
        body.classList.remove("lock");
        player.pause();
        player.removeAttribute("src");
        player.load();
        if (opener) opener.focus();
    }
    covers.forEach(function(c) {
        c.addEventListener("click", function() {
            if (c.getAttribute("data-video")) open(c);
        });
    });
    closeBtn.addEventListener("click", close);
    vlb.addEventListener("click", function(e) {
        if (e.target === vlb) close();
    });
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") close();
    });
})();

(function() {
    "use strict";
    var series = document.querySelectorAll(".ps");
    if (!series.length) return;
    var body = document.body;
    var lb = document.getElementById("lb"), lbImg = document.getElementById("lb-img"), lbCount = document.getElementById("lb-count");
    var set = [], cur = 0, active = false;
    function show(n) {
        cur = (n + set.length) % set.length;
        lbImg.src = set[cur].getAttribute("data-full");
        lbImg.alt = (set[cur].querySelector("img") || {}).alt || "";
        lbCount.textContent = cur + 1 + " / " + set.length;
        lb.querySelector(".lb-prev").style.display = lb.querySelector(".lb-next").style.display = set.length > 1 ? "" : "none";
    }
    function close() {
        active = false;
    }
    lb.addEventListener("click", function(e) {
        if (e.target === lb || e.target === lbImg) close();
    });
    document.getElementById("lb-x").addEventListener("click", close);
    document.getElementById("lb-prev").addEventListener("click", function(e) {
        if (active) {
            e.stopPropagation();
            show(cur - 1);
        }
    });
    document.getElementById("lb-next").addEventListener("click", function(e) {
        if (active) {
            e.stopPropagation();
            show(cur + 1);
        }
    });
    document.addEventListener("keydown", function(e) {
        if (!active || !lb.classList.contains("on")) return;
        if (e.key === "ArrowRight") show(cur + 1);
        if (e.key === "ArrowLeft") show(cur - 1);
        if (e.key === "Escape") close();
    });
    var tx = null;
    lb.addEventListener("touchstart", function(e) {
        tx = e.touches[0].clientX;
    }, {
        passive: true
    });
    lb.addEventListener("touchend", function(e) {
        if (!active || tx === null) return;
        var dx = e.changedTouches[0].clientX - tx;
        tx = null;
        if (Math.abs(dx) > 50) show(cur + (dx < 0 ? 1 : -1));
    });
    series.forEach(function(ps) {
        var strip = ps.querySelector(".ps-strip"), prev = ps.querySelector(".ps-prev"), next = ps.querySelector(".ps-next");
        var photos = Array.prototype.slice.call(ps.querySelectorAll(".ps-card[data-full]"));
        photos.forEach(function(card, i) {
            card.addEventListener("click", function() {
                set = photos;
                active = true;
                show(i);
                lb.classList.add("on");
                body.classList.add("lock");
            });
        });
        function step() {
            var c = strip.querySelector(".ps-card");
            return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(strip).columnGap || 0) : 300;
        }
        function upd() {
            if (!prev) return;
            prev.disabled = strip.scrollLeft < 4;
            next.disabled = strip.scrollLeft + strip.clientWidth > strip.scrollWidth - 4;
        }
        if (prev) {
            prev.addEventListener("click", function() {
                strip.scrollBy({
                    left: -step() * 2
                });
            });
            next.addEventListener("click", function() {
                strip.scrollBy({
                    left: step() * 2
                });
            });
            strip.addEventListener("scroll", upd, {
                passive: true
            });
            addEventListener("resize", upd);
            upd();
        }
    });
    var vids = document.querySelectorAll(".ps-vid");
    if (!vids.length) return;
    var vlb = document.querySelector(".vlb");
    if (!vlb) {
        vlb = document.createElement("div");
        vlb.className = "vlb";
        vlb.setAttribute("role", "dialog");
        vlb.setAttribute("aria-modal", "true");
        vlb.innerHTML = '<button class="lb-x" aria-label="Закрыть">✕</button><video controls playsinline preload="none"></video>';
        body.appendChild(vlb);
    }
    var player = vlb.querySelector("video"), opener = null;
    function vclose() {
        if (!vlb.classList.contains("on")) return;
        vlb.classList.remove("on");
        body.classList.remove("lock");
        player.pause();
        player.removeAttribute("src");
        player.load();
        if (opener) opener.focus();
    }
    vids.forEach(function(v) {
        v.addEventListener("click", function() {
            opener = v;
            vlb.classList.remove("is-h");
            vlb.classList.add("is-v");
            player.poster = (v.querySelector("img") || {}).src || "";
            player.src = v.getAttribute("data-video");
            vlb.classList.add("on");
            body.classList.add("lock");
            var p = player.play();
            if (p && p.catch) p.catch(function() {});
        });
    });
    vlb.querySelector(".lb-x").addEventListener("click", vclose);
    vlb.addEventListener("click", function(e) {
        if (e.target === vlb) vclose();
    });
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") vclose();
    });
})();

(function() {
    "use strict";
    var cases = document.querySelectorAll(".wcase");
    if (!cases.length) return;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var touch = window.matchMedia && matchMedia("(hover: none)").matches;
    var body = document.body;
    function setDur(scr) {
        var img = scr.querySelector("img");
        if (!img) return;
        function calc() {
            var h = scr.clientHeight, ih = img.getBoundingClientRect().height;
            if (!h || !ih) return;
            var screens = Math.max(1, ih / h - 1);
            scr.parentNode.style.setProperty("--dur", Math.min(40, Math.max(4, screens * .9)).toFixed(1) + "s");
        }
        if (img.complete) calc(); else img.addEventListener("load", calc);
        addEventListener("resize", calc);
    }
    document.querySelectorAll(".wcase .w-screen").forEach(setDur);
    if (touch && !reduce && "IntersectionObserver" in window) {
        var io = new IntersectionObserver(function(en) {
            en.forEach(function(x) {
                x.target.classList.toggle("w-run", x.isIntersecting);
            });
        }, {
            threshold: .6
        });
        document.querySelectorAll(".wcase button.w-browser").forEach(function(b) {
            io.observe(b);
        });
    }
    var wlb = document.createElement("div");
    wlb.className = "wlb";
    wlb.setAttribute("role", "dialog");
    wlb.setAttribute("aria-modal", "true");
    wlb.setAttribute("aria-label", "Просмотр сайта");
    wlb.innerHTML = '<button class="lb-x" aria-label="Закрыть">✕</button><div class="wlb-sc"><img alt=""></div>';
    body.appendChild(wlb);
    var sc = wlb.querySelector(".wlb-sc"), big = sc.querySelector("img"), closeBtn = wlb.querySelector(".lb-x"), opener = null;
    function open(b) {
        opener = b;
        var im = b.querySelector("img");
        wlb.classList.toggle("is-mob", b.getAttribute("data-kind") === "mob");
        big.src = b.getAttribute("data-full");
        big.alt = im ? im.alt : "";
        sc.scrollTop = 0;
        wlb.classList.add("on");
        body.classList.add("lock");
        closeBtn.focus();
    }
    function close() {
        if (!wlb.classList.contains("on")) return;
        wlb.classList.remove("on");
        body.classList.remove("lock");
        if (opener) opener.focus();
    }
    document.querySelectorAll(".wcase button[data-full]").forEach(function(b) {
        b.addEventListener("click", function() {
            open(b);
        });
    });
    closeBtn.addEventListener("click", close);
    sc.addEventListener("click", function(e) {
        if (e.target === sc) close();
    });
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") close();
    });
})();

(function() {
    "use strict";
    document.querySelectorAll(".lg-item").forEach(function(item) {
        var cover = item.querySelector(".lg-cover"), img = cover && cover.querySelector("img");
        if (!img) return;
        var slides = [ cover ].concat(Array.prototype.slice.call(item.querySelectorAll(".ps-card[hidden]")));
        var n = slides.length, cur = 0, num = cover.querySelector(".lg-n"), txt = item.querySelector(".lg-txt");
        function place() {
            item.style.setProperty("--lg-top", cover.offsetTop + cover.offsetHeight / 2 + "px");
        }
        place();
        addEventListener("resize", place);
        if (img.complete) place(); else img.addEventListener("load", place);
        function go(i) {
            cur = (i + n) % n;
            var src = slides[cur].getAttribute("data-thumb") || slides[cur].getAttribute("data-full");
            cover.classList.add("swap");
            var pre = new Image;
            pre.onload = pre.onerror = function() {
                img.src = src;
                cover.classList.remove("swap");
            };
            pre.src = src;
            if (num) num.textContent = cur + 1 + " / " + n;
        }
        item.querySelector(".lg-prev").addEventListener("click", function(e) {
            e.stopPropagation();
            go(cur - 1);
        });
        item.querySelector(".lg-next").addEventListener("click", function(e) {
            e.stopPropagation();
            go(cur + 1);
        });
        cover.addEventListener("click", function(e) {
            if (cur === 0) return;
            e.stopImmediatePropagation();
            slides[cur].click();
        }, true);
        var sx = null;
        cover.addEventListener("touchstart", function(e) {
            sx = e.touches[0].clientX;
        }, {
            passive: true
        });
        cover.addEventListener("touchend", function(e) {
            if (sx === null) return;
            var dx = e.changedTouches[0].clientX - sx;
            sx = null;
            if (Math.abs(dx) > 40) {
                e.preventDefault();
                go(cur + (dx < 0 ? 1 : -1));
            }
        });
    });
})();

(function() {
    "use strict";
    var keys = document.querySelectorAll(".b-k");
    Array.prototype.forEach.call(keys, function(k) {
        if (k.textContent.trim().toLowerCase() !== "решение") return;
        var p = k.nextElementSibling;
        if (!p || !p.classList.contains("b-p")) return;
        var wrap = document.createElement("div");
        wrap.className = "b-more";
        var body = document.createElement("div");
        body.className = "b-more-body";
        var inner = document.createElement("div");
        inner.className = "b-more-in";
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "b-more-btn";
        btn.setAttribute("aria-expanded", "false");
        btn.innerHTML = '<span>Читать решение</span><i aria-hidden="true"></i>';
        k.parentNode.insertBefore(wrap, k);
        inner.appendChild(k);
        inner.appendChild(p);
        body.appendChild(inner);
        wrap.appendChild(btn);
        wrap.appendChild(body);
        btn.addEventListener("click", function() {
            var open = wrap.classList.toggle("open");
            btn.setAttribute("aria-expanded", open ? "true" : "false");
            btn.querySelector("span").textContent = open ? "Свернуть решение" : "Читать решение";
        });
    });
})();
