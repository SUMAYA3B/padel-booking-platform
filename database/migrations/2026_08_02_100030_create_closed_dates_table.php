<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('closed_dates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('court_id')->nullable()->constrained()->cascadeOnDelete(); // null = all courts
            $table->date('date');
            $table->string('reason')->nullable();
            $table->timestamps();

            $table->unique(['court_id', 'date']);
            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('closed_dates');
    }
};
