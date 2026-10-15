<?php

return [

    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),

    'daily_limit' => (int) env('TOOL_DAILY_LIMIT', 20),

    'image_max_kb' => (int) env('TOOL_IMAGE_MAX_KB', 10240),

    'pdf_max_kb' => (int) env('TOOL_PDF_MAX_KB', 20480),

    'pdf_max_files' => (int) env('TOOL_PDF_MAX_FILES', 10),

    'pdf_max_pages' => (int) env('TOOL_PDF_MAX_PAGES', 200),

    'timeout_seconds' => (int) env('TOOL_TIMEOUT_SECONDS', 60),

    'max_edge_px' => 10000,

    'ghostscript_binary' => env('GS_BINARY', 'gs'),

];
