"""
Remove migration files left behind by deleted Django apps and report references.
"""

from __future__ import annotations

import shutil
from pathlib import Path


DELETED_APPS = ("canvas_integration",)


def main() -> int:
    project_root = Path(__file__).resolve().parents[1]
    deleted_paths: list[Path] = []
    lingering_references: list[Path] = []

    for app_name in DELETED_APPS:
        app_path = project_root / app_name
        if app_path.exists():
            shutil.rmtree(app_path)
            deleted_paths.append(app_path)

    for migration_file in project_root.rglob("migrations/*.py"):
        if migration_file.name == "__init__.py":
            continue
        content = migration_file.read_text(encoding="utf-8")
        if any(app_name in content for app_name in DELETED_APPS):
            lingering_references.append(migration_file)

    print("Deleted app directories:")
    for path in deleted_paths:
        print(f"- {path.relative_to(project_root)}")

    print("Lingering migration references:")
    if lingering_references:
        for path in lingering_references:
            print(f"- {path.relative_to(project_root)}")
        return 1

    print("- none")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
