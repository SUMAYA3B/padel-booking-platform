<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Thawani Payment Gateway
    |--------------------------------------------------------------------------
    |
    | sandbox keys are used by default. Replace with production keys in the
    | production environment via the .env file.
    |
    */

    'secret_key' => env('THAWANI_SECRET_KEY', 'test_secret_key'),
    'publishable_key' => env('THAWANI_PUBLISHABLE_KEY', 'test_publishable_key'),

    // الوضع: 'sandbox' (للاختبار) أو 'production' (للإنتاج الحقيقي)
    'mode' => env('THAWANI_MODE', 'sandbox'),

    // حارس الأمان: يمنع الاتصال ببيئة الإنتاج ما لم يُفعَّل صراحةً
    // (نفس سلوك مشروع thawani-payment المرجعي)
    'stage_only' => env('THAWANI_STAGE_ONLY', env('THAWANI_MODE', 'sandbox') !== 'production'),

    // نقاط الاتصال تُختار تلقائياً حسب الوضع، ويمكن تخصيصها عبر الـ env
    'api_url' => env('THAWANI_API_URL', env('THAWANI_MODE', 'sandbox') === 'production'
        ? 'https://checkout.thawani.om'
        : 'https://uatcheckout.thawani.om'),

    'checkout_url' => env('THAWANI_CHECKOUT_URL', env('THAWANI_MODE', 'sandbox') === 'production'
        ? 'https://checkout.thawani.om/pay'
        : 'https://uatcheckout.thawani.om/pay'),

    'webhook_secret' => env('THAWANI_WEBHOOK_SECRET'),
];
