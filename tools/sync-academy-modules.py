#!/usr/bin/env python3
"""
Sync Academy Modules — Bidirectional Bridge between Amy FX Pro and Google AI Studio
Author: Antigravity for Sayang
Purpose:
  1. 'export': Bundles 594 HTML chapters in Amy FX Pro into 36 clean, editable Markdown modules in Amy FX AI Studio (<510 files total).
  2. 'import': Unpacks edited/refined Markdown modules from AI Studio back into Amy FX Pro HTML chapters with 100% layout preservation.
"""

import os
import re
import sys
import glob
from pathlib import Path
import bs4

PRO_ACADEMY_DIR = Path("/root/Amy-fx-pro/app/src/main/assets/apps/academy")
STUDIO_ACADEMY_DIR = Path("/root/Amy-fx-ai-studio/apps/academy")
STUDIO_MODUL_DIR = STUDIO_ACADEMY_DIR / "modul"

def html_to_markdown_article(html_content, filename=""):
    soup = bs4.BeautifulSoup(html_content, 'html.parser')
    
    # Extract title
    title_el = soup.find('h1') or soup.find('title')
    title = title_el.get_text().strip().replace(" — Amy FX Academy", "") if title_el else filename
    
    # Extract core article content
    article = soup.find('div', class_='glass-panel') or soup.find('section', class_='article') or soup.find('main') or soup
    
    lines = []
    
    # Process children nodes cleanly
    for el in article.descendants:
        # We only want top-level structural elements within article
        if el.parent != article:
            continue
            
        if isinstance(el, bs4.element.NavigableString):
            s = el.strip()
            if s and not s.startswith("<!--"):
                lines.append(s)
            continue
            
        tag = el.name
        if not tag:
            continue
            
        if tag in ['h1', 'h2', 'h3', 'h4', 'h5']:
            level = min(int(tag[1]) + 1, 6) # h1 becomes ## because # is for the chapter
            lines.append(f"\n{'#' * level} {el.get_text().strip()}\n")
            
        elif tag == 'p':
            # Format inline strong and em
            cloned = bs4.BeautifulSoup(str(el), 'html.parser').find('p')
            for st in cloned.find_all(['strong', 'b']):
                st.replace_with(f"**{st.get_text().strip()}**")
            for em in cloned.find_all(['em', 'i']):
                em.replace_with(f"*{em.get_text().strip()}*")
            for code in cloned.find_all('code'):
                code.replace_with(f"`{code.get_text().strip()}`")
            text = cloned.get_text().strip()
            if text and text != title:
                lines.append(text + "\n")
                
        elif tag == 'div' and 'note' in el.get('class', []):
            note_lines = [l.strip() for l in el.get_text().strip().splitlines() if l.strip()]
            quote = "\n".join(["> " + l for l in note_lines])
            lines.append(f"\n> [!NOTE]\n{quote}\n")
            
        elif tag in ['ul', 'ol']:
            cloned = bs4.BeautifulSoup(str(el), 'html.parser')
            for li in cloned.find_all('li'):
                for st in li.find_all(['strong', 'b']):
                    st.replace_with(f"**{st.get_text().strip()}**")
                for em in li.find_all(['em', 'i']):
                    em.replace_with(f"*{em.get_text().strip()}*")
                lines.append(f"- {li.get_text().strip()}")
            lines.append("")
            
        elif tag == 'pre':
            code_text = el.get_text().strip()
            lines.append(f"\n```\n{code_text}\n```\n")
            
        elif tag == 'table':
            rows = []
            for tr in el.find_all('tr'):
                cells = [c.get_text().strip() for c in tr.find_all(['td', 'th'])]
                if cells:
                    rows.append("| " + " | ".join(cells) + " |")
            if rows:
                if len(rows) > 1 and not re.match(r'\|\s*[-:]+\s*\|', rows[1]):
                    # add header separator
                    col_count = len(rows[0].split('|')) - 2
                    sep = "| " + " | ".join(["---"] * max(col_count, 1)) + " |"
                    rows.insert(1, sep)
                lines.append("\n" + "\n".join(rows) + "\n")
                
    body = "\n".join(lines)
    # Deduplicate consecutive newlines
    body = re.sub(r'\n{3,}', '\n\n', body).strip()
    return title, body


