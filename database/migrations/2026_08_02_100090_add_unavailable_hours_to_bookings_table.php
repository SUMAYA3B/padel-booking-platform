<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            // يخزّن (JSON) الأوقات التي كان العميل قد اختارها لكنها كانت
            // محجوزة مسبقاً، عندما يُنفَّذ الحجز متعدد السلات مع الاستمرار
            // بحجز الأوقات المتاحة فقط.
            $table->json('unavailable_hours')->nullable()->after('notes');
            // مجموع الأيام التي شملها الحجز (تجميعي للملخصات).
            $table->unsignedTinyInteger('total_hours')->nullable()->after('unavailable_hours');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['unavailable_hours', 'total_hours']);
        });
    }
};
