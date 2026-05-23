(function () {
    'use strict';

    var SCRIPT_URL =
        'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';

    var SHOPIFY_DOMAIN = 'qnkbbb-ns.myshopify.com';
    var STOREFRONT_ACCESS_TOKEN = 'ce079be6850e4ce232f2ed2b6d7b4a9f';
    var PRODUCT_ID = '7698732941389';
    var MONEY_FORMAT = '%24%7B%7Bamount%7D%7D';

    var MOUNT_IDS = [
        'shopify-buy-hero',
        'shopify-buy-science',
        'shopify-buy-before-ingredients',
        'shopify-buy-ext-cta',
        'shopify-buy-cta'
    ];

    var BUTTON_STYLES = {
        'background-color': '#D4AF37',
        'color': '#ffffff',
        'font-family': '"Noto Serif JP", serif',
        'font-size': '16px',
        'font-weight': '500',
        'letter-spacing': '0.12em',
        'padding': '16px 40px',
        'border': 'none',
        'border-radius': '4px',
        'box-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
        'cursor': 'pointer',
        'transition': 'background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease',
        ':hover': {
            'background-color': '#ca8a04',
            'box-shadow': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            'transform': 'translateY(-4px)'
        },
        ':focus': {
            'background-color': '#ca8a04',
            'outline': '2px solid #D4AF37',
            'outline-offset': '2px'
        }
    };

    var LARGE_BUTTON_STYLES = Object.assign({}, BUTTON_STYLES, {
        'font-size': '18px',
        'padding': '20px 64px'
    });

    var LARGE_MOUNT_IDS = {
        'shopify-buy-ext-cta': true,
        'shopify-buy-cta': true
    };

    function getComponentOptions(mountId) {
        var buttonStyles = LARGE_MOUNT_IDS[mountId] ? LARGE_BUTTON_STYLES : BUTTON_STYLES;

        return {
            product: {
                contents: {
                    img: false,
                    title: false,
                    price: false,
                    options: false,
                    quantity: false,
                    quantityIncrement: false,
                    button: true,
                    description: false
                },
                styles: {
                    product: {
                        'max-width': '100%',
                        'margin-left': '0',
                        'margin-bottom': '0'
                    },
                    button: buttonStyles
                },
                text: {
                    button: '今すぐ購入'
                }
            },
            modalProduct: {
                contents: {
                    img: false,
                    imgWithCarousel: true,
                    button: false,
                    buttonWithQuantity: true
                },
                styles: {
                    product: {
                        '@media (min-width: 601px)': {
                            'max-width': '100%',
                            'margin-left': '0px',
                            'margin-bottom': '0px'
                        }
                    }
                },
                text: {
                    button: 'Add to cart'
                }
            },
            cart: {
                text: {
                    total: 'Subtotal',
                    button: 'Checkout'
                },
                popup: false
            },
            toggle: {}
        };
    }

    function createProductComponents(ui) {
        MOUNT_IDS.forEach(function (mountId) {
            var node = document.getElementById(mountId);
            if (!node) return;

            ui.createComponent('product', {
                id: PRODUCT_ID,
                node: node,
                moneyFormat: MONEY_FORMAT,
                options: getComponentOptions(mountId)
            });
        });
    }

    function initShopifyBuy() {
        var client = ShopifyBuy.buildClient({
            domain: SHOPIFY_DOMAIN,
            storefrontAccessToken: STOREFRONT_ACCESS_TOKEN
        });

        ShopifyBuy.UI.onReady(client).then(function (ui) {
            createProductComponents(ui);
        }).catch(function (err) {
            console.error('Shopify Buy Button init failed:', err);
        });
    }

    function loadScript() {
        var script = document.createElement('script');
        script.async = true;
        script.src = SCRIPT_URL;
        script.onload = initShopifyBuy;
        script.onerror = function () {
            console.error('Failed to load Shopify Buy Button SDK');
        };
        (document.getElementsByTagName('head')[0] ||
            document.getElementsByTagName('body')[0]).appendChild(script);
    }

    function bootstrap() {
        if (window.ShopifyBuy && window.ShopifyBuy.UI) {
            initShopifyBuy();
        } else if (window.ShopifyBuy) {
            loadScript();
        } else {
            loadScript();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();
