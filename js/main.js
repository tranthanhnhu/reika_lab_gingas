(function () {
    'use strict';

    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
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
    });
})();
