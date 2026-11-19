#!/usr/bin/env python3
"""
Bundle generator for Google AI Studio context.
Extracts pure source code and configuration from Amy FX Pro and Hermes engines,
excluding binaries, build caches, and minified artifacts.
"""
import os
import datetime

def get_core_files():
    assets_root = '/root/Amy-fx-pro/app/src/main/assets'
    files = [
        '/root/Amy-fx-pro/CLAUDE.md',
        '/root/Amy-fx-pro/GEMINI.md',
        '/root/Amy-fx-pro/amy_liquidity_strategy.pine',
        '/root/Amy-fx-pro/package.json',
        '/root/Amy-fx-pro/vercel.json'
    ]

    # APIs
    api_dir = '/root/Amy-fx-pro/api'
    if os.path.exists(api_dir):
        for f in sorted(os.listdir(api_dir)):
            if f.endswith('.js') or f.endswith('.json'):
                files.append(os.path.join(api_dir, f))

    # Main assets root
    for f in ['index.html', 'app.js', 'styles.css', 'home-price-chart.js', 'manual-drawing-tool.js', 'profile-system-settings-v1.js', 'update-checker.js']:
        p = os.path.join(assets_root, f)
        if os.path.isfile(p):
            files.append(p)

    # Mapping app
    mapping_dir = os.path.join(assets_root, 'apps', 'mapping')
    for r, dirs, fnames in os.walk(mapping_dir):
        rel = os.path.relpath(r, assets_root)
        if 'mapping/assets' in rel:
            continue
        for f in sorted(fnames):
            if f.endswith('.min.js') or f.endswith('.bundle.js'):
                continue
            ext = os.path.splitext(f)[1].lower()
            if ext in {'.js', '.html', '.css'}:
                files.append(os.path.join(r, f))

    # Python market data & sentinel engines
    for f in ['amy_context_v432.py', 'hermes_telegram_assistant.py', 'sm_news_fetcher.py', 'realtime_sentinel.py', 'fast_ea_scalper.py']:
        p = os.path.join('/root/amy-market-data', f)
        if os.path.isfile(p):
            files.append(p)

    return [f for f in files if os.path.isfile(f)]

def get_complete_files():
    files = get_core_files()
    assets_root = '/root/Amy-fx-pro/app/src/main/assets'
    extra_apps = ['journal', 'practice', 'market-intel', 'shared']

    for app_name in extra_apps:
        app_dir = os.path.join(assets_root, 'apps', app_name)
        if os.path.exists(app_dir):
            for r, dirs, fnames in os.walk(app_dir):
                for f in sorted(fnames):
                    if f.endswith('.min.js') or f.endswith('.bundle.js'):
                        continue
                    ext = os.path.splitext(f)[1].lower()
                    if ext in {'.js', '.html', '.css'}:
                        files.append(os.path.join(r, f))

    # Deduplicate while preserving order
    seen = set()
    unique_files = []
    for f in files:
        if f not in seen and os.path.isfile(f):
            seen.add(f)
            unique_files.append(f)
    return unique_files

def create_bundle(file_list, output_path, bundle_title):
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S WITA')
    total_bytes = sum(os.path.getsize(f) for f in file_list)
    est_tokens = int(total_bytes / 4)

    header = []
    header.append("=" * 80)
    header.append(f"AMY FX PRO - GOOGLE AI STUDIO INGESTION BUNDLE")
    header.append(f"Bundle Title: {bundle_title}")
    header.append(f"Generated: {timestamp}")
    header.append(f"Total Files: {len(file_list)}")
    header.append(f"Total Size: {total_bytes / 1024:.1f} KB ({total_bytes / (1024*1024):.2f} MB)")
    header.append(f"Estimated Tokens: ~{est_tokens:,} tokens")
    header.append("=" * 80)
    header.append("\nTABLE OF CONTENTS:")
    for idx, fpath in enumerate(file_list, 1):
        rel = fpath.replace('/root/Amy-fx-pro/', '').replace('/root/amy-market-data/', 'market-data-engine/')
        sz = os.path.getsize(fpath) / 1024
        header.append(f"{idx:3d}. [{sz:6.1f} KB] {rel}")
    header.append("\n" + "=" * 80 + "\n\n")

    with open(output_path, 'w', encoding='utf-8') as out:
        out.write('\n'.join(header))
        for idx, fpath in enumerate(file_list, 1):
            rel = fpath.replace('/root/Amy-fx-pro/', '').replace('/root/amy-market-data/', 'market-data-engine/')
            ext = os.path.splitext(fpath)[1].replace('.', '')
            out.write("=" * 80 + "\n")
            out.write(f"FILE #{idx}: {rel}\n")
            out.write(f"FULL_PATH: {fpath}\n")
            out.write(f"SYNTAX: {ext}\n")
            out.write("=" * 80 + "\n\n")
            try:
                with open(fpath, 'r', encoding='utf-8', errors='replace') as src:
                    out.write(src.read())
            except Exception as e:
                out.write(f"/* ERROR READING FILE: {e} */\n")
            out.write("\n\n" + "-" * 80 + "\n\n")

    print(f"Bundle created successfully: {output_path}")
    print(f"  Files: {len(file_list)} | Size: {total_bytes / 1024:.1f} KB | Est Tokens: ~{est_tokens:,}")

if __name__ == '__main__':
    dl_dir = '/sdcard/Download/ADM'
    os.makedirs(dl_dir, exist_ok=True)

    # 1. Cockpit & Trading Bundle (Fast & Focused)
    core = get_core_files()
    core_out = os.path.join(dl_dir, 'amy-fx-pro-cockpit-trading-bundle.txt')
    create_bundle(core, core_out, "Core Trading Engine & Cockpit Mapping")

    # 2. Complete Ecosystem Bundle
    complete = get_complete_files()
    comp_out = os.path.join(dl_dir, 'amy-fx-pro-complete-bundle.txt')
    create_bundle(complete, comp_out, "Complete App Ecosystem (Mapping, Journal, Practice, Shared, Engines)")
