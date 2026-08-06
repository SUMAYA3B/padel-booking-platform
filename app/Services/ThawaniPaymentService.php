<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\ThawaniPayment;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;

class ThawaniPaymentService
{
    private string $secretKey;
    private string $publishableKey;
    private string $apiUrl;
    private string $checkoutUrl;
    private string $frontendUrl;

    public function __construct()
    {
        $this->secretKey = (string) Config::get('thawani.secret_key');
        $this->publishableKey = (string) Config::get('thawani.publishable_key');
        $this->apiUrl = (string) Config::get('thawani.api_url');
        $this->checkoutUrl = (string) Config::get('thawani.checkout_url');
        $this->frontendUrl = rtrim((string) Config::get('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/');

        $this->ensureStageMode();
    }

    /**
     * Stage/UAT safety guard — mirrors the reference thawani-payment project.
     * Blocks accidental use of production endpoints until explicitly enabled.
     */
    private function ensureStageMode(): void
    {
        if ((bool) Config::get('thawani.stage_only', true) === false) {
            throw new \RuntimeException('Thawani integration is configured for non-stage mode, which is blocked by this app.');
        }

        if (! str_contains($this->apiUrl, 'uatcheckout.thawani.om')) {
            throw new \RuntimeException('Thawani API URL is not a stage endpoint.');
        }
    }

    /**
     * Create a Thawani payment session for a booking.
     *
     * @return array{session_id: string, payment_url: string}
     */
    public function createSession(Booking $booking): array
    {
        $amountBaisa = (int) round($booking->final_price * 1000);
        $sessionRef = 'SESS-' . strtoupper(substr(uniqid(), -8));

        $response = Http::timeout(30)
            ->withHeaders([
                'thawani-api-key' => $this->secretKey,
                'Content-Type' => 'application/json',
            ])
            ->post($this->apiUrl . '/api/v1/checkout/session', [
                'client_reference_id' => $booking->booking_number,
                'mode' => 'payment',
                'products' => [
                    [
                        'name' => 'حجز ملعب بادل - ' . $booking->booking_number,
                        'quantity' => 1,
                        'unit_amount' => $amountBaisa,
                    ],
                ],
                'success_url' => $this->frontendUrl . '/payment/success?ref=' . $booking->booking_number,
                'cancel_url' => $this->frontendUrl . '/payment/cancel?ref=' . $booking->booking_number,
            ]);

        if (! $response->successful()) {
            throw new \RuntimeException(
                'فشل إنشاء جلسة الدفع: ' . ($response->json('detail') ?? $response->body()),
                502
            );
        }

        $payload = $response->json();
        $sessionId = $payload['data']['session_id'] ?? $sessionRef;

        // Persist the payment session
        ThawaniPayment::create([
            'booking_id' => $booking->id,
            'session_id' => $sessionId,
            'amount' => $booking->final_price,
            'status' => ThawaniPayment::STATUS_PENDING,
        ]);

        $booking->update(['thawani_session_id' => $sessionId]);

        // Thawani hosted checkout page requires the publishable key as a query param.
        $paymentUrl = $this->checkoutUrl . '/' . $sessionId;

        if ($this->publishableKey !== '') {
            $paymentUrl .= '?key=' . urlencode($this->publishableKey);
        }

        return [
            'session_id' => $sessionId,
            'payment_url' => $paymentUrl,
        ];
    }

    /**
     * Verify a payment session and update the booking accordingly.
     */
    public function verifySession(string $sessionId): array
    {
        $response = Http::timeout(30)
            ->withHeaders(['thawani-api-key' => $this->secretKey])
            ->get($this->apiUrl . '/api/v1/checkout/session/' . $sessionId);

        if (! $response->successful()) {
            throw new \RuntimeException('فشل التحقق من جلسة الدفع.', 502);
        }

        $data = $response->json('data') ?? [];
        $payment = ThawaniPayment::where('session_id', $sessionId)->with('booking')->first();

        if (! $payment) {
            return ['success' => false, 'status' => 'not_found'];
        }

        $paymentStatus = $data['payment_status'] ?? null;

        if ($paymentStatus === 'paid') {
            $payment->markAsPaid([
                'transaction_id' => $data['transaction_id'] ?? null,
                'payment_method' => $data['payment_method'] ?? null,
            ]);
            $payment->booking->markAsPaid($data['transaction_id'] ?? null);

            return [
                'success' => true,
                'booking_number' => $payment->booking->booking_number,
                'status' => 'paid',
            ];
        }

        if (in_array($paymentStatus, ['failed', 'cancelled'], true)) {
            $payment->markAsFailed();
            $payment->booking->markAsCancelled('فشل الدفع عبر ثواني');

            return [
                'success' => false,
                'booking_number' => $payment->booking->booking_number,
                'status' => $paymentStatus,
            ];
        }

        return ['success' => false, 'status' => 'pending'];
    }

    /**
     * Get the session_id from a Thawani webhook or callback payload.
     *
     * @param array $payload
     */
    public function extractSessionId(array $payload): ?string
    {
        return $payload['session_id']
            ?? $payload['data']['session_id'] ?? null;
    }

    /**
     * Handle a Thawani webhook that notifies us about a payment result.
     *
     * @param array<string, mixed> $payload
     * @return array{bokking_number?: string, success: bool, status: string}
     */
    public function handleWebhook(array $payload): array
    {
        $sessionId = $this->extractSessionId($payload);

        if (! $sessionId) {
            return ['success' => false, 'status' => 'invalid_payload'];
        }

        return $this->verifySession($sessionId);
    }
}

