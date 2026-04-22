(function () {
    'use strict';

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }

    /** Horizontal drag-to-scroll on desktop; touch remains native */
    function attachHorizontalDragScroll(el) {
        if (!el) return;

        // Prevent native element dragging (image ghost drag)
        el.addEventListener('dragstart', function (e) {
            e.preventDefault();
        });

        var startClientX = 0;
        var startScroll = 0;
        var isDown = false;
        var activePointerId = null;

        function endDrag() {
            if (!isDown) return;
            isDown = false;
            el.classList.remove('is-dragging');
            if (activePointerId !== null && el.releasePointerCapture) {
                try {
                    el.releasePointerCapture(activePointerId);
                } catch (err) { /* noop */ }
            }
            activePointerId = null;
        }

        // Prefer Pointer Events (mouse/touch/pen)
        if (window.PointerEvent) {
            el.addEventListener('pointerdown', function (e) {
                if (e.pointerType === 'mouse' && e.button !== 0) return;
                isDown = true;
                activePointerId = e.pointerId;
                startClientX = e.clientX;
                startScroll = el.scrollLeft;
                // Disable snap while dragging for a consistent feel
                el.classList.add('is-dragging');
                if (el.setPointerCapture) {
                    try {
                        el.setPointerCapture(e.pointerId);
                    } catch (err) { /* noop */ }
                }
                // Prevent text selection on desktop
                if (e.pointerType === 'mouse') {
                    e.preventDefault();
                }
            });

            el.addEventListener('pointermove', function (e) {
                if (!isDown) return;
                if (activePointerId !== null && e.pointerId !== activePointerId) return;
                var dx = e.clientX - startClientX;
                // Always track dx; snap is already disabled on pointerdown
                el.scrollLeft = startScroll - dx;
                if (Math.abs(dx) > 0) e.preventDefault();
            });

            el.addEventListener('pointerup', endDrag);
            el.addEventListener('pointercancel', endDrag);
            el.addEventListener('lostpointercapture', endDrag);
            el.addEventListener('pointerleave', function () {
                // End drag when leaving the strip
                endDrag();
            });
            return;
        }

        // Fallback for older browsers (Mouse Events)
        el.addEventListener('mousedown', function (e) {
            if (e.button !== 0) return;
            isDown = true;
            startClientX = e.clientX;
            startScroll = el.scrollLeft;
            e.preventDefault();
        });
        window.addEventListener('mousemove', function (e) {
            if (!isDown) return;
            var dx = e.clientX - startClientX;
            if (Math.abs(dx) > 2) {
                el.classList.add('is-dragging');
                el.scrollLeft = startScroll - dx;
            }
        });
        window.addEventListener('mouseup', endDrag);
    }

    document.addEventListener('DOMContentLoaded', function () {
        var fadeElements = document.querySelectorAll('.fade-in');
        var observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
        var fadeObserver = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    obs.unobserve(entry.target);
                }
            });
        }, observerOptions);
        fadeElements.forEach(function (el) {
            fadeObserver.observe(el);
        });

        var faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(function (item) {
            item.addEventListener('click', function () {
                faqItems.forEach(function (otherItem) {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                item.classList.toggle('active');
            });
        });

        var navLogo = document.getElementById('nav-logo');
        if (navLogo) {
            navLogo.addEventListener('click', function () {
                scrollToTop();
            });
        }

        var navCta = document.getElementById('nav-cta');
        if (navCta) {
            navCta.addEventListener('click', function () {
                var cta = document.getElementById('cta-section');
                if (cta) {
                    cta.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
                }
            });
        }

        var backToTop = document.getElementById('back-to-top');
        if (backToTop) {
            backToTop.addEventListener('click', scrollToTop);
            var toggleBackTop = function () {
                if (window.scrollY > 400) {
                    backToTop.classList.add('is-visible');
                } else {
                    backToTop.classList.remove('is-visible');
                }
            };
            toggleBackTop();
            window.addEventListener('scroll', toggleBackTop, { passive: true });
        }

        var slider = document.getElementById('review-slider');
        var dotsContainer = document.getElementById('slider-dots');
        if (slider && dotsContainer) {
            var slides = slider.querySelectorAll('.review-slide');
            var dots = [];
            var activeIndex = 0;

            function setActiveDot(index) {
                if (index === activeIndex || index < 0 || index >= dots.length) return;
                activeIndex = index;
                for (var i = 0; i < dots.length; i++) {
                    dots[i].classList.toggle('active', i === index);
                }
            }

            var thresholds = [];
            for (var t = 0; t <= 40; t++) {
                thresholds.push(t / 40);
            }

            var slideRatios = new Map();
            slides.forEach(function (slide, i) {
                slideRatios.set(slide, 0);
                var dot = document.createElement('button');
                dot.type = 'button';
                dot.className = 'slider-dot';
                dot.setAttribute('aria-label', 'レビュー ' + (i + 1));
                if (i === 0) {
                    dot.classList.add('active');
                }
                (function (idx) {
                    dot.addEventListener('click', function () {
                        slides[idx].scrollIntoView({
                            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
                            block: 'nearest',
                            inline: 'center'
                        });
                    });
                })(i);
                dotsContainer.appendChild(dot);
                dots.push(dot);
            });

            var io = new IntersectionObserver(
                function (entries) {
                    entries.forEach(function (e) {
                        slideRatios.set(e.target, e.intersectionRatio);
                    });
                    requestAnimationFrame(function () {
                        var bestIdx = 0;
                        var bestRatio = -1;
                        slides.forEach(function (slide, i) {
                            var r = slideRatios.get(slide) || 0;
                            if (r > bestRatio) {
                                bestRatio = r;
                                bestIdx = i;
                            }
                        });
                        if (bestRatio > 0) {
                            setActiveDot(bestIdx);
                        }
                    });
                },
                { root: slider, rootMargin: '0px', threshold: thresholds }
            );

            slides.forEach(function (slide) {
                io.observe(slide);
            });
        }

        if (slider) {
            attachHorizontalDragScroll(slider);
            slider.addEventListener('keydown', function (e) {
                var step = Math.round(slider.clientWidth * 0.4);
                if (e.key === 'ArrowLeft') {
                    slider.scrollLeft -= step;
                    e.preventDefault();
                } else if (e.key === 'ArrowRight') {
                    slider.scrollLeft += step;
                    e.preventDefault();
                }
            });
        }

        var ctaStrips = document.querySelectorAll('.cta-strip');
        ctaStrips.forEach(function (ctaStrip) {
            attachHorizontalDragScroll(ctaStrip);
            ctaStrip.addEventListener('keydown', function (e) {
                var step = Math.round(ctaStrip.clientWidth * 0.35);
                if (e.key === 'ArrowLeft') {
                    ctaStrip.scrollLeft -= step;
                    e.preventDefault();
                } else if (e.key === 'ArrowRight') {
                    ctaStrip.scrollLeft += step;
                    e.preventDefault();
                }
            });
        });

        // Add-only: extended horizontal scroll strips
        var extScrollEls = document.querySelectorAll('[data-hscroll]');
        extScrollEls.forEach(function (el) {
            attachHorizontalDragScroll(el);
            el.addEventListener('keydown', function (e) {
                var step = Math.round(el.clientWidth * 0.35);
                if (e.key === 'ArrowLeft') {
                    el.scrollLeft -= step;
                    e.preventDefault();
                } else if (e.key === 'ArrowRight') {
                    el.scrollLeft += step;
                    e.preventDefault();
                }
            });
        });

        // Add-only: autoplay video fallback
        var autoplayVideos = document.querySelectorAll('[data-autoplay-video]');
        autoplayVideos.forEach(function (video) {
            if (!video || typeof video.play !== 'function') return;
            var p = video.play();
            if (p && typeof p.catch === 'function') {
                p.catch(function () {
                    try {
                        video.pause();
                        video.controls = true;
                    } catch (err) { /* noop */ }
                });
            }

        // iOS may block autoplay; ensure tap/click can still play
            var tryPlay = function () {
                try {
                    var pp = video.play();
                    if (pp && typeof pp.catch === 'function') {
                        pp.catch(function () {
                            try { video.controls = true; } catch (err) { /* noop */ }
                        });
                    }
                } catch (err) { /* noop */ }
            };
            video.addEventListener('click', tryPlay);
            video.addEventListener('touchend', tryPlay, { passive: true });
        });
    });
})();
