// components/site-footer.tsx
import Link from "next/link";

const AUTHOR_NAME = "L.A Developer";
const AUTHOR_EMAIL = "leoalmada-dev@gmail.com";

export default function SiteFooter() {
    return (
        <footer className="mt-8 border-t border-neutral-900 bg-neutral-950 text-neutral-300">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs sm:flex-row">
                <span className="text-neutral-400">
                    © {new Date().getFullYear()} Pantera mini mayorista.
                </span>

                <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] sm:text-xs">
                    <span>
                        Desarrollado por{" "}
                        <span className="font-medium text-neutral-50">
                            {AUTHOR_NAME}
                        </span>
                    </span>

                    <a
                        href={`mailto:${AUTHOR_EMAIL}`}
                        className="underline underline-offset-2 hover:text-neutral-100"
                    >
                        Contacto
                    </a>

                    <Link
                        href="/sobre-el-desarrollo"
                        className="underline underline-offset-2 hover:text-neutral-100"
                    >
                        Sobre el desarrollo
                    </Link>
                </div>
            </div>
        </footer>
    );
}
