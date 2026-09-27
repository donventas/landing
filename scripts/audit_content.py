"""Report visible word weight and heading structure by landing section."""

from html.parser import HTMLParser
from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]


class SectionAudit(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.sections = []
        self.current = None
        self.heading = None
        self.skip = 0

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in {"script", "style", "svg"}:
            self.skip += 1
        if tag in {"header", "section"}:
            record = {"id": attrs.get("id", "hero" if tag == "header" else "unnamed"), "text": [], "headings": []}
            self.sections.append(record)
            self.stack.append(self.current)
            self.current = record
        if self.current is not None and tag in {"h1", "h2", "h3"}:
            self.heading = {"tag": tag, "parts": []}

    def handle_endtag(self, tag):
        if tag in {"script", "style", "svg"} and self.skip:
            self.skip -= 1
        if self.current is not None and self.heading is not None and tag == self.heading["tag"]:
            text = " ".join(self.heading["parts"])
            self.current["headings"].append((self.heading["tag"], text))
            self.heading = None
        if tag in {"header", "section"} and self.current is not None:
            self.current = self.stack.pop() if self.stack else None

    def handle_data(self, data):
        if self.skip or self.current is None:
            return
        value = re.sub(r"\s+", " ", data).strip()
        if not value:
            return
        self.current["text"].append(value)
        if self.heading is not None:
            self.heading["parts"].append(value)


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    audit = SectionAudit()
    audit.feed((ROOT / "index.html").read_text(encoding="utf-8"))
    total = 0
    for section in audit.sections:
        words = len(" ".join(section["text"]).split())
        total += words
        headings = " | ".join(f"{tag}:{text}" for tag, text in section["headings"])
        print(f"{section['id']:<12} {words:>4} words  {headings}")
    print(f"{'TOTAL':<12} {total:>4} words")


if __name__ == "__main__":
    main()
