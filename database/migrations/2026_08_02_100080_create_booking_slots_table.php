<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()
                ->cascadeOnDelete();
            $table->foreignId('court_id')->constrained()
                ->cascadeOnDelete();
            $table->date('booking_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->decimal('price', 10, 2)->nullable();
            $table->timestamps();

            $table->index(['booking_date', 'start_time', 'end_time']);
            $table->index('court_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_slots');
    }
};
