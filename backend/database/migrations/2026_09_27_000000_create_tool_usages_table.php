<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tool_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('tool_slug', 64);
            $table->char('ip_hash', 64);
            $table->unsignedBigInteger('bytes_in')->default(0);
            $table->string('status', 32);
            $table->timestamps();

            $table->index(['ip_hash', 'created_at']);
            $table->index('tool_slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tool_usages');
    }
};
