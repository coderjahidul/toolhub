<?php

namespace App\Console;

use Illuminate\Foundation\Console\ServeCommand as FrameworkServeCommand;

class ServeCommand extends FrameworkServeCommand
{
    /**
     * The built-in server does not inherit php -d flags from `php artisan serve`.
     * Insert them into the child process so uploads are not stuck at the 2M default.
     *
     * @return array<int, string>
     */
    protected function serverCommand()
    {
        $command = parent::serverCommand();

        array_splice($command, 1, 0, [
            '-d', 'upload_max_filesize=25M',
            '-d', 'post_max_size=64M',
            '-d', 'max_execution_time=60',
        ]);

        return $command;
    }
}