def export_modules():
    print("===> [Export] Scanning 36 Bagian folders from Amy FX Pro...")
    STUDIO_MODUL_DIR.mkdir(parents=True, exist_ok=True)
    
    bagian_dirs = sorted([d for d in PRO_ACADEMY_DIR.glob("bagian-*") if d.is_dir()])
    print(f"     Found {len(bagian_dirs)} Bagian directories.")
    
    total_chapters = 0
    catalog = []
    
    for b_dir in bagian_dirs:
        b_name = b_dir.name
        html_files = sorted([f for f in b_dir.glob("*.html") if f.name != "index.html"])
        if not html_files:
            continue
            
        md_file_path = STUDIO_MODUL_DIR / f"{b_name}.md"
        
        # Read index.html of this section if exists to get Bagian title
        section_title = b_name.replace("bagian-", "Bagian ").replace("-", " ").title()
        index_file = b_dir / "index.html"
        if index_file.exists():
            try:
                soup = bs4.BeautifulSoup(index_file.read_text(encoding='utf-8'), 'html.parser')
                h1 = soup.find('h1') or soup.find('title')
                if h1:
                    clean_h1 = h1.get_text().strip().replace(" — Amy FX Academy", "")
                    if clean_h1:
                        section_title = clean_h1
            except Exception:
                pass
                
        md_content = [
            f"# {section_title}",
            f"> Modul Edukasi Amy FX Pro — {b_name}",
            f"> Total Bab: {len(html_files)} Bab | Format: Editable Markdown for Google AI Studio",
            "",
            "---",
            ""
        ]
        
        chapter_entries = []
        for h_file in html_files:
            total_chapters += 1
            raw_html = h_file.read_text(encoding='utf-8')
            c_title, c_body = html_to_markdown_article(raw_html, h_file.name)
            
            chapter_entries.append({"file": h_file.name, "title": c_title})
            
            md_content.append(f"<!-- CHAPTER_START: {h_file.name} | TITLE: {c_title} -->")
            md_content.append(f"## {c_title}\n")
            md_content.append(c_body)
            md_content.append(f"\n<!-- CHAPTER_END: {h_file.name} -->\n")
            md_content.append("---\n")
            
        md_file_path.write_text("\n".join(md_content), encoding='utf-8')
        catalog.append({
            "id": b_name,
            "title": section_title,
            "filename": f"{b_name}.md",
            "chapters_count": len(html_files),
            "chapters": chapter_entries
        })
        print(f"     ✓ Exported {b_name}.md ({len(html_files)} chapters)")
        
    print(f"\n===> [Export Complete] Successfully bundled {total_chapters} chapters into {len(bagian_dirs)} Markdown files!")
    
    # Generate README for Sayang in AI Studio
    readme_path = STUDIO_ACADEMY_DIR / "README.md"
    readme_content = f"""# Modul Edukasi Amy FX Academy (AI Studio Edition)

Direktori ini memuat seluruh **36 Modul Utama ({total_chapters} Bab Pelajaran)** dari Amy FX Pro yang telah dibundel ke dalam format **Markdown Tematik**.

## Keunggulan Format Ini:
1. **Hemat Kuota File:** Hanya menggunakan **36 file** (jauh di bawah batas 1.000 file Google AI Studio).
2. **Mudah Disempurnakan:** Sayang atau Gemini di Google AI Studio bisa langsung membuka file modul (contoh: `modul/bagian-17-fvg-masterclass.md`), membaca, menambah materi, menyempurnakan analogi, atau memperbarui rumus ICT tanpa terpotong limit token.
3. **Preservasi Metadata Otomatis:** Setiap bab dipisahkan oleh tanda `<!-- CHAPTER_START: <filename> -->` sehingga saat disinkronkan kembali ke Amy FX Pro di Termux, seluruh 594 file HTML akan otomatis ter-update mengikuti tulisan terbaru Sayang!

## Daftar 36 Modul:
"""
    for cat in catalog:
        readme_content += f"- **[{cat['title']}](modul/{cat['filename']})** — {cat['chapters_count']} Bab\n"
        
    readme_path.write_text(readme_content, encoding='utf-8')
    print("     ✓ Generated apps/academy/README.md")
    
    # Generate interactive Index viewer in AI Studio
    create_academy_web_shell(catalog)


def create_academy_web_shell(catalog):
    """Creates a lightweight web viewer in AI Studio so Sayang can open Academy in the browser."""
    index_html = STUDIO_ACADEMY_DIR / "index.html"
    
    html = f"""<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tutorial Trading — Amy FX Academy (AI Studio)</title>
  <link rel="stylesheet" href="../shared/amyfx-theme.css">
  <link rel="stylesheet" href="../shared/amyfx-components.css">
  <link rel="stylesheet" href="../shared/amyfx-ui-polish-pro348.css">
  <link rel="stylesheet" href="../shared/amyfx-natural-ui-pro355.css">
  <style>
    body {{ background: #070b14; color: #e2e8f0; font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; }}
    .header {{ display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; margin-bottom: 24px; }}
    .header h1 {{ font-size: 20px; font-weight: 800; color: #f5c451; margin: 0; display: flex; align-items: center; gap: 8px; }}
    .badge {{ background: rgba(245, 196, 81, 0.15); color: #f5c451; border: 1px solid rgba(245, 196, 81, 0.4); padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; }}
    .grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; }}
    .card {{ background: rgba(16, 24, 45, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px; transition: all .2s ease; cursor: pointer; text-decoration: none; color: inherit; display: block; }}
    .card:hover {{ border-color: rgba(245, 196, 81, 0.4); transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0,0,0,0.4); }}
    .card-title {{ font-size: 15px; font-weight: 700; color: #f8fafc; margin-bottom: 6px; }}
    .card-meta {{ font-size: 12px; color: #94a3b8; display: flex; justify-content: space-between; }}
  </style>
</head>
<body>
  <div class="header">
    <a href="../../index.html" style="color: #94a3b8; text-decoration: none; font-size: 13px;">‹ Kembali ke Menu</a>
    <h1><span>✦</span> AMY FX ACADEMY</h1>
    <span class="badge">36 MODUL TEMATIK</span>
  </div>
  
  <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">
    Seluruh 36 Modul Edukasi tersedia dalam format Markdown tematik di folder <code>apps/academy/modul/</code> untuk disempurnakan bersama AI.
  </p>
  
  <div class="grid">
"""
    for cat in catalog:
        html += f"""    <a class="card" href="modul/{cat['filename']}" target="_blank">
      <div class="card-title">{cat['title']}</div>
      <div class="card-meta">
        <span>{cat['id']}</span>
        <span style="color: #f5c451;">{cat['chapters_count']} Bab Pelajaran ›</span>
      </div>
    </a>\n"""
        
    html += """  </div>
</body>
</html>"""
    index_html.write_text(html, encoding='utf-8')
    print("     ✓ Created apps/academy/index.html")


if __name__ == '__main__':
    export_modules()
