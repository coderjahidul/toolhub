<?php

declare(strict_types=1);

namespace App\Support;

final class Markdown
{
    public static function toHtml(string $markdown): string
    {
        $markdown = str_replace(["\r\n", "\r"], "\n", trim($markdown));
        if ($markdown === '') {
            return '';
        }

        $blocks = preg_split("/\n{2,}/", $markdown) ?: [];
        $html = [];

        foreach ($blocks as $block) {
            $rendered = self::block(trim($block));
            if ($rendered !== '') {
                $html[] = $rendered;
            }
        }

        return implode("\n", $html);
    }

    private static function block(string $block): string
    {
        if (preg_match('/^(#{1,3})\s+(.+)$/', $block, $match) === 1) {
            $level = strlen($match[1]);
            $tag = $level >= 3 ? 'h3' : 'h2';

            return '<'.$tag.'>'.self::inline($match[2]).'</'.$tag.'>';
        }

        $lines = explode("\n", $block);
        $unordered = array_reduce($lines, fn (bool $ok, string $line) => $ok && str_starts_with(ltrim($line), '- '), true);
        if ($unordered) {
            $items = array_map(
                fn (string $line) => '<li>'.self::inline(substr(ltrim($line), 2)).'</li>',
                $lines,
            );

            return '<ul>'.implode('', $items).'</ul>';
        }

        $ordered = array_reduce(
            $lines,
            fn (bool $ok, string $line) => $ok && preg_match('/^\d+\.\s+/', ltrim($line)) === 1,
            true,
        );
        if ($ordered) {
            $items = array_map(function (string $line) {
                $text = preg_replace('/^\d+\.\s+/', '', ltrim($line)) ?? '';

                return '<li>'.self::inline($text).'</li>';
            }, $lines);

            return '<ol>'.implode('', $items).'</ol>';
        }

        return '<p>'.self::inline(implode(' ', $lines)).'</p>';
    }

    private static function inline(string $text): string
    {
        $escaped = htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        $escaped = preg_replace_callback('/`([^`]+)`/', fn (array $match) => '<code>'.$match[1].'</code>', $escaped) ?? $escaped;
        $escaped = preg_replace('/\*\*([^*]+)\*\*/', '<strong>$1</strong>', $escaped) ?? $escaped;

        return preg_replace_callback('/\[([^\]]+)\]\(([^)]+)\)/', function (array $match) {
            $href = $match[2];
            $safe = str_starts_with($href, '/') || preg_match('#^https?://#', $href) === 1;
            if (! $safe || str_starts_with(strtolower($href), 'javascript:')) {
                return $match[1];
            }

            return '<a href="'.htmlspecialchars($href, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8').'">'.$match[1].'</a>';
        }, $escaped) ?? $escaped;
    }
}
