<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('toolhub:prune-temp')->hourly();
